from pathlib import Path
from rest_framework.decorators import api_view, permission_classes,parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from .models import UserImage, Favourite
import os
from django.db.models import Q
from rest_framework.pagination import LimitOffsetPagination


class InfiniteScrollPagination(LimitOffsetPagination):
    """
    Pagination class for implementing infinite scroll.

    This class extends Django REST Framework's `LimitOffsetPagination`
    to provide a default limit of items per page and an optional maximum limit.

    Attributes:
        default_limit (int): The default number of items per page.
        max_limit (int): The maximum number of items that can be retrieved per page.
    """
    default_limit = 10
    max_limit = 50 


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_files(request):
    """
    Handle file uploads from authenticated users.

    Accepts multiple files and saves them in a unified 'uploads' directory.
    Files are categorized into `image`, `video`, `document`, or `unknown` based on their extensions.
    Records for uploaded files are stored in the `UserImage` model.

    Parameters:
        request (HttpRequest): The HTTP request containing uploaded files, privacy setting, and user details.

    Returns:
        Response: JSON response with details of uploaded files or an error message.
    """

    images = request.FILES.getlist("images") 
    privacy = request.data.get("privacy", "public").lower()  
    user = request.user

    # Define the single target path for all images
    target_path = Path(settings.MEDIA_ROOT) / "uploads"

    # Ensure the uploads folder exists
    try:
        target_path.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        return Response({"error": f"Could not create folder: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Helper to determine document type
    def get_document_type(filename):
        extension = os.path.splitext(filename)[-1].lower()
        if extension in [".jpg", ".jpeg", ".png", ".gif"]:
            return "image"
        elif extension in [".mp4", ".avi", ".mov", ".mkv"]:
            return "video"
        elif extension in [".pdf", ".doc", ".docx", ".txt", ".xlsx", ".pptx"]:
            return "document"
        else:
            return "unknown"

    saved_files = []
    for image in images:
        try:
            # Save each file in the "uploads" folder
            image_path = target_path / image.name
            with open(image_path, "wb+") as destination:
                for chunk in image.chunks():
                    destination.write(chunk)
            
            # Formulate the complete URL with request information
            image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}uploads/{image.name}")

            # Determine the document type
            document_type = get_document_type(image.name)

            # Save the image record in the database with privacy setting
            user_image = UserImage.objects.create(
                user=user,
                url=image_url,
                is_in_trash=False,
                privacy=privacy,
                document_type=document_type  # Add document type
            )
            
            saved_files.append({"id": user_image.id, "url": image_url, "document_type": document_type})

        except Exception as e:
            return Response({"error": f"Error saving file '{image.name}': {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Files uploaded successfully", "files": saved_files}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_public_photos(request):
    """
    Retrieve all public photos and videos.

    Fetches images and videos from the `UserImage` model where the privacy setting is `public`.
    Supports infinite scrolling via pagination.

    Parameters:
        request (HttpRequest): The HTTP request containing pagination parameters.

    Returns:
        Response: Paginated list of public images and videos.
    """

    public_images = UserImage.objects.filter(
        Q(document_type='image') | Q(document_type='video'), 
        is_in_trash=False, 
        privacy='public'
    )

    paginator = InfiniteScrollPagination()
    paginated_images = paginator.paginate_queryset(public_images, request)

    public_image_urls = [
        {"id": image.id, "url": image.url} for image in paginated_images
    ]

    return paginator.get_paginated_response({"public_photos_and_videos": public_image_urls})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_private_images(request):
    """
    Retrieve all private images for the authenticated user.

    Fetches images from the `UserImage` model where the privacy setting is `private`
    and the user is the one making the request. Results are paginated.

    Parameters:
        request (HttpRequest): The HTTP request containing pagination parameters.

    Returns:
        Response: Paginated list of private images for the user.
    """

    user = request.user
    private_images = UserImage.objects.filter(user=user, privacy='private', is_in_trash=False)

    # Apply pagination
    paginator = InfiniteScrollPagination()
    paginated_images = paginator.paginate_queryset(private_images, request)

    # Serialize the data
    private_image_urls = [{"id": image.id, "url": image.url} for image in paginated_images]

    # Return paginated response
    return paginator.get_paginated_response({"private_images": private_image_urls})


# Private User Documents
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_documents_private(request):
    """
    Retrieve private documents for the authenticated user.

    Fetches documents from the `UserImage` model that are marked private and belong to the user.
    Applies pagination for infinite scrolling.

    Parameters:
        request (HttpRequest): The HTTP request containing pagination parameters.

    Returns:
        Response: Paginated list of private documents for the user.
    """

    user = request.user
    private_documents = UserImage.objects.filter(
        user=user, privacy='private', is_in_trash=False, document_type='document'
    )

    # Apply pagination
    paginator = InfiniteScrollPagination()
    paginated_documents = paginator.paginate_queryset(private_documents, request)

    # Serialize data
    private_document_urls = [{"id": doc.id, "url": doc.url} for doc in paginated_documents]

    # Return paginated response
    return paginator.get_paginated_response({"private_documents": private_document_urls})


# Public Documents
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_public_documents(request):
    """
    Retrieve all public documents.

    Fetches documents from the `UserImage` model where the privacy setting is `public`.
    Supports infinite scrolling with pagination.

    Parameters:
        request (HttpRequest): The HTTP request containing pagination parameters.

    Returns:
        Response: Paginated list of public documents.
    """

    public_documents = UserImage.objects.filter(
        is_in_trash=False, privacy='public', document_type='document'
    )

    # Apply pagination
    paginator = InfiniteScrollPagination()
    paginated_documents = paginator.paginate_queryset(public_documents, request)

    # Serialize data
    public_document_urls = [{"id": doc.id, "url": doc.url} for doc in paginated_documents]

    # Return paginated response
    return paginator.get_paginated_response({"public_documents": public_document_urls})


# Below is favorites related all functions!

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_favorites(request):
    """
    Add an image to the user's favorites.

    Checks if the image exists and whether the user has access to it. Prevents adding the same image multiple times.

    Parameters:
        request (HttpRequest): The HTTP request containing the `image_id` to be favorited.

    Returns:
        Response: Success or error message.
    """

    image_id = request.data.get("image_id")

    if not image_id:
        return Response({"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_image = UserImage.objects.get(id=image_id)

        if user_image.privacy == 'private' and user_image.user != request.user:
            return Response({"error": "You are not allowed to favorite this image"}, status=status.HTTP_403_FORBIDDEN)

        if Favourite.objects.filter(user=request.user, image=user_image).exists():
            return Response({"message": "Image is already in favorites"}, status=status.HTTP_200_OK)
        
        # Add image to favorites
        Favourite.objects.create(user=request.user, image=user_image)
        return Response({"message": "Image added to favorites successfully"}, status=status.HTTP_200_OK)

    except UserImage.DoesNotExist:
        return Response({"error": "Image not found!"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_favorites(request):
    """
    Retrieve the authenticated user's favorite images.

    Fetches all images from the `Favourite` model linked to the user.

    Parameters:
        request (HttpRequest): The HTTP request made by the user.

    Returns:
        Response: List of the user's favorite images with their URLs and IDs.
    """

    user = request.user
    favorites = Favourite.objects.filter(user=user)
    favorite_images = [{"image_url": fav.image.url, "image_id": fav.image.id} for fav in favorites]
    return Response({"favorites": favorite_images}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_favorites(request):
    """
    Remove an image from the user's favorites.

    Verifies that the image exists in the user's favorites before removing it.

    Parameters:
        request (HttpRequest): The HTTP request containing the `image_id` to be removed.

    Returns:
        Response: Success or error message.
    """

    image_id = request.data.get("image_id")

    if not image_id:
        return Response({"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        favorite = Favourite.objects.get(user=request.user, image_id=image_id)
        favorite.delete()
        
        return Response({"message": "Image removed from favorites successfully"}, status=status.HTTP_200_OK)

    except Favourite.DoesNotExist:
        return Response({"error": "Image not found in favorites"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_favorite(request, image_id):
    """
    Check if an image is in the user's favorites.

    Determines whether the specified image is already marked as a favorite by the user.

    Parameters:
        request (HttpRequest): The HTTP request made by the user.
        image_id (int): The ID of the image to check.

    Returns:
        Response: Boolean indicating whether the image is a favorite.
    """

    is_fav = Favourite.objects.filter(user=request.user, image_id=image_id).exists()
    return Response({"is_favorite": is_fav}, status=status.HTTP_200_OK)



# Trash related everything is below
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_trash(request):
    """
    Retrieve all images in the user's trash.

    Fetches records from the `UserImage` model where `is_in_trash` is set to `True`
    and the user matches the one making the request.

    Parameters:
        request (HttpRequest): The HTTP request made by the user.

    Returns:
        Response: List of trashed image URLs.
    """

    user = request.user
    trash = UserImage.objects.filter(user=user, is_in_trash=True)
    return Response({"trash": [image.url for image in trash]})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_image_as_trash(request):
    """
    Mark an image as trash.

    Updates the `is_in_trash` field for a specific image to mark it as trashed.

    Parameters:
        request (HttpRequest): The HTTP request containing the `image_id`.

    Returns:
        Response: Success or error message.
    """

    image_id = request.data.get("image_id")

    if not image_id:
        return Response({"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_image = UserImage.objects.get(id=image_id, user=request.user)
        user_image.is_in_trash = True
        user_image.save()
        return Response({"message": "Image marked as trash successfully"}, status=status.HTTP_200_OK)

    except UserImage.DoesNotExist:
        return Response({"error": "Image not found or does not belong to the user"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_from_trash(request):
    """
    Restore a trashed image.

    Updates the `is_in_trash` field for a specific image to remove it from the trash.

    Parameters:
        request (HttpRequest): The HTTP request containing the `image_id`.

    Returns:
        Response: Success or error message.
    """

    image_id = request.data.get("image_id")

    if not image_id:
        return Response({"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_image = UserImage.objects.get(id=image_id, is_in_trash=True)
        user_image.is_in_trash = False
        user_image.save()

        return Response({"message": "Image restored from trash successfully"}, status=status.HTTP_200_OK)

    except UserImage.DoesNotExist:
        return Response({"error": "Image not found or not in trash!"}, status=status.HTTP_404_NOT_FOUND)


"""
/list (include pagination) - get_public_photos, get_private_photos, get_public_documents, get_private_documents - done
/upload (support for multiple files) - done
/edit (editing name, access specifier like public private)
/share (my brain isn't working to think about this, try figuring out something)
/delete
/search (support ai search feature)
/backup (use web3.storage and setup backup for monthly or weekly bases, find hash of every backup file and if there are no changes the hash will be the same so do not upload the backup file to ipfs)
"""