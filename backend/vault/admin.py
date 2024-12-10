from django.contrib import admin
from .models import UserImage,Favourite, Tag
# Register your models here.
admin.site.register(UserImage)
admin.site.register(Favourite)
admin.site.register(Tag)