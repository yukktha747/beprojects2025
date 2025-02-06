from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser  # Import your CustomUser model
from .models import EncryptedReport


# Register the CustomUser model with UserAdmin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "is_staff", "is_active")  # Customize fields shown in the admin
    search_fields = ("username", "email")
    ordering = ("username",)

@admin.register(EncryptedReport)
class EncryptedReportAdmin(admin.ModelAdmin):
    list_display = ('document_id', 'sender', 'receiver', 'uploaded_at', 'sha256_hash')
    search_fields = ('document_id', 'sender__username', 'receiver__username')