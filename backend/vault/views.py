from pathlib import Path
from rest_framework.decorators import api_view, permission_classes,parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from .models import UserImage, Favourite


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_images(request):
    images = request.FILES.getlist("images") 
    privacy = request.data.get("privacy", "public").lower()  
    user = request.user

    # Define the single target path for all images
    target_path = Path(settings.MEDIA_ROOT) / "photos"

    # Ensure the photos folder exists
    try:
        target_path.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        return Response({"error": f"Could not create folder: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    saved_files = []
    for image in images:
        try:
            # Save each image in the "photos" folder
            image_path = target_path / image.name
            with open(image_path, "wb+") as destination:
                for chunk in image.chunks():
                    destination.write(chunk)
            
            # Formulate the complete URL with request information
            image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}photos/{image.name}")

            # Save the image record in the database with privacy setting
            user_image = UserImage.objects.create(
                user=user,
                image_url=image_url,
                is_favorite=False,
                is_in_trash=False,
                privacy=privacy  
            )
            
            saved_files.append({"id": user_image.id, "url": image_url})

        except Exception as e:
            return Response({"error": f"Error saving file '{image.name}': {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Images uploaded successfully", "files": saved_files}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_public_photos(request):
    public_images = UserImage.objects.filter(is_in_trash=False)

    public_image_urls = []

    for image in public_images:
        public_image_urls.append({
            "id": image.id,
            "url": image.image_url
        })

    return Response({"public_photos": public_image_urls}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_private_images(request):
    user = request.user
    private_images = UserImage.objects.filter(user=user, privacy='private', is_in_trash=False)
    
    private_image_urls = [{"id": image.id, "url": image.image_url} for image in private_images]
    
    return Response({"private_images": private_image_urls}, status=status.HTTP_200_OK)

# Below is favorites related all functions!

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_favorites(request):
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
    user = request.user
    favorites = Favourite.objects.filter(user=user)
    favorite_images = [{"image_url": fav.image.image_url, "image_id": fav.image.id} for fav in favorites]
    return Response({"favorites": favorite_images}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_favorites(request):
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
    is_fav = Favourite.objects.filter(user=request.user, image_id=image_id).exists()
    return Response({"is_favorite": is_fav}, status=status.HTTP_200_OK)



# Trash related everything is below
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_trash(request):
    user = request.user
    trash = UserImage.objects.filter(user=user, is_in_trash=True)
    return Response({"trash": [image.image_url for image in trash]})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_image_as_trash(request):
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