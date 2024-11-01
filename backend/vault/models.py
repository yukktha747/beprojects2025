from django.db import models
from django.contrib.auth.models import User

class UserImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image_url = models.URLField()  # URL to access the image
    is_favorite = models.BooleanField(default=False)
    is_in_trash = models.BooleanField(default=False)
    privacy = models.CharField(max_length=10, choices=[('public', 'Public'), ('private', 'Private')])

    def __str__(self):
        return f"{self.user.username}  {self.id}"
