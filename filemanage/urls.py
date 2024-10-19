from django.urls import path
from .views import browse_folder, delete_item

app_name = "filemanage"

urlpatterns = [
    path('', browse_folder, {'folder_path': ''}, name='home'),
    path('delete/<path:item_path>/', delete_item, name='delete_item'),
    path('<path:folder_path>', browse_folder, name='browse_folder'),
]
