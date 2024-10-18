from django.urls import path
from .views import browse_folder

app_name = "filemanage"

urlpatterns = [
    path('', browse_folder, {'folder_path': ''}, name='home'),
    path('<path:folder_path>', browse_folder, name='browse_folder'),
]
