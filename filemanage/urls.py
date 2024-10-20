from django.urls import path
from .views import browse_folder, view_file,delete_item

app_name = "filemanage"

urlpatterns = [
    path('view/<str:file_name>/', view_file, name='view_file_no_folder'),
    path('view/<path:folder_path>/<str:file_name>/', view_file, name='view_file'),
    path('', browse_folder, {'folder_path': ''}, name='home'),
    path('delete/<path:item_path>/', delete_item, name='delete_item'),
    path('<path:folder_path>', browse_folder, name='browse_folder'),

]
