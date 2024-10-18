from django.shortcuts import render
from .forms import FileFieldForm
import os

def browse_folder(request, folder_path=''):
    base_dir = os.path.expanduser('~')
    current_path = os.path.join(base_dir, folder_path)

    # Check if the path exists
    if not os.path.exists(current_path):
        return render(request, 'filemanage/browse.html', {
            'current_path': folder_path,
            'folders': [],
            'files': [],
            'error': "The specified path does not exist."
        })
    
    success = ''
    # Handling multiple files from HTML
    if request.method == 'POST':
        form = FileFieldForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_files = form.cleaned_data['file_field']
            for file in uploaded_files:
                file_path = os.path.join(current_path, file.name)

                with open(file_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
            success = 'Files uploaded successfully!'
    else:
        form = FileFieldForm()



    # Getting all the files and folders
    items = os.listdir(current_path)
    folders = [item for item in items if os.path.isdir(os.path.join(current_path, item))]
    files = [item for item in items if os.path.isfile(os.path.join(current_path, item))]

    # Prepare folder paths for URLs
    folder_paths = [os.path.join(folder_path, folder) for folder in folders]

    # Calculate parent directory path
    parent_path = '/'.join(folder_path.split('/')[:-1])

    return render(request, 'filemanage/browse.html', {
        'current_path': folder_path,
        'folders': folder_paths,
        'files': files,
        'form': form,
        'error': None,
        'parent_path': parent_path,
        'success':success
    })