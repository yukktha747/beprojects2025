from django.urls import path
from .views import (
    upload_images,
    get_all_public_photos,
    add_to_favorites,
    get_user_favorites,
    remove_from_favorites,
    is_favorite,
    get_user_trash,
    mark_image_as_trash,
    restore_from_trash,
    get_user_private_images
)

urlpatterns = [
    path('upload_images/', upload_images, name='upload_images'),
    path('get_all_public_photos/', get_all_public_photos, name='get_all_public_photos'),
    path('get_user_private_images/', get_user_private_images, name='get_user_private_images'),
    # Favorites related
    path('add_to_favorites/', add_to_favorites, name='add_to_favorites'),
    path('get_user_favorites/', get_user_favorites, name='get_user_favorites'),
    path('remove_from_favorites/', remove_from_favorites, name='remove_from_favorites'),
    path('is_favorite/<int:image_id>/', is_favorite, name='is_favorite'),
    # Trash related
    path('get_user_trash/', get_user_trash, name='get_user_trash'),
    path('mark_image_as_trash/', mark_image_as_trash, name='mark_image_as_trash'),
    path('restore_from_trash/', restore_from_trash, name='restore_from_trash'),
]
