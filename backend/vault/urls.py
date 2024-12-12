from django.urls import path
from .views import (
    upload_files,
    get_all_public_photos,
    add_to_favorites,
    get_user_favorites,
    remove_from_favorites,
    is_favorite,
    change_file_privacy,
    get_user_trash,
    mark_image_as_trash,
    restore_from_trash,
    get_user_private_images,
    get_user_documents_private,
    get_all_public_documents,
    add_tag_to_image,
    remove_tag_from_image,
    get_tags_for_image,
    search_images,
    create_group,
    access_group,
    toggle_group_access

)

urlpatterns = [
    path('upload_files/', upload_files, name='upload_files'),
    # get images and videos
    path('get_all_public_photos/', get_all_public_photos, name='get_all_public_photos'),
    path('get_user_private_images/', get_user_private_images, name='get_user_private_images'),
    path('add-tag/', add_tag_to_image, name='add_tag_to_image'),
    path('remove-tag/', remove_tag_from_image, name='remove_tag_from_image'),
    path('get-tags/', get_tags_for_image, name='get_tags_for_image'),
    # documents
    path('get_user_documents_private/', get_user_documents_private, name='get_user_documents_private'),
    path('get_all_public_documents/', get_all_public_documents, name='get_all_public_documents'),
    # Favorites related
    path('add_to_favorites/', add_to_favorites, name='add_to_favorites'),
    path('get_user_favorites/', get_user_favorites, name='get_user_favorites'),
    path('remove_from_favorites/', remove_from_favorites, name='remove_from_favorites'),
    path('is_favorite/<int:image_id>/', is_favorite, name='is_favorite'),
    path('change_file_privacy/', change_file_privacy, name='change_file_privacy'),
    # Trash related
    path('get_user_trash/', get_user_trash, name='get_user_trash'),
    path('mark_image_as_trash/', mark_image_as_trash, name='mark_image_as_trash'),
    path('restore_from_trash/', restore_from_trash, name='restore_from_trash'),
    # Search
    path('search/', search_images, name='search_images'),
    #group
    path("groups/create/", create_group, name="create_group"),
    path("groups/access/<uuid:shareable_link>/", access_group, name="access_group"),
    path("groups/toggle/<int:group_id>/", toggle_group_access, name="toggle_group_access"),


]
