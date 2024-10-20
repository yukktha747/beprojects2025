from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404,FileResponse
from django.urls import reverse_lazy
import shutil
from .forms import FileFieldForm, CreateFolderForm
import os
import mimetypes
import psutil


# Helper function to get all external drives
def get_external_drives():
    external_drives = []
    for partition in psutil.disk_partitions():
        # Check if  partition is under /media or /mnt
        if partition.mountpoint.startswith('/media') or partition.mountpoint.startswith('/mnt'):
            external_drives.append(partition.mountpoint)
    return external_drives



def browse_folder(request, folder_path=''):
    base_dir = os.path.expanduser('~')
    current_path = os.path.join(base_dir, folder_path)
    drives = get_external_drives()

    # Check if the current path is a drive mount point
    if current_path in drives:
        base_dir = current_path
    print(drives)
    # Check if the path exists
    if not os.path.exists(current_path):
        return render(request, 'browse.html', {
            'current_path': folder_path,
            'folders': [],
            'files': [],
            'error': "The specified path does not exist.",
            'drives': drives,
        })

    success = ''
    error = ''
    # Handling multiple files from HTML
    if request.method == 'POST':
        if 'file_field' in request.FILES:
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

        elif 'folder_name' in request.POST:
            folder_form = CreateFolderForm(request.POST)
            if folder_form.is_valid():
                new_folder_name = folder_form.cleaned_data['folder_name']
                new_folder_path = os.path.join(current_path, new_folder_name)
                try:
                    os.makedirs(new_folder_path)
                    success = f'Folder "{new_folder_name}" created successfully!'
                except Exception as e:
                    error = f'Error creating folder: {str(e)}'
                    
    form = FileFieldForm()
    folder_form = CreateFolderForm()

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
        'folder_form': folder_form,
        'error': error,
        'parent_path': parent_path,
        'success': success,
        'drives': drives,
    })



def view_file(request, file_name, folder_path=''):
    base_dir = os.path.expanduser('~')
    folder_path = folder_path or ''
    file_path = os.path.join(base_dir, folder_path, file_name)
    print(file_path)
    if not os.path.isfile(file_path):
        return render(request, 'file_not_found.html', {
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

