from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404,FileResponse
from django.urls import reverse_lazy
import shutil
from .forms import FileFieldForm
import os
import mimetypes

def browse_folder(request, folder_path=''):
    base_dir = os.path.expanduser('~')
    current_path = os.path.join(base_dir, folder_path)

    # Check if the path exists
    if not os.path.exists(current_path):
        return render(request, 'browse.html', {
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
            uploaded_files = request.FILES.getlist('file_field')  # Use getlist for multiple files
            for file in uploaded_files:
                file_path = os.path.join(current_path, file.name)

                # Save the uploaded file to the current directory
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

    return render(request, 'browse.html', {
        'current_path': folder_path,
        'folders': folder_paths,
        'files': files,
        'form': form,
        'error': None,
        'parent_path': parent_path,
        'success': success
    })



def view_file(request, folder_path, file_name):
    base_dir = os.path.expanduser('~')
    file_path = os.path.join(base_dir, folder_path, file_name)

    # Check if the file exists
    if not os.path.isfile(file_path):
        return render(request, 'filemanage/browse.html', {
            'current_path': folder_path,
            'error': "File not found.",
            'folders': [],
            'files': [],
        })

    mime_type, _ = mimetypes.guess_type(file_path)

    if mime_type:
        if mime_type.startswith('image/'):
            return FileResponse(open(file_path, 'rb'), content_type=mime_type)
        elif mime_type == 'application/pdf':
            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        elif mime_type.startswith('video/'):
            return FileResponse(open(file_path, 'rb'), content_type=mime_type)

    # Fallback: download the file if not a supported type
    response = HttpResponse(open(file_path, 'rb').read(), content_type='application/octet-stream')
    response['Content-Disposition'] = f'attachment; filename="{file_name}"'
    return response
def delete_item(request, item_path):
    if request.method == 'POST':
        base_dir = os.path.expanduser('~')
        target_path = os.path.join(base_dir, item_path)
        print(target_path)

        if not os.path.exists(target_path):
            return render(request, 'browse.html', {
                'error': "The specified file or folder does not exist."
            })

        if os.path.isfile(target_path):
            try:
                os.remove(target_path)
                success_message = "File deleted successfully!"
            except Exception as e:
                return render(request, 'browse.html', {
                    'error': f"Error deleting file: {str(e)}"
                })

        elif os.path.isdir(target_path):
            try:
                shutil.rmtree(target_path)
                success_message = "Folder deleted successfully!"
            except Exception as e:
                return render(request, 'browse.html', {
                    'error': f"Error deleting folder: {str(e)}"
                })

        parent_path = '/'.join(item_path.split('/')[:-1])
        return redirect(reverse_lazy('filemanage:browse_folder', kwargs={'folder_path': parent_path}))

