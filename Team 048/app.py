from flask import Flask, render_template, request
import numpy as np
import pickle
from datetime import datetime

app = Flask(__name__)

# Load the saved model with error handling
try:
    model = pickle.load(open('./model.pkl', 'rb'))
    print("Model loaded successfully!")
except FileNotFoundError:
    print("Error: model.pkl file not found.")
    model = None
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/about")
def aboutus():
    return render_template('about.html')

@app.route('/contactus')
def contact():
    return render_template('contact.html')

@app.route('/predict')
def predict():
    return render_template('Heart Disease Classifier.html')

@app.route('/predict', methods=['POST'])
def predictm():
    try:
        if not model:
            return "Error: Model is not loaded. Please check the model file.", 500
        
        # Collect and validate input features (13 features)
        feature_keys = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        features = []
        for key in feature_keys:
            value = request.form.get(key)
            if not value:
                return f"Error: '{key}' field is required", 400
            features.append(float(value) if key == 'oldpeak' else int(value))

        # Collect patient details
        patient_details = {}
        required_fields = ['name', 'emailid', 'mo']
        for field in required_fields:
            value = request.form.get(field)
            if not value:
                return f"Error: '{field}' field is required", 400
            patient_details[field] = value

        # Add timestamp
        patient_details['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Predict the result
        features_reshaped = np.array(features).reshape(1, -1)
        prediction = model.predict(features_reshaped)
        output = prediction[0]

        # Render appropriate result page
        if output == 1:
            return render_template('positive.html', rvalue=features, p=patient_details)
        else:
            return render_template('negative.html', rvalue=features, p=patient_details)

    except Exception as e:
        return f"An error occurred: {str(e)}", 500

if __name__ == '__main__':
    app.debug = True
    app.run(host='localhost', port=5000)
