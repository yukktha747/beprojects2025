from django.db import models
from django.contrib.auth.models import User

class UserImage(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    url = models.URLField()  # URL to access the file
    is_in_trash = models.BooleanField(default=False)
    privacy = models.CharField(max_length=10, choices=[('public', 'Public'), ('private', 'Private')])
    document_type = models.CharField(max_length=10, choices=DOCUMENT_TYPE_CHOICES)

    def __str__(self):
        return f"{self.user.username}  {self.id} {self.document_type}"

class Favourite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ForeignKey(UserImage, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.image }"