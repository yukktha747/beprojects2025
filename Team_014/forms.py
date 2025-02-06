from django import forms
from .models import CustomUser  # Import your custom user model
from .models import Message

class SignupForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(), label="Password")
    reenter_password = forms.CharField(widget=forms.PasswordInput(), label="Re-enter Password")

    class Meta:
        model = CustomUser  # Use CustomUser here
        fields = ['username', 'email']

    def clean_reenter_password(self):
        password = self.cleaned_data.get('password')
        reenter_password = self.cleaned_data.get('reenter_password')

        if password and reenter_password and password != reenter_password:
            raise forms.ValidationError("Passwords don't match.")
        return reenter_password

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])  # Hash the password before saving
        if commit:
            user.save()  # Save the user instance
        return user

class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['content', 'file']