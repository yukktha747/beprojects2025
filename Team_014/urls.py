from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import download_encrypted_report

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('accounts/profile/', views.profile, name='profile'),
    path('accounts/edit_profile/', views.edit_profile, name='edit_profile'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('chat/', views.chat_list, name='chat_list'),  # List of users to chat with
    path('chat/<int:user_id>/', views.chat_room, name='chat_room'),
    path('download/<str:document_id>/', download_encrypted_report, name='download_encrypted_report'),
    path("dashboard/", views.dashboard, name="dashboard"),

]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)