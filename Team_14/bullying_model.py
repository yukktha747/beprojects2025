import os
import pandas as pd
from yolov5 import detect
import easyocr
from PIL import Image
from transformers import pipeline, CLIPProcessor, CLIPModel
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import imghdr

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'], model_storage_directory=os.path.expanduser('~/.EasyOCR/model/'))

# Initialize Transformers pipelines
print("Loading BERT model for cyberbullying classification...")
text_classifier = pipeline("text-classification", model="unitary/toxic-bert", tokenizer="unitary/toxic-bert")

print("Loading sentiment analysis model...")
sentiment_analyzer = pipeline("sentiment-analysis")

print("Loading sentence transformer for semantic analysis...")
semantic_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Initialize CLIP model and processor
print("Loading CLIP model for text-image alignment...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Offensive keywords and phrases
offensive_keywords = [
    "terrorist", "ISIS", "jihad", "racist", "hate", "kill", "bomb", "shoot", "slur",
    "religion", "ethnicity", "nazi", "supremacy", "inferior", "harass", "you don't belong here",
    "go back to your country", "worthless", "disgusting"
]

# Function to detect objects using YOLOv5
def detect_objects(image_path):
    print(f"Running YOLOv5 detection on {image_path}...")
    try:
        results = detect.run(weights="yolov5/yolov5s.pt", source=image_path, conf_thres=0.4)
        if hasattr(results, "pandas") and results.pandas():
            objects = results.pandas().xyxy[0]["name"].tolist()  # Extract object names
            print(f"Detected objects: {objects}")
            return objects
    except Exception as e:
        print(f"Error in object detection: {e}")
    return []  # Return an empty list if detection fails

# Function to extract text from images
def extract_text(image_path):
    print(f"Extracting text from {image_path} using EasyOCR...")
    try:
        result = reader.readtext(image_path, detail=0)  # Extract text only
        result = [text.strip() for text in result]  # Clean extracted text
        print(f"Extracted text: {result}")
        return " ".join(result)
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

# Function to check text-image alignment using CLIP
def check_text_image_alignment(image_path, text):
    print(f"Checking text-image alignment for: {text}")
    try:
        # Load the image using PIL
        image = Image.open(image_path).convert("RGB")
        
        # Process the image and text with CLIP
        inputs = clip_processor(text=[text], images=image, return_tensors="pt", padding=True)
        outputs = clip_model(**inputs)
        
        # Extract similarity score
        logits_per_image = outputs.logits_per_image
        similarity_score = logits_per_image.softmax(dim=1).item()
        print(f"Text-Image Similarity Score: {similarity_score}")
        return similarity_score
    except Exception as e:
        print(f"Error in text-image alignment: {e}")
        return 0  # Return a low score in case of failure

# Function to classify bullying based on text and objects
def classify_bullying(text, objects, image_path):
    print(f"Classifying bullying with text: '{text}' and objects: {objects}")
    bullying_score = 0

    # Analyze text toxicity
    try:
        if text.strip():
            bert_result = text_classifier(text)
            print(f"BERT classification result: {bert_result}")
            if bert_result[0]['label'] == 'toxic' and bert_result[0]['score'] > 0.7:
                bullying_score += 2  # Higher weight for toxic classification
    except Exception as e:
        print(f"Error in text classification: {e}")
    
    # Perform sentiment analysis
    try:
        sentiment_result = sentiment_analyzer(text)
        print(f"Sentiment analysis result: {sentiment_result}")
        if sentiment_result[0]['label'] == 'NEGATIVE' and sentiment_result[0]['score'] > 0.75:  # Increased threshold for negative sentiment
            print("Negative sentiment detected, marking as bullying.")
            return True  # Immediately classify as bullying if sentiment is negative
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")

    # Semantic similarity analysis
    try:
        offensive_embeddings = semantic_model.encode(offensive_keywords)
        text_embedding = semantic_model.encode([text])
        similarity_scores = cosine_similarity(text_embedding, offensive_embeddings).flatten()
        if max(similarity_scores) > 0.8:  # Threshold for semantic similarity
            print(f"High semantic similarity with offensive phrases: {max(similarity_scores)}")
            bullying_score += 2  # Increase score for semantic similarity
    except Exception as e:
        print(f"Error in semantic similarity analysis: {e}")

    # Check for offensive objects
    offensive_objects = ["weapon", "blood", "offensive_object"]  # Customize as needed
    if any(obj in offensive_objects for obj in objects):
        print("Detected offensive object(s).")
        bullying_score += 2  # Increase score for offensive objects

    # Check for offensive keywords in text
    if any(keyword in text.lower() for keyword in offensive_keywords):
        print("Detected offensive keyword(s) in text.")
        bullying_score += 2  # Increase score for offensive keywords

    # Check text-image alignment using CLIP
    alignment_score = check_text_image_alignment(image_path, text)
    if alignment_score < 0.2:  # Threshold for low alignment
        print("Low text-image alignment, flagging as bullying.")
        bullying_score += 2

    # Consider as bullying if any mechanism flags it strongly
    return bullying_score >= 6  # Flag bullying if score is >= 6

# Main function to process images
# def process_images(folder_path):
#     results = []
#     for image_name in os.listdir(folder_path):
#         image_path = os.path.join(folder_path, image_name)
#         print(f"Processing {image_name}...")

#         # Ensure it's an image file
#         if not image_name.lower().endswith(('.png', '.jpg', '.jpeg')):
#             print(f"Skipping non-image file: {image_name}")
#             continue

#         objects = detect_objects(image_path)
#         text = extract_text(image_path)
#         is_bullying = classify_bullying(text, objects, image_path)
#         results.append({"image": image_name, "bullying": is_bullying})

#     return results

import imghdr

# process_images function
def process_images(image_path):
    # Initialize the default result
    result = {
        "image": image_path,
        "bullying": False,  # Default to False unless classified otherwise
        "objects": [],
        "text": "",
        "error": None
    }

    # Validate the image file format
    if not imghdr.what(image_path):  # Checks if it's a valid image format
        print(f"Invalid image file: {image_path}")
        result["error"] = "Invalid image file"
        return result["bullying"]

    try:
        # Detect objects in the image
        objects = detect_objects(image_path)
        print(f"Objects detected: {objects}")

        # Extract text from the image
        text = extract_text(image_path)
        print(f"Extracted text: {text}")

        # Classify bullying based on the detected objects and extracted text
        is_bullying = classify_bullying(text, objects, image_path)
        print(f"Bullying classification result: {is_bullying}")

        # Update the result dictionary
        result.update({
            "bullying": is_bullying,  # Boolean result
            "objects": objects,
            "text": text
        })

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        result["error"] = str(e)

    return is_bullying