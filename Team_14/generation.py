# from reportlab.pdfgen import canvas
# from reportlab.lib.pagesizes import letter
# from io import BytesIO
# from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
# from cryptography.hazmat.primitives import hashes
# from cryptography.hazmat.primitives.asymmetric import rsa, padding
# from cryptography.hazmat.primitives import serialization
# import os

# # Function to generate a PDF
# def generate_pdf(report):
#     """
#     Generates a PDF file containing report details.

#     :param report: Dictionary-like object with 'sender_id', 'receiver_id', 'timestamp', and 'content'.
#     :return: BytesIO buffer containing the PDF content.
#     """
#     buffer = BytesIO()
#     pdf = canvas.Canvas(buffer, pagesize=letter)
#     pdf.drawString(100, 750, f"Sender ID: {report.get('sender_id', 'N/A')}")
#     pdf.drawString(100, 730, f"Receiver ID: {report.get('receiver_id', 'N/A')}")
#     pdf.drawString(100, 710, f"Timestamp: {report.get('timestamp', 'N/A')}")
#     pdf.drawString(100, 690, "Content:")

#     # Handle long content text
#     content = report.get('content', '')
#     if content:
#         y_position = 670
#         for line in content.splitlines():
#             pdf.drawString(100, y_position, line[:80])  # Draw the first 80 characters
#             y_position -= 20
#             if y_position < 50:  # Start a new page if space runs out
#                 pdf.showPage()
#                 y_position = 750

#     # Save and close the PDF
#     pdf.save()
#     buffer.seek(0)
#     return buffer

# # Function to encrypt PDF using AES
# def encrypt_pdf_aes(pdf_buffer, key):
#     """
#     Encrypts a PDF using AES encryption.

#     :param pdf_buffer: BytesIO buffer containing the PDF content.
#     :param key: AES encryption key (32 bytes for AES-256).
#     :return: Tuple containing encrypted PDF content and IV (Initialization Vector).
#     """
#     # Rewind the buffer before reading
#     pdf_buffer.seek(0)

#     # Generate a random IV
#     iv = os.urandom(16)
#     cipher = Cipher(algorithms.AES(key), modes.CFB(iv))
#     encryptor = cipher.encryptor()

#     # Encrypt the PDF content
#     encrypted_pdf = encryptor.update(pdf_buffer.read()) + encryptor.finalize()
#     return encrypted_pdf, iv

# # Function to encrypt AES key using RSA
# def encrypt_aes_key_rsa(aes_key, public_key):
#     """
#     Encrypts an AES key using an RSA public key.

#     :param aes_key: The AES key to encrypt (bytes).
#     :param public_key: The RSA public key for encryption.
#     :return: Encrypted AES key (bytes).
#     """
#     encrypted_key = public_key.encrypt(
#         aes_key,
#         padding.OAEP(
#             mgf=padding.MGF1(algorithm=hashes.SHA256()),
#             algorithm=hashes.SHA256(),
#             label=None
#         )
#     )
#     return encrypted_key

# # RSA Key Pair Generation (For Testing Only)
# def generate_rsa_key_pair():
#     """
#     Generates an RSA key pair (private and public keys).

#     :return: Tuple containing the private key and public key.
#     """
#     private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
#     public_key = private_key.public_key()
#     return private_key, public_key

# # Function to generate SHA256 hash
# def generate_sha256_hash(data):
#     """
#     Generates a SHA256 hash for the given data.

#     :param data: Data in bytes format to hash.
#     :return: SHA256 hash of the data.
#     """
#     if not isinstance(data, bytes):
#         raise TypeError("Data must be in bytes format to generate a hash.")
#     digest = hashes.Hash(hashes.SHA256())
#     digest.update(data)
#     return digest.finalize()


from cryptography.hazmat.primitives import serialization

# Function to load the RSA public key
def load_public_key():
    with open("public_key.pem", "rb") as f:
        return serialization.load_pem_public_key(f.read())
