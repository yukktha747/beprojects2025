# import cv2
# import os
# from yolov5 import detect
# import easyocr
# from transformers import pipeline
# from sentence_transformers import SentenceTransformer
# from sklearn.metrics.pairwise import cosine_similarity
# import imghdr

# # Initialize EasyOCR reader
# reader = easyocr.Reader(['en'], model_storage_directory=os.path.expanduser('~/.EasyOCR/model/'))

# # Initialize Transformers pipelines
# print("Loading BERT model for cyberbullying classification...")
# text_classifier = pipeline("text-classification", model="unitary/toxic-bert", tokenizer="unitary/toxic-bert")

# print("Loading sentiment analysis model...")
# sentiment_analyzer = pipeline("sentiment-analysis")

# print("Loading sentence transformer for semantic analysis...")
# semantic_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# # Offensive keywords and phrases
# offensive_keywords = [
#     "terrorist", "ISIS", "jihad", "racist", "hate", "kill", "bomb", "shoot", "slur",
#     "religion", "ethnicity", "nazi", "supremacy", "inferior", "harass", "you don't belong here",
#     "go back to your country", "worthless", "disgusting"
# ]

# # Function to detect objects using YOLOv5
# def detect_objects(image_path):
#     print(f"Running YOLOv5 detection on {image_path}...")
#     try:
#         results = detect.run(weights="yolov5/yolov5s.pt", source=image_path, conf_thres=0.4)
#         if hasattr(results, "pandas") and results.pandas():
#             objects = results.pandas().xyxy[0]["name"].tolist()  # Extract object names
#             print(f"Detected objects: {objects}")
#             return objects
#     except Exception as e:
#         print(f"Error in object detection: {e}")
#     return []  # Return an empty list if detection fails

# # Function to extract text from images
# def extract_text(image_path):
#     print(f"Extracting text from {image_path} using EasyOCR...")
#     try:
#         result = reader.readtext(image_path, detail=0)  # Extract text only
#         result = [text.strip() for text in result]  # Clean extracted text
#         print(f"Extracted text: {result}")
#         return " ".join(result)
#     except Exception as e:
#         print(f"Error extracting text: {e}")
#         return ""

# # Function to classify bullying based on text and objects
# def classify_bullying(text, objects, image_path):
#     print(f"Classifying bullying with text: '{text}' and objects: {objects}")
#     bullying_score = 0

#     # Analyze text toxicity
#     try:
#         if text.strip():
#             bert_result = text_classifier(text)
#             print(f"BERT classification result: {bert_result}")
#             if bert_result[0]['label'] == 'toxic' and bert_result[0]['score'] > 0.7:
#                 bullying_score += 2  # Higher weight for toxic classification
#     except Exception as e:
#         print(f"Error in text classification: {e}")
    
#     # Perform sentiment analysis
#     try:
#         sentiment_result = sentiment_analyzer(text)
#         print(f"Sentiment analysis result: {sentiment_result}")
#         if sentiment_result[0]['label'] == 'NEGATIVE' and sentiment_result[0]['score'] > 0.75:  # Increased threshold for negative sentiment
#             print("Negative sentiment detected, marking as bullying.")
#             return True  # Immediately classify as bullying if sentiment is negative
#     except Exception as e:
#         print(f"Error in sentiment analysis: {e}")

#     # Semantic similarity analysis
#     try:
#         offensive_embeddings = semantic_model.encode(offensive_keywords)
#         text_embedding = semantic_model.encode([text])
#         similarity_scores = cosine_similarity(text_embedding, offensive_embeddings).flatten()
#         if max(similarity_scores) > 0.8:  # Threshold for semantic similarity
#             print(f"High semantic similarity with offensive phrases: {max(similarity_scores)}")
#             bullying_score += 2  # Increase score for semantic similarity
#     except Exception as e:
#         print(f"Error in semantic similarity analysis: {e}")

#     # Check for offensive objects
#     offensive_objects = ["weapon", "blood", "offensive_object"]  # Customize as needed
#     if any(obj in offensive_objects for obj in objects):
#         print("Detected offensive object(s).")
#         bullying_score += 2  # Increase score for offensive objects

#     # Check for offensive keywords in text
#     if any(keyword in text.lower() for keyword in offensive_keywords):
#         print("Detected offensive keyword(s) in text.")
#         bullying_score += 2  # Increase score for offensive keywords

#     # Consider as bullying if any mechanism flags it strongly
#     return bullying_score >= 6  # Flag bullying if score is >= 6

# # Function to process video frames
# def process_video_for_bullying(video_path):
#     # Open the video file
#     cap = cv2.VideoCapture(video_path)
    
#     results = []  # To store the results of each frame
#     frame_count = 0
    
#     while cap.isOpened():
#         ret, frame = cap.read()
        
#         if not ret:
#             break
        
#         frame_count += 1
#         print(f"Processing frame {frame_count}...")
        
#         # Save the current frame as an image temporarily
#         frame_path = f"frame_{frame_count}.jpg"
#         cv2.imwrite(frame_path, frame)
        
#         # Process the frame as an image
#         is_bullying = process_frame_for_bullying(frame_path)  # Reuse the image processing logic
        
#         results.append({
#             "frame": frame_count,
#             "bullying": is_bullying
#         })
    
#     cap.release()
#     return results

# # Main frame processing function for individual frames
# def process_frame_for_bullying(image_path):
#     # Initialize the default result
#     result = {
#         "image": image_path,
#         "bullying": False,  # Default to False unless classified otherwise
#         "objects": [],
#         "text": "",
#         "error": None
#     }

#     # Validate the image file format
#     if not imghdr.what(image_path):  # Checks if it's a valid image format
#         print(f"Invalid image file: {image_path}")
#         result["error"] = "Invalid image file"
#         return result["bullying"]

#     try:
#         # Detect objects in the image
#         objects = detect_objects(image_path)
#         print(f"Objects detected: {objects}")

#         # Extract text from the image
#         text = extract_text(image_path)
#         print(f"Extracted text: {text}")

#         # Classify bullying based on the detected objects and extracted text
#         is_bullying = classify_bullying(text, objects, image_path)
#         print(f"Bullying classification result: {is_bullying}")

#         # Update the result dictionary
#         result.update({
#             "bullying": is_bullying,  # Boolean result
#             "objects": objects,
#             "text": text
#         })

#     except Exception as e:
#         print(f"Error processing {image_path}: {e}")
#         result["error"] = str(e)

#     return is_bullying

# # Example usage
# # video_path = "path_to_your_video.mp4"
# # results = process_video_for_bullying(video_path)
# # print("Bullying detection results for video:")
# # print(results)








import cv2
import os
import easyocr
import subprocess
import imghdr
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'], model_storage_directory=os.path.expanduser('~/.EasyOCR/model/'))

# Initialize Transformers pipelines
print("Loading BERT model for cyberbullying classification...")
text_classifier = pipeline("text-classification", model="unitary/toxic-bert", tokenizer="unitary/toxic-bert")

print("Loading sentiment analysis model...")
sentiment_analyzer = pipeline("sentiment-analysis")

print("Loading sentence transformer for semantic analysis...")
semantic_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

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
        subprocess.run(["python", "yolov5/detect.py", "--weights", "yolov5s.pt", "--source", image_path, "--conf-thres", "0.4"], check=True)
        # Assuming results are stored in 'runs/detect/exp/' by YOLOv5
        detected_objects = []  # List to store detected objects
        results_path = "runs/detect/exp/labels"
        
        if os.path.exists(results_path):
            for file in os.listdir(results_path):
                if file.endswith(".txt"):  # YOLO stores detections as .txt files
                    with open(os.path.join(results_path, file), "r") as f:
                        detected_objects.extend([line.split()[0] for line in f.readlines()])
        
        print(f"Detected objects: {detected_objects}")
        return detected_objects
    except Exception as e:
        print(f"Error in object detection: {e}")
        return []

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

# Function to classify bullying based on text and objects
def classify_bullying(text, objects):
    print(f"Classifying bullying with text: '{text}' and objects: {objects}")
    bullying_score = 0

    # Analyze text toxicity
    try:
        if text.strip():
            bert_result = text_classifier(text)
            print(f"BERT classification result: {bert_result}")
            toxic_labels = ["toxic", "severe_toxic", "obscene", "insult", "threat", "identity_hate"]
            if any(item['label'] in toxic_labels and item['score'] > 0.7 for item in bert_result):
                bullying_score += 2  # Higher weight for toxic classification
    except Exception as e:
        print(f"Error in text classification: {e}")
    
    # Perform sentiment analysis
    try:
        sentiment_result = sentiment_analyzer(text)
        print(f"Sentiment analysis result: {sentiment_result}")
        if sentiment_result[0]['label'] == 'NEGATIVE' and sentiment_result[0]['score'] > 0.75:
            print("Negative sentiment detected, marking as bullying.")
            return True  # Immediately classify as bullying if sentiment is negative
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")

    # Semantic similarity analysis
    try:
        offensive_embeddings = semantic_model.encode(offensive_keywords)
        text_embedding = semantic_model.encode([text])
        similarity_scores = cosine_similarity(text_embedding, offensive_embeddings).flatten()
        if max(similarity_scores) > 0.8:
            print(f"High semantic similarity with offensive phrases: {max(similarity_scores)}")
            bullying_score += 2  # Increase score for semantic similarity
    except Exception as e:
        print(f"Error in semantic similarity analysis: {e}")

    # Check for offensive objects
    offensive_objects = ["weapon", "blood", "offensive_object"]
    if any(obj in offensive_objects for obj in objects):
        print("Detected offensive object(s).")
        bullying_score += 2  # Increase score for offensive objects

    # Check for offensive keywords in text
    if any(keyword in text.lower() for keyword in offensive_keywords):
        print("Detected offensive keyword(s) in text.")
        bullying_score += 2  # Increase score for offensive keywords

    # Consider as bullying if any mechanism flags it strongly
    return bullying_score >= 6

# Function to process video frames
def process_video_for_bullying(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    bullying_detected = False  # Store final bullying result
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        print(f"Processing frame {frame_count}...")

        frame_path = f"frame_{frame_count}.jpg"
        cv2.imwrite(frame_path, frame)

        # Process the frame as an image
        is_bullying = process_frame_for_bullying(frame_path)

        # If any frame is bullying, set the flag to True
        if is_bullying:
            bullying_detected = True

        # Delete the frame to save space
        os.remove(frame_path)

        # Stop further processing if bullying is detected
        if bullying_detected:
            break

    cap.release()
    return bullying_detected

# Function to process individual frames for bullying detection
def process_frame_for_bullying(image_path):
    result = {
        "image": image_path,
        "bullying": False,
        "objects": [],
        "text": "",
        "error": None
    }

    # Validate the image file format
    if not imghdr.what(image_path):
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

        # Classify bullying
        is_bullying = classify_bullying(text, objects)
        print(f"Bullying classification result: {is_bullying}")

        result.update({
            "bullying": is_bullying,
            "objects": objects,
            "text": text
        })

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        result["error"] = str(e)

    return result["bullying"]

# Example Usage:
# video_path = "path_to_your_video.mp4"
# results = process_video_for_bullying(video_path)
# print("Bullying detection results for video:")
# print(results)
