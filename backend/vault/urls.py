from django.urls import path
from .views import *

urlpatterns = [
    path('get_fav/',get_user_favorites,name='get_user_favorites'),
    path('get_trash/',get_user_trash,name='get_user_trash'),
    path('upload_images/',upload_images,name='upload_images'),
    path('mark_image_as_trash/',mark_image_as_trash,name='mark_image_as_trash'),
    path('add_to_favorites/',add_to_favorites,name='add_to_favorites'),
    path('get_all/',get_all_public_photos,name='get_all_public_photos'),

]