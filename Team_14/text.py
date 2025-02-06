from transformers import pipeline
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Load the models (ensure this is done once)
try:
    semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Semantic model loaded successfully.")
except Exception as e:
    print(f"Error loading semantic model: {e}")

# Assuming these are loaded models
text_classifier = pipeline('zero-shot-classification', model='facebook/bart-large-mnli')
sentiment_analyzer = pipeline('sentiment-analysis')

# Define offensive keywords (these could be dynamically updated if needed)
offensive_keywords = ["bully", "stupid", "idiot", "hate", "kill", "violence", "death", "ugly"]

# Function to classify bullying text
def classify_bullying_text(text, offensive_keywords=offensive_keywords):
    print(f"Classifying bullying with text: '{text}'")
    bullying_score = 0

    # Analyze text toxicity using BERT model (Zero-shot classification)
    try:
        if text.strip():
            bert_result = text_classifier(text, candidate_labels=["toxic", "non-toxic"])
            print(f"BERT classification result: {bert_result}")
            if bert_result['labels'][0] == 'toxic' and bert_result['scores'][0] > 0.7:  # High threshold for toxicity
                print("High toxicity detected in text.")
                bullying_score += 3  # Increase score for high toxicity
                return True  # Return immediately if bullying detected
            elif bert_result['labels'][0] == 'toxic' and bert_result['scores'][0] > 0.5:  # Medium toxicity
                print("Medium toxicity detected in text.")
                bullying_score += 2  # Medium toxicity, moderate weight
    except Exception as e:
        print(f"Error in text classification: {e}")
    
    # Perform sentiment analysis
    try:
        sentiment_result = sentiment_analyzer(text)
        print(f"Sentiment analysis result: {sentiment_result}")
        if sentiment_result[0]['label'] == 'NEGATIVE' and sentiment_result[0]['score'] > 0.75:  # High threshold for negative sentiment
            print("Negative sentiment detected, marking as bullying.")
            bullying_score += 2  # Add score for negative sentiment
            return True  # Return immediately if bullying detected
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")

    # Check for offensive keywords in text
    try:
        if any(keyword in text.lower() for keyword in offensive_keywords):
            print("Detected offensive keyword(s) in text.")
            bullying_score += 2  # Increase score for offensive keywords
            return True  # Return immediately if bullying detected
    except Exception as e:
        print(f"Error in offensive keyword detection: {e}")

    # Semantic similarity analysis
    try:
        offensive_embeddings = semantic_model.encode(offensive_keywords)
        text_embedding = semantic_model.encode([text])
        similarity_scores = cosine_similarity(text_embedding, offensive_embeddings).flatten()
        if max(similarity_scores) > 0.8:  # Threshold for semantic similarity
            print(f"High semantic similarity with offensive phrases: {max(similarity_scores)}")
            bullying_score += 2  # Increase score for high similarity
            return True  # Return immediately if bullying detected
    except Exception as e:
        print(f"Error in semantic similarity analysis: {e}")

    # Final decision based on bullying score
    if bullying_score >= 6:
        print("Bullying detected based on score.")
        return True  # Classify as bullying
    else:
        print("No bullying detected.")
        return False  # Classify as not bullying
