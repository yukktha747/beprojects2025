from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, permission_required
from .forms import SignupForm
from .models import CustomUser, Message, BullyingDetectionDocument, EncryptedReport
from django.shortcuts import render
from django.contrib import messages
from django.db.models import Q 
from django.utils import timezone
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.models import User
from .utils.bullying_model import process_images
from .utils.generation import load_public_key
import os
import uuid, time
from django.core.mail import EmailMessage
from cryptography.hazmat.primitives.ciphers import algorithms
from django.http import FileResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required, user_passes_test
from cryptography.hazmat.primitives.asymmetric import rsa
import logging
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
from .utils.crypto_utils import rsa_decrypt_key, aes_decrypt_file, verify_sha256
from .utils.text import classify_bullying_text
from .utils.videp import process_video_for_bullying


def detect_bullying_in_text(content):
    # List of keywords that might indicate bullying
    bullying_keywords = ['stupid', 'idiot', 'hate', 'loser', 'dumb', 'ugly']
    
    # Convert content to lowercase to ensure case-insensitive comparison
    content = content.lower()

    # Check if any bullying keyword is present in the content
    for keyword in bullying_keywords:
        if keyword in content:
            return True
    return False

# Setup logger
logger = logging.getLogger(__name__)

def load_public_key():
    public_key_path = os.path.join(settings.BASE_DIR, 'public_key.pem')  # Adjust path as needed
    if not os.path.exists(public_key_path):
        raise FileNotFoundError(f"Public key file not found at {public_key_path}")
    
    with open(public_key_path, 'rb') as f:
        public_key = serialization.load_pem_public_key(f.read())
    return public_key
# Function to generate a PDF report
def generate_pdf(report):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    # Add basic information
    pdf.drawString(100, 750, f"Sender ID: {report.get('sender_id', 'N/A')}")
    pdf.drawString(100, 730, f"Receiver ID: {report.get('receiver_id', 'N/A')}")
    pdf.drawString(100, 710, f"Timestamp: {report.get('timestamp', 'N/A')}")
    pdf.drawString(100, 690, "Content:")

    # Add content (text)
    content = report.get('content', '')
    if content:
        y_position = 670  # Start position for the content
        line_length = 80  # Max number of characters per line (adjust based on page width)

        # Split content into lines of appropriate length
        words = content.split()
        line = ''
        for word in words:
            # Check if adding the word would exceed the line length
            if len(line + ' ' + word) <= line_length:
                line += ' ' + word
            else:
                pdf.drawString(100, y_position, line.strip())  # Print the current line
                y_position -= 20  # Move down after each line
                if y_position < 50:  # If we reach the bottom of the page, start a new page
                    pdf.showPage()
                    y_position = 750  # Reset position on the new page
                    pdf.drawString(100, y_position, "Content:")  # Print the content heading again
                    y_position -= 20  # Move down after heading
                line = word  # Start a new line with the current word

        # Print any remaining content in the last line
        if line:
            pdf.drawString(100, y_position, line.strip())
            y_position -= 20


    # Add image (if available)
    image_path = report.get('file_path', None)
    if image_path and os.path.exists(image_path):
        try:
            image_width, image_height = 200, 200  # Resize image if necessary
            image_y_position = y_position - 300  # Add some margin before the image

            # Check if image will fit on the page
            if image_y_position - image_height < 50:
                pdf.showPage()  # Start a new page if the image doesn't fit
                image_y_position = 750  # Reset image position on the new page

            # Draw the image on the PDF
            pdf.drawImage(image_path, 100, image_y_position, width=image_width, height=image_height)
            pdf.drawString(100, image_y_position - 20, f"Image: {os.path.basename(image_path)}")  # Add image filename if desired

            # Update y_position after the image is added
            y_position = image_y_position - image_height - 30  # Adjust margin after image
        except Exception as e:
            pdf.drawString(100, 480, "Error loading image.")  # If there's an error with the image, show a message
            y_position = 480  # Adjust position in case of error


    # Save PDF
    pdf.save()
    buffer.seek(0)
    return buffer


# Function to encrypt PDF using AES
def encrypt_pdf_aes(pdf_buffer, key):
    pdf_buffer.seek(0)
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv))
    encryptor = cipher.encryptor()
    encrypted_pdf = encryptor.update(pdf_buffer.read()) + encryptor.finalize()
    return encrypted_pdf, iv

# Function to encrypt AES key using RSA
def encrypt_aes_key_rsa(aes_key, public_key):
    encrypted_key = public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return encrypted_key

# Function to generate and encrypt the report
def generate_and_encrypt_report(document_id, sender, receiver, content, file, file_path):
    try:
        logger.info("Generating report data...")
        if content and file:
            content = f"Bullying content: {content}\nBullying image: {file_path}"
        elif content:  # Only text content is present.
            content = f"Bullying content: {content}"
        elif file:  # Only an image is present.
            content = f"Bullying image: {file_path}"

        report = {
            'sender_id': sender.id,
            'receiver_id': receiver.id,
            'timestamp': timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
            'content': content,
            'file_path': file_path, 
        }

        logger.info(f"Generating PDF report for document_id {document_id}...")
        pdf_buffer = generate_pdf(report)
        logger.info("PDF generated successfully.")

        pdf_buffer.seek(0)  # Ensure the buffer is at the start
        pdf_bytes = pdf_buffer.read() 
        pdf_hash = generate_sha256_hash(pdf_bytes)
        logger.info(f"Generated SHA-256 hash: {pdf_hash[:8]}...")
        aes_key = os.urandom(32)  # AES-256 key
        iv = os.urandom(16)
        logger.info(f"Encrypting PDF using AES with key: {aes_key.hex()[:8]}...")
        encrypted_pdf, iv = encrypt_pdf_aes(pdf_buffer, aes_key)
        logger.info("PDF encrypted successfully.")
        iv_hex = iv.hex()
        # Load the public key for RSA encryption
        public_key = load_public_key()  # Load public key
        logger.info("Encrypting AES key using RSA...")
        encrypted_aes_key = encrypt_aes_key_rsa(aes_key, public_key)
        logger.info("AES key encrypted successfully.")

        encrypted_pdf_path = os.path.join(
            settings.MEDIA_ROOT, f'encrypted_reports/report_{document_id}.pdf'
        )
        os.makedirs(os.path.dirname(encrypted_pdf_path), exist_ok=True)
        logger.info(f"Saving encrypted PDF to {encrypted_pdf_path}")
        with open(encrypted_pdf_path, "wb") as f:
            f.write(encrypted_pdf)

        # pdf_hash = generate_sha256_hash(encrypted_pdf)
        # logger.info(f"Generated SHA-256 hash: {pdf_hash[:8]}...")


        EncryptedReport.objects.create(
            document_id=document_id,
            file=f"encrypted_reports/report_{document_id}.pdf",
            sender=sender,
            receiver=receiver,
            sha256_hash=pdf_hash,
            encrypted_aes_key=encrypted_aes_key,
            iv=iv_hex,
        )
        logger.info(f"Encrypted report details saved for document_id {document_id}.")

    except Exception as e:
        logger.error(f"Error generating and encrypting report for document_id {document_id}: {str(e)}")
        raise e

def generate_sha256_hash(data):
    if not isinstance(data, bytes):
        raise TypeError("Data must be in bytes format to generate a hash.")
    digest = hashes.Hash(hashes.SHA256())
    digest.update(data)
    return digest.finalize().hex()
def home(request):
    return render(request, 'chat/home.html')

def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()  # Save the user to the database
            messages.success(request, 'Account created successfully! Please log in.')
            return redirect('login')  # Redirect to login page after successful signup
        else:
            messages.error(request, 'There was an error with your signup. Please try again.')
    else:
        form = SignupForm()  # If GET request, show the empty form
    
    return render(request, 'chat/signup.html', {'form': form})


from django.shortcuts import render

@login_required
# A simple profile view
def profile(request):
    return render(request, 'profile.html')

@login_required
def edit_profile(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        reenter_password = request.POST.get('reenter_password')

        if password and password != reenter_password:
            messages.error(request, "Passwords don't match.")
            return redirect('edit_profile')

        user = request.user
        user.username = username
        user.email = email

        if password:
            user.set_password(password)

        user.save()
        messages.success(request, "Your profile has been updated!")
        return redirect('profile')

    return render(request, 'edit_profile.html')

@login_required
def chat_list(request):
    users = CustomUser.objects.exclude(id=request.user.id)  # Exclude current user from the list
    return render(request, 'chat/chat_list.html', {'users': users})

@login_required
# def chat_room(request, user_id):
#     # Retrieve the receiver (user to chat with) by user_id
#     receiver = get_object_or_404(CustomUser, id=user_id)

#     # Retrieve all messages exchanged between the logged-in user and the receiver
#     messages = Message.objects.filter(
#         (Q(sender=request.user) & Q(receiver=receiver)) |
#         (Q(sender=receiver) & Q(receiver=request.user))
#     ).order_by('timestamp')

#     # Handle new message submission via POST
#     if request.method == 'POST':
#         content = request.POST.get('content', '')
#         file = request.FILES.get('file', None)

#         if file:  # If a file (image/video) is uploaded
#             # Ensure the directory exists
#             chat_files_dir = os.path.join(settings.MEDIA_ROOT, 'chat_files')
#             os.makedirs(chat_files_dir, exist_ok=True)

#             # Save the file (this could be an image or video)
#             file_path = os.path.join(chat_files_dir, file.name)
#             with open(file_path, 'wb') as f:
#                 for chunk in file.chunks():
#                     f.write(chunk)
#             time.sleep(1)

#             # Process the image for bullying detection
#             is_bullying = process_images(file_path)
#             new_message = Message(
#                 sender=request.user,
#                 receiver=receiver,
#                 content=content,
#                 file=file,
#                 is_bullying=is_bullying  # Add the Boolean result of bullying detection
#             )
#             new_message.save()

#             # If bullying is detected, create a new document in BullyingDetectionDocument
#             document_id = None
#             if is_bullying:
#                 document_id = str(uuid.uuid4())  # Generate a unique ID for the document
#                 bullying_document = BullyingDetectionDocument(
#                     document_id=document_id,
#                     sender=request.user,
#                     receiver=receiver,
#                     image=file,
#                     is_bullying=is_bullying,
#                 )
#                 bullying_document.save()

#                 logger.info("Bullying detected, proceeding to generate and encrypt report...")    
#                 generate_and_encrypt_report(document_id, request.user, receiver, content,file, file_path)

#             # Return response with the new message content and bullying result
#             return JsonResponse({
#                 'status': 'Message sent',
#                 'message': new_message.content,
#                 'username': new_message.sender.username,
#                 'is_bullying': is_bullying,  # Return the bullying detection result
#                 'document_id': document_id  # Return document ID if bullying is detected
#             })

#         else:  # If no file is uploaded, just send a text message
#             # Check for bullying in the text message
#             is_bullying = detect_bullying_in_text(content)

#             new_message = Message(
#                 sender=request.user,
#                 receiver=receiver,
#                 content=content,
#                 is_bullying=is_bullying  # Set the result of text bullying detection
#             )
#             new_message.save()

#             # If bullying is detected, create a new document in BullyingDetectionDocument (for text)
#             document_id = None
#             if is_bullying:
#                 document_id = str(uuid.uuid4())  # Generate a unique ID for the document
#                 bullying_document = BullyingDetectionDocument(
#                     document_id=document_id,
#                     sender=request.user,
#                     receiver=receiver,
#                     image=None,  # No image, so set to None
#                 )
#                 bullying_document.save()
                

#             return JsonResponse({
#                 'status': 'Message sent',
#                 'message': new_message.content,
#                 'username': new_message.sender.username,
#                 'is_bullying': is_bullying,  # Return the bullying detection result
#                 'document_id': document_id  # Return document ID if bullying is detected
#             })

#     # If GET request, render the chat room template with messages
#     return render(request, 'chat/chat_room.html', {
#         'receiver': receiver,
#         'messages': messages
#     })
######################################################################image###############################
def chat_room(request, user_id):
    # Retrieve the receiver (user to chat with) by user_id
    receiver = get_object_or_404(CustomUser, id=user_id)

    # Retrieve all messages exchanged between the logged-in user and the receiver
    messages = Message.objects.filter(
        (Q(sender=request.user) & Q(receiver=receiver)) |
        (Q(sender=receiver) & Q(receiver=request.user))
    ).order_by('timestamp')

    # Handle new message submission via POST
    if request.method == 'POST':
        content = request.POST.get('content', '')  # Text content
        file = request.FILES.get('file', None)  # File (image/video)

        is_bullying_text = False
        is_bullying_image = False
        is_bullying_video = False
        bullying_text = None
        document_id = None

        # Check for text bullying
        if content:
            is_bullying_text = classify_bullying_text(content)
            if is_bullying_text:
                bullying_text = content 

        file_path = None
        # Check for image bullying
        if file:
            # Ensure the directory exists
            chat_files_dir = os.path.join(settings.MEDIA_ROOT, 'chat_files')
            os.makedirs(chat_files_dir, exist_ok=True)

            # Save the file
            file_path = os.path.join(chat_files_dir, file.name)
            with open(file_path, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)
            # Process the file for bullying detection       
            time.sleep(1)
            # Process the image for bullying detection
            if file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                is_bullying_image = process_images(file_path)
            elif file.name.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.flv')):
                is_bullying_video = process_video_for_bullying(file_path)

        else: 
            file_path=None

        # Combine the bullying detection results
        is_bullying = is_bullying_text or is_bullying_image or is_bullying_video

        # Save the new message
        new_message = Message(
            sender=request.user,
            receiver=receiver,
            content=content,
            file=file if file else None,
            is_bullying=is_bullying
        )
        new_message.save()

        # If bullying is detected, create a document in BullyingDetectionDocument
        if is_bullying:
            document_id = str(uuid.uuid4())  # Generate a unique document ID
            bullying_document = BullyingDetectionDocument(
                document_id=document_id,
                sender=request.user,
                receiver=receiver,
                image=file if file else None,
                video=file if file and file.name.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.flv')) else None,
                detected_text=bullying_text,  # Add the bullying text if detected
                is_bullying=is_bullying
            )
            bullying_document.save()
            logger.info("Bullying detected, proceeding to generate and encrypt report...")    
            generate_and_encrypt_report(
        document_id,
        request.user,
        receiver,
        bullying_text if bullying_text else None,  # Pass text if available
        file if file else None,  # Pass file if available
        file_path if file else None  # Pass file_path if a file exists
    )

        # Return the response
        return JsonResponse({
            'status': 'Message sent',
            'message': new_message.content,
            'username': new_message.sender.username,
            'is_bullying': is_bullying,  # Combined result
            'is_bullying_text': is_bullying_text,  # Text-specific result
            'is_bullying_image': is_bullying_image,  # Image-specific result
            'is_bullying_video': is_bullying_video,  # Video-specific result           
            'document_id': document_id  # Document ID if bullying is detected
        })

    # If GET request, render the chat room template with messages
    return render(request, 'chat/chat_room.html', {
        'receiver': receiver,
        'messages': messages
    })
# def chat_room(request, user_id):
#     # Retrieve the receiver (user to chat with) by user_id
#     receiver = get_object_or_404(CustomUser, id=user_id)

#     # Retrieve all messages exchanged between the logged-in user and the receiver
#     messages = Message.objects.filter(
#         (Q(sender=request.user) & Q(receiver=receiver)) |
#         (Q(sender=receiver) & Q(receiver=request.user))
#     ).order_by('timestamp')

#     # Handle new message submission via POST
#     if request.method == 'POST':
#         content = request.POST.get('content', '')  # Text content
#         file = request.FILES.get('file', None)  # File (image/video)

#         is_bullying_text = False
#         is_bullying_image = False
#         is_bullying_video = False
#         bullying_text = None
#         document_id = None

#         # Check for text bullying
#         if content:
#             is_bullying_text = classify_bullying_text(content)
#             if is_bullying_text:
#                 bullying_text = content 

#         # Check for image bullying
#         if file:
#             # Ensure the directory exists
#             chat_files_dir = os.path.join(settings.MEDIA_ROOT, 'chat_files')
#             os.makedirs(chat_files_dir, exist_ok=True)

#             # Save the file
#             file_path = os.path.join(chat_files_dir, file.name)
#             with open(file_path, 'wb') as f:
#                 for chunk in file.chunks():
#                     f.write(chunk)

#             # Process the image for bullying detection
#             time.sleep(1)
#             # Process the image for bullying detection
#             if file.name.endswith(('jpg', 'jpeg', 'png', 'gif', 'bmp')):  # Check if it's an image
#                 is_bullying_image = process_images(file_path)
#             # Check if the file is a video for bullying detection
#             elif file.name.endswith(('.mp4', '.avi', '.mov')):  # Check if the uploaded file is a video
#                 is_bullying_video = process_video_for_bullying(file_path)



#         else: 
#             file_path=None

#         # Combine the bullying detection results
#         is_bullying = is_bullying_text or is_bullying_image or is_bullying_video

#         # Save the new message
#         new_message = Message(
#             sender=request.user,
#             receiver=receiver,
#             content=content,
#             file=file if file else None,
#             is_bullying=is_bullying
#         )
#         new_message.save()

#         # If bullying is detected, create a document in BullyingDetectionDocument
#         if is_bullying:
#             document_id = str(uuid.uuid4())  # Generate a unique document ID
#             bullying_document = BullyingDetectionDocument(
#             document_id=document_id,
#             sender=request.user,
#             receiver=receiver,
#             detected_text=bullying_text,
#             is_bullying=is_bullying,
#             )
#             if file:
#     # Handle image and video separately
#                 if file and file.name.endswith(('jpg', 'jpeg', 'png', 'gif', 'bmp')):  # If it's an image
#                     bullying_document.image = file  # Store image in the image field
#                 elif file and file.name.endswith(('.mp4', '.avi', '.mov')):  # If it's a video
#                     bullying_document.video = file  # Assuming you have a video field in your model

#             bullying_document.save()
    
#             logger.info("Bullying detected, proceeding to generate and encrypt report...")    
#             generate_and_encrypt_report(
#                 document_id,
#                 request.user,
#                 receiver,
#                 bullying_text if bullying_text else None,  # Pass text if available
#                 file if file else None,  # Pass file if available
#                 file_path if file else None  # Pass file_path if a file exists
#             )

#         # Return the response
#         return JsonResponse({
#             'status': 'Message sent',
#             'message': new_message.content,
#             'username': new_message.sender.username,
#             'is_bullying': is_bullying,  # Combined result
#             'is_bullying_text': is_bullying_text,  # Text-specific result
#             'is_bullying_image': is_bullying_image,  # Image-specific result
#             'document_id': document_id  # Document ID if bullying is detected
#         })

#     # If GET request, render the chat room template with messages
#     return render(request, 'chat/chat_room.html', {
#         'receiver': receiver,
#         'messages': messages
#     })


@login_required
@permission_required('chat.view_encryptedreport', raise_exception=True)
@permission_required('chat.download_encryptedreport', raise_exception=True)
def download_encrypted_report(request, document_id):
    """
    Allows Cyber Cell users to securely download an encrypted report.
    """
    # Retrieve the report
    report = get_object_or_404(EncryptedReport, document_id=document_id)

    # Serve the file as a response
    file_path = report.file.path
    response = FileResponse(open(file_path, 'rb'), as_attachment=True, filename=f"report_{document_id}.pdf")
    return response

def is_cyber_cell(user):
    return user.groups.filter(name='Cyber Cell').exists() or user.is_superuser 

@login_required
@user_passes_test(is_cyber_cell)
def dashboard(request): 
    reports = EncryptedReport.objects.all()
    if request.method == "POST":
        report_id = request.POST.get("report_id")
        private_key_path = request.FILES.get("private_key")  # RSA Private Key file

        try:
            # Fetch the report
            report = EncryptedReport.objects.get(document_id=report_id)
            encrypted_file_path = report.file.path

            # Save private key temporarily
            temp_key_path = "temp_private_key.pem"
            with open(temp_key_path, "wb") as key_file:
                for chunk in private_key_path.chunks():
                    key_file.write(chunk)

            # Decrypt AES key using RSA private key
            encrypted_aes_key = report.encrypted_aes_key  # Retrieve the encrypted AES key
            aes_key = rsa_decrypt_key(encrypted_aes_key, temp_key_path)  # Decrypt AES key

            # Convert the stored IV back from hex to bytes
            iv = bytes.fromhex(report.iv)  # Retrieve IV from the database and convert from hex to bytes
            decrypted_file_path = f"media/encrypted_reports/{report.document_id}.pdf"
            
            # Decrypt the file using the decrypted AES key and IV
            
            aes_decrypt_file(encrypted_file_path, decrypted_file_path, aes_key, iv)
            is_valid = verify_sha256(decrypted_file_path, report.sha256_hash)
            # Verify SHA-256 hash
            
            # Clean up temporary key file
            os.remove(temp_key_path)

            # Render result
            return render(request, "dashboard.html", {
                "report": report,
                "decrypted_file_path": decrypted_file_path,
                "is_valid": is_valid
            })

        except EncryptedReport.DoesNotExist:
            return JsonResponse({"error": "Report not found."}, status=404)

        except FileNotFoundError:
            return JsonResponse({"error": "Encrypted file or private key not found."}, status=404)

        except Exception as e:
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

    # Render dashboard page
    return render(request, "dashboard.html", {"reports": reports})

