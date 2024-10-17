from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from .forms import CustomAuthenticationForm

class CustomLoginView(LoginView):
    template_name = 'login.html'
    form_class = CustomAuthenticationForm
    redirect_authenticated_user = True
    next_page = '/'
