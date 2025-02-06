# from django.contrib.auth.models import AbstractUser
# from django.db import models

# class CustomUser(AbstractUser):
#     # Extend this model if needed
#     pass

# class Message(models.Model):
#     sender = models.ForeignKey(
#         CustomUser, 
#         on_delete=models.CASCADE, 
#         related_name="sent_messages"
#     )
#     receiver = models.ForeignKey(
#         CustomUser, 
#         on_delete=models.CASCADE, 
#         related_name="received_messages"
#     )
#     content = models.TextField(blank=True)  # For text messages
#     file = models.FileField(
#         upload_to="chat_files/", 
#         blank=True, 
#         null=True
#     )  # For images/videos
#     timestamp = models.DateTimeField(auto_now_add=True)
#     is_bullying = models.BooleanField(default=False)

#     class Meta:
#         ordering = ['timestamp']  # Messages are ordered by time

#     def is_media(self):
#         # Helper to check if the message contains a file (image/video)
#         return bool(self.file)

#     def __str__(self):
#         return f"Message from {self.sender.username} to {self.receiver.username} at {self.timestamp}"

# class BullyingDetectionDocument(models.Model):
#     document_id = models.CharField(max_length=100, unique=True)  # Unique ID for the document
#     sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bullying_sender')
#     receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bullying_receiver')
#     image = models.ImageField(upload_to='bullying_images/')  # Image that was detected
#     timestamp = models.DateTimeField(auto_now_add=True)  # Timestamp 

#     def __str__(self):
#         return f"Document {self.document_id} - Bullying Detected: {self.is_bullying}"


from django.contrib.auth.models import AbstractUser
from django.db import models

# Custom user model
class CustomUser(AbstractUser):
    # Extend this model if needed
    pass


# Model for chat messages
class Message(models.Model):
    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )
    content = models.TextField(blank=True)  # For text messages
    file = models.FileField(
        upload_to="chat_files/",
        blank=True,
        null=True
    )  # For images/videos
    timestamp = models.DateTimeField(auto_now_add=True)
    is_bullying = models.BooleanField(default=False)  # Flag to mark bullying content

    class Meta:
        ordering = ['timestamp']  # Messages are ordered by time

    def is_media(self):
        # Helper to check if the message contains a file (image/video)
        return bool(self.file)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username} at {self.timestamp}"


# Model for documents generated after detecting bullying
class BullyingDetectionDocument(models.Model):
    document_id = models.CharField(max_length=100, unique=True)  # Unique ID for the document
    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='bullying_sender'
    )
    receiver = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='bullying_receiver'
    )
    image = models.ImageField(upload_to='bullying_images/')  # Image that was detected
    video = models.FileField(upload_to='bullying_videos/', null=True, blank=True)  # For storing videos
    detected_text = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)  # Timestamp of detection
    is_bullying = models.BooleanField(default=False)  # Whether bullying was detected

    def __str__(self):
        return f"Document {self.document_id} - Sent by {self.sender.username} to {self.receiver.username}"

# Model for encrypted reports
class EncryptedReport(models.Model):
    document_id = models.CharField(max_length=100, unique=True)
    file = models.FileField(upload_to="encrypted_reports/")
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="report_sender")
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="report_receiver")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    sha256_hash = models.CharField(max_length=64)
    encrypted_aes_key = models.BinaryField(null=True)
    iv = models.CharField(max_length=24, null=True, default=None)


    class Meta:
        permissions = [
            ("download_encryptedreport", "Can download encrypted report"),
        ]

    def __str__(self):
        return f"Encrypted Report {self.document_id} from {self.sender.username}"
