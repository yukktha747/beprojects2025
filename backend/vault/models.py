from django.db import models
from django.contrib.auth.models import User
import uuid

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)  # Tag name should be unique

    def __str__(self):
        return self.name


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
    summary = models.TextField(blank=True, null=True)  # Add summary field
    tags = models.ManyToManyField(Tag, blank=True, related_name="images")  # Many-to-Many relationship with Tag

    def __str__(self):
        return f"{self.user.username}  {self.id} {self.document_type}"

class Favourite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ForeignKey(UserImage, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.image }"
    

class Group(models.Model):
    name = models.CharField(max_length=100)  # Group name
    owner = models.ForeignKey(User, on_delete=models.CASCADE)  # Owner of the group
    images = models.ManyToManyField(UserImage, related_name="groups")  # Images in the group
    shareable_link = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # Unique link for sharing
    is_active = models.BooleanField(default=True)  # Toggle for enabling/disabling access to the group

    def __str__(self):
        return f"{self.name} - {self.owner.username}"
