from pathlib import Path
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from .models import UserImage, Favourite,Tag, Group
import os
from django.db.models import Q
from rest_framework.pagination import LimitOffsetPagination
from PyPDF2 import PdfReader
from transformers import pipeline
from django.shortcuts import get_object_or_404


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



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_files(request):
    """
    Handle file uploads from authenticated users with PDF summarization.
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
        return Response(
            {"error": f"Could not create folder: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Initialize the summarization pipeline
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

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

    def generate_pdf_summary(file):
        """Extract and summarize the contents of a PDF."""
        try:
            reader = PdfReader(file)
            text = "".join(page.extract_text() for page in reader.pages)
            summary = summarizer(text[:1024], max_length=200, min_length=30, do_sample=False)
            

            return summary[0]["summary_text"] if summary else ""
        except Exception as e:
            return f"Error generating summary: {e}"

    saved_files = []
    for image in images:
        try:
            # Save each file in the "uploads" folder
            image_path = target_path / image.name
            with open(image_path, "wb+") as destination:
                for chunk in image.chunks():
                    destination.write(chunk)

            image_url = request.build_absolute_uri(
                f"{settings.MEDIA_URL}uploads/{image.name}"
            )

            document_type = get_document_type(image.name)
            summary = ""

            if document_type == "document" and image.name.lower().endswith(".pdf"):
                summary = generate_pdf_summary(image)

            user_image = UserImage.objects.create(
                user=user,
                url=image_url,
                is_in_trash=False,
                privacy=privacy,
                document_type=document_type,
                summary=summary,
            )

            saved_files.append(
                {
                    "id": user_image.id,
                    "url": image_url,
                    "document_type": document_type,
                    "summary": summary,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Error saving file '{image.name}': {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    return Response(
        {"message": "Files uploaded successfully", "files": saved_files},
        status=status.HTTP_201_CREATED,
    )



@api_view(["GET"])
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
        Q(document_type="image") | Q(document_type="video"),
        is_in_trash=False,
        privacy="public",
    )

    paginator = InfiniteScrollPagination()
    paginated_images = paginator.paginate_queryset(public_images, request)

    public_image_urls = [
        {"id": image.id, "url": image.url, "summary":image.summary} for image in paginated_images
    ]

    return paginator.get_paginated_response({"files": public_image_urls})


@api_view(["GET"])
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
    private_images = UserImage.objects.filter(
        user=user, privacy="private", is_in_trash=False
    )

    # Apply pagination
    paginator = InfiniteScrollPagination()
    paginated_images = paginator.paginate_queryset(private_images, request)

    # Serialize the data
    private_image_urls = [
        {"id": image.id, "url": image.url,"summary":image.summary} for image in paginated_images
    ]

    # Return paginated response
    return paginator.get_paginated_response({"files": private_image_urls})


# Private User Documents
@api_view(["GET"])
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
        user=user,
        privacy="private",
        is_in_trash=False,  # document_type='document'
    )

    # Apply pagination
    paginator = InfiniteScrollPagination()
    paginated_documents = paginator.paginate_queryset(private_documents, request)

    # Serialize data
    private_document_urls = [
        {"id": doc.id, "url": doc.url,"summary":doc.summary} for doc in paginated_documents
    ]

    # Return paginated response
    return paginator.get_paginated_response(
        {"private_documents": private_document_urls}
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_file_privacy(request):
    """
    Change the privacy setting of a file.

    Updates the `privacy` field of a specific file to 'public' or 'private'.

    Parameters:
        request (HttpRequest): The HTTP request containing the `image_id` and the desired `privacy`.

    Returns:
        Response: Success or error message.
    """
    image_id = request.data.get("image_id")
    new_privacy = request.data.get("privacy")

    print(image_id, new_privacy)

    if not image_id or new_privacy not in ["public", "private"]:
        return Response(
            {
                "error": "Image ID and valid privacy ('public' or 'private') are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_image = UserImage.objects.get(id=image_id, user=request.user)

        # Update the privacy setting
        user_image.privacy = new_privacy
        user_image.save()

        return Response(
            {"message": f"File privacy changed to '{new_privacy}' successfully."},
            status=status.HTTP_200_OK,
        )

    except UserImage.DoesNotExist:
        return Response(
            {"error": "Image not found or does not belong to the user."},
            status=status.HTTP_404_NOT_FOUND,
        )


# Public Documents
@api_view(["GET"])
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
        is_in_trash=False,
        privacy="public",  # document_type='document'
    )

    # Apply pagination
    paginator = InfiniteScrollPagination()
    paginated_documents = paginator.paginate_queryset(public_documents, request)

    # Serialize data
    public_document_urls = [
        {"id": doc.id, "url": doc.url,"summary":doc.summary} for doc in paginated_documents
    ]

    # Return paginated response
    return paginator.get_paginated_response({"public_documents": public_document_urls})


# Below is favorites related all functions!


@api_view(["POST"])
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

    image_id = request.data.get("id")
    if image_id is None:
        return Response(
            {"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_image = UserImage.objects.get(id=image_id)

        if user_image.privacy == "private" and user_image.user != request.user:
            return Response(
                {"error": "You are not allowed to favorite this image"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if Favourite.objects.filter(user=request.user, image=user_image).exists():
            return Response(
                {"message": "Image is already in favorites"}, status=status.HTTP_200_OK
            )

        # Add image to favorites
        Favourite.objects.create(user=request.user, image=user_image)
        return Response(
            {"message": "Image added to favorites successfully"},
            status=status.HTTP_200_OK,
        )

    except UserImage.DoesNotExist:
        return Response({"error": "Image not found!"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
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
    favorite_images = [{"url": fav.image.url, "id": fav.image.id} for fav in favorites]
    return Response({"favorites": favorite_images}, status=status.HTTP_200_OK)


@api_view(["POST"])
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
        return Response(
            {"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        favorite = Favourite.objects.get(user=request.user, image_id=image_id)
        favorite.delete()

        return Response(
            {"message": "Image removed from favorites successfully"},
            status=status.HTTP_200_OK,
        )

    except Favourite.DoesNotExist:
        return Response(
            {"error": "Image not found in favorites"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
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
@api_view(["GET"])
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
    return Response({"trash": [{"url": image.url, "id": image.id} for image in trash]})


@api_view(["POST"])
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
        return Response(
            {"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_image = UserImage.objects.get(id=image_id, user=request.user)
        user_image.is_in_trash = True
        user_image.save()
        return Response(
            {"message": "Image marked as trash successfully"}, status=status.HTTP_200_OK
        )

    except UserImage.DoesNotExist:
        return Response(
            {"error": "Image not found or does not belong to the user"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["POST"])
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
        return Response(
            {"error": "Image ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_image = UserImage.objects.get(id=image_id, is_in_trash=True)
        user_image.is_in_trash = False
        user_image.save()

        return Response(
            {"message": "Image restored from trash successfully"},
            status=status.HTTP_200_OK,
        )

    except UserImage.DoesNotExist:
        return Response(
            {"error": "Image not found or not in trash!"},
            status=status.HTTP_404_NOT_FOUND,
        )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_tag_to_image(request):
    try:
        image_id = request.data.get('image_id')
        tag_name = request.data.get('tag')

        if not image_id or not tag_name:
            return Response({'error': 'Both image_id and tag are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = UserImage.objects.get(id=image_id)
        except UserImage.DoesNotExist:
            return Response({'error': 'Image not found or you do not have permission to access it.'}, status=status.HTTP_404_NOT_FOUND)
        
        tag, created = Tag.objects.get_or_create(name=tag_name)

        image.tags.add(tag)

        return Response({
            'message': 'Tag added to image successfully.',
            'image_id': image_id,
            'tag': tag.name,
            'tag_created': created
        }, status=status.HTTP_200_OK)

    except Exception as e:
        # Generic error handling
        return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_tag_from_image(request):
    try:
        # Extract data from request
        image_id = request.data.get('image_id')
        tag_name = request.data.get('tag')

        # Validate inputs
        if not image_id or not tag_name:
            return Response({'error': 'Both image_id and tag are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the image
        try:
            image = UserImage.objects.get(id=image_id)
        except UserImage.DoesNotExist:
            return Response({'error': 'Image not found or you do not have permission to access it.'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch the tag
        try:
            tag = Tag.objects.get(name=tag_name)
        except Tag.DoesNotExist:
            return Response({'error': f'Tag "{tag_name}" does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Remove the tag from the image
        if tag in image.tags.all():
            image.tags.remove(tag)
            return Response({
                'message': 'Tag removed from image successfully.',
                'image_id': image_id,
                'tag': tag_name
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': f'Tag "{tag_name}" is not associated with this image.'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Generic error handling
        return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_tags_for_image(request):
    try:
        image_id = request.query_params.get('image_id')
        if not image_id:
            return Response({'error': 'image_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            image = UserImage.objects.get(id=image_id)
        except UserImage.DoesNotExist:
            return Response({'error': 'Image not found or you do not have permission to access it.'}, status=status.HTTP_404_NOT_FOUND)
        tags = image.tags.all()
        tag_names = [tag.name for tag in tags]

        return Response({
            'image_id': image_id,
            'tags': tag_names
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_images(request):
    try:
        # Extract search parameters
        query = request.GET.get('query', '')  # The search keyword
        document_type = request.GET.get('document_type')  # Optional filter for document type (image, video, document)

        # Ensure query is provided
        if not query:
            return Response({'error': 'Search query is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Build query for images and documents
        search_criteria = Q(summary__icontains=query) | Q(tags__name__icontains=query) | Q(url__icontains=query)

        # Filter images based on the document type if provided
        if document_type:
            search_criteria &= Q(document_type=document_type)

        # Fetch images matching the criteria
        images = UserImage.objects.filter(search_criteria, user=request.user).distinct()

        # Prepare the response
        result = [
            {
                'id': image.id,
                'url': image.url,
                'document_type': image.document_type,
                'summary': image.summary,
                'tags': [tag.name for tag in image.tags.all()],
                'privacy': image.privacy
            }
            for image in images
        ]

        return Response({'results': result}, status=status.HTTP_200_OK)

    except Exception as e:
        # Generic error handling
        return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# Groups for sharing related below. Hahahaha
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_group(request):
    """
    Create a group of images/documents with a unique shareable link.
    """
    name = request.data.get("name")
    image_ids = request.data.get("image_ids", [])  # List of UserImage IDs is needed.... ensure its a list
    user = request.user

    if not name or not image_ids:
        return Response(
            {"error": "Group name and image IDs are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Fetch images belonging to the user that is private and fetching all the public images
    images = UserImage.objects.filter(
        Q(privacy='public') | Q(Q(privacy='private') & Q(user=user)),
        id__in=image_ids
    )
    if not images.exists():
        return Response(
            {"error": "No valid images found for the provided IDs."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Create the group
    group = Group.objects.create(name=name, owner=user)
    group.images.set(images)

    return Response(
        {
            "message": "Group created successfully.",
            "shareable_link": str(group.shareable_link),
        },
        status=status.HTTP_201_CREATED,
    )

@api_view(["GET"])
def access_group(request, shareable_link):
    """
    Access a group's images/documents using its shareable link.
    """
    group = get_object_or_404(Group, shareable_link=shareable_link, is_active=True)

    images_data = [
        {
            "id": image.id,
            "url": image.url,
            "document_type": image.document_type,
            "summary": image.summary,
        }
        for image in group.images.all()
    ]

    return Response(
        {"group_name": group.name, "images": images_data},
        status=status.HTTP_200_OK,
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_group_access(request, group_id):
    """
    Activate or deactivate the shareable link for a group.
    """
    user = request.user
    group = get_object_or_404(Group, id=group_id, owner=user)

    # Toggle the active status
    group.is_active = not group.is_active
    group.save()

    status_message = "activated" if group.is_active else "deactivated"
    return Response(
        {"message": f"Group link {status_message}."},
        status=status.HTTP_200_OK,
    )



"""
/list (include pagination) - get_public_photos, get_private_photos, get_public_documents, get_private_documents - done
/upload (support for multiple files) - done
/edit (editing name, access specifier like public private)
/share done at last.. Thanks GPT!
/delete
/search (support ai search feature)
/backup (use web3.storage and setup backup for monthly or weekly bases, find hash of every backup file and if there are no changes the hash will be the same so do not upload the backup file to ipfs)
"""
