from django.urls import path
from .views import browse_folder, view_file

app_name = "filemanage"

urlpatterns = [
    path('view/<path:folder_path>/<str:file_name>/', view_file, name='view_file'),
    path('', browse_folder, {'folder_path': ''}, name='home'),
    path('<path:folder_path>', browse_folder, name='browse_folder'),

]
