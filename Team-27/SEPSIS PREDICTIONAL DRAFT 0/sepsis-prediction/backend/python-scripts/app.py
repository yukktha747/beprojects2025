from flask import Flask, render_template, request, jsonify, redirect, url_for
import joblib
import numpy as np
import pandas as pd
from lime.lime_tabular import LimeTabularExplainer
import os
import sys
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.calibration import CalibratedClassifierCV
from sklearn.impute import SimpleImputer

# Local imports
from enhanced_stacking_model import EnhancedStackingModel
from config import STACKING_CONFIG

app = Flask(__name__)

# Get the absolute path to the model file
current_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(current_dir, 'models', 'enhanced_stacking_model_20241215_001940.joblib')

# Load the model
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully!")
    print(f"Model type: {type(model)}")
    
    # Print feature information
    if hasattr(model, 'feature_engineer'):
        print("Model has feature engineer")
        try:
            if hasattr(model.feature_engineer, 'get_feature_names'):
                feature_names = model.feature_engineer.get_feature_names()
                print(f"Number of features after engineering: {len(feature_names)}")
                print("First 10 engineered feature names:")
                for i, name in enumerate(feature_names[:10]):
                    print(f"{i+1}. {name}")
        except Exception as e:
            print(f"Error getting feature names: {e}")
    
    if hasattr(model, 'dim_reducer'):
        print("Model has dimension reducer")
        try:
            if hasattr(model.dim_reducer, 'n_components_'):
                print(f"Dimensionality after reduction: {model.dim_reducer.n_components_}")
            elif hasattr(model.dim_reducer, 'n_components'):
                print(f"Dimensionality after reduction: {model.dim_reducer.n_components}")
            else:
                print("Dimensionality information not available")
        except Exception as e:
            print(f"Error getting dimensionality information: {e}")

except Exception as e:
    print(f"Error loading model: {e}")
    print(f"Attempted to load from: {MODEL_PATH}")
    raise

# Define features and their properties
FEATURES = {
    # Demographics
    'age': {'description': 'Patient Age (years)', 'range': (18, 100)},
    'gender': {'description': 'Patient Gender', 'options': ['Male', 'Female']},
    'weight_kg': {'description': 'Weight (kg)', 'range': (40, 150)},
    'bmi': {'description': 'Body Mass Index', 'range': (15, 45)},
    
    # Vital Signs
    'heart_rate': {'description': 'Heart Rate (beats/min)', 'range': (40, 200)},
    'respiratory_rate': {'description': 'Respiratory Rate (breaths/min)', 'range': (8, 60)},
    'systolic_bp': {'description': 'Systolic Blood Pressure (mmHg)', 'range': (70, 220)},
    'diastolic_bp': {'description': 'Diastolic Blood Pressure (mmHg)', 'range': (40, 130)},
    'temperature': {'description': 'Body Temperature (°C)', 'range': (34, 42)},
    'spo2': {'description': 'Oxygen Saturation (%)', 'range': (70, 100)},
    
    # Lab Values
    'wbc_count': {'description': 'White Blood Cell Count (K/µL)', 'range': (0.5, 50)},
    'hemoglobin': {'description': 'Hemoglobin (g/dL)', 'range': (5, 18)},
    'platelet_count': {'description': 'Platelet Count (K/µL)', 'range': (20000, 1000000)},
    'creatinine': {'description': 'Creatinine (mg/dL)', 'range': (0.3, 15)},
    'lactate': {'description': 'Lactate (mmol/L)', 'range': (0.5, 20)},
    'bilirubin': {'description': 'Total Bilirubin (mg/dL)', 'range': (0.2, 15)},
    
    # Clinical Assessments
    'mental_status': {'description': 'Mental Status', 
                     'options': ['Alert', 'Confused', 'Drowsy', 'Unresponsive']},
    'gcs_score': {'description': 'Glasgow Coma Scale', 'range': (3, 15)},
    
    # Key Markers
    'procalcitonin': {'description': 'Procalcitonin (ng/mL)', 'range': (0, 100)},
    'crp': {'description': 'C-Reactive Protein (mg/L)', 'range': (0, 500)}
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculate')
def calculate():
    return render_template('calculate.html', features=FEATURES)

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'GET':
        return redirect(url_for('calculate'))
        
    try:
        # Collect input data
        input_data = {}
        for feature in FEATURES.keys():
            value = request.form.get(feature)
            if not value and feature not in ['mental_status', 'gender']:
                return jsonify({'error': f'Missing value for {feature}'})
            
            if feature not in ['mental_status', 'gender']:
                try:
                    input_data[feature] = float(value)
                except ValueError:
                    return jsonify({'error': f'Invalid value for {feature}'})
            else:
                input_data[feature] = value

        # Preprocess features
        try:
            preprocessed_data = preprocess_features(input_data)
            
            # Get prediction
            raw_proba = model.predict_proba(preprocessed_data)[0][1]
            
            # Apply clinical rules
            clinical_probability = apply_clinical_rules(input_data, raw_proba)
            
            # Scale probability
            scaled_probability = np.clip(clinical_probability, 0, 1)
            final_probability = scaled_probability * 100
            
            print("Raw probability:", raw_proba)
            print("Clinical probability:", clinical_probability)
            print("Final probability:", final_probability)
            
            # Calculate risk level
            risk_level = get_risk_level(scaled_probability)
            
            # Get SIRS criteria and other indicators
            sirs_count = sum_sirs_criteria(input_data)
            organ_dysfunction = check_organ_dysfunction(input_data)
            inflammation = check_inflammation_markers(input_data)
            
            result = {
                'prediction': int(scaled_probability > 0.5),
                'probability': round(final_probability, 1),
                'risk_level': risk_level,
                'clinical_indicators': {
                    'sirs_criteria_met': sirs_count,
                    'organ_dysfunction': organ_dysfunction,
                    'inflammation_markers': inflammation
                }
            }
            
            return render_template(
                'result.html',
                result=result,
                input_data=input_data,
                features=FEATURES
            )
            
        except Exception as e:
            print(f"Prediction error: {str(e)}")
            return jsonify({'error': f"Prediction error: {str(e)}"})
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)})

def create_polynomial_features(data, degree=2):
    """Create polynomial features with string feature names"""
    if isinstance(data, pd.DataFrame):
        data = data.fillna(0)
    
    from sklearn.preprocessing import PolynomialFeatures
    poly = PolynomialFeatures(degree=degree, include_bias=False)
    
    try:
        features = poly.fit_transform(data)
        # Create DataFrame with string feature names
        feature_names = [f'poly_{i}' for i in range(1000)]
        features_df = pd.DataFrame(
            features, 
            columns=feature_names[:features.shape[1]]
        )
        
        # Pad with zeros if needed
        if features_df.shape[1] < 1000:
            for i in range(features_df.shape[1], 1000):
                features_df[f'poly_{i}'] = 0
                
        return features_df.values[:, :1000]
    except Exception as e:
        print(f"Error in polynomial features: {str(e)}")
        return np.zeros((data.shape[0], 1000))

def create_interaction_features(data):
    """Create interaction features with string feature names"""
    if isinstance(data, pd.DataFrame):
        data = data.fillna(0)
        numerical_cols = data.select_dtypes(include=['float64', 'int64']).columns
        target_size = 200
        
        interactions = []
        interaction_names = []
        for i, col1 in enumerate(numerical_cols):
            for col2 in numerical_cols[i+1:]:
                interactions.append(data[col1] * data[col2])
                interaction_names.append(f'interaction_{col1}_{col2}')
        
        if interactions:
            features = pd.DataFrame(
                np.column_stack(interactions),
                columns=[str(x) for x in interaction_names]
            )
            
            # Pad with zeros if needed
            while features.shape[1] < target_size:
                features[f'interaction_{features.shape[1]}'] = 0
                
            return features.values[:, :target_size]
    
    return np.zeros((data.shape[0], target_size))

def create_statistical_features(data):
    """Create statistical features with string feature names"""
    target_size = 76
    if isinstance(data, pd.DataFrame):
        data = data.fillna(0)
        numerical_cols = data.select_dtypes(include=['float64', 'int64']).columns
        
        stats = []
        stat_names = []
        
        # Basic statistics
        for stat in ['mean', 'std', 'max', 'min', 'skew', 'kurt']:
            stats.append(getattr(data[numerical_cols], stat)(axis=1).values.reshape(-1, 1))
            stat_names.append(f'stat_{stat}')
        
        features = pd.DataFrame(
            np.hstack(stats),
            columns=[str(x) for x in stat_names]
        )
        
        # Pad with zeros if needed
        while features.shape[1] < target_size:
            features[f'stat_{features.shape[1]}'] = 0
            
        return features.values[:, :target_size]
    
    return np.zeros((data.shape[0], target_size))

def get_risk_level(probability):
    """Convert probability to risk level (probability should be between 0-1)"""
    # Ensure probability is between 0 and 1
    scaled_prob = np.clip(probability, 0, 1)
    
    if scaled_prob < 0.2:
        return {'level': 'Low', 'color': 'green'}
    elif scaled_prob < 0.6:
        return {'level': 'Medium', 'color': 'orange'}
    else:
        return {'level': 'High', 'color': 'red'}

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        data = request.get_json()
        df = pd.DataFrame([data])
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]
        
        # Ensure probability is properly scaled
        scaled_probability = np.clip(probability, 0, 1)
        final_probability = scaled_probability * 100
        
        return jsonify({
            'prediction': int(prediction),
            'probability': round(final_probability, 2),
            'risk_level': get_risk_level(scaled_probability)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_model_features():
    """Get the complete list of features expected by the model"""
    try:
        # Initialize base features from FEATURES dictionary
        base_features = list(FEATURES.keys())
        print(f"Base features ({len(base_features)}):")
        for f in base_features:
            print(f"- {f}")
            
        # Get engineered features if available
        engineered_features = None
        final_dimension = len(base_features)
        
        if hasattr(model, 'feature_engineer'):
            print("\nFeature engineering steps:")
            try:
                if hasattr(model.feature_engineer, 'get_feature_names'):
                    engineered_features = model.feature_engineer.get_feature_names()
                    print(f"\nEngineered features ({len(engineered_features)}):")
                    for f in engineered_features:
                        print(f"- {f}")
                    final_dimension = len(engineered_features)
            except Exception as e:
                print(f"Error getting engineered features: {e}")
                
        # Get final features after dimension reduction if applicable
        if hasattr(model, 'dim_reducer'):
            try:
                if hasattr(model.dim_reducer, 'n_components_'):
                    final_dimension = model.dim_reducer.n_components_
                elif hasattr(model.dim_reducer, 'n_components'):
                    final_dimension = model.dim_reducer.n_components
                print(f"\nDimensionality after reduction: {final_dimension}")
            except Exception as e:
                print(f"Error getting dimension reduction info: {e}")
            
        return {
            'base_features': base_features,
            'engineered_features': engineered_features,
            'final_dimension': final_dimension
        }
        
    except Exception as e:
        print(f"Error getting feature information: {e}")
        return None

# Add a route to view features
@app.route('/features')
def view_features():
    features_info = get_model_features()
    return render_template('features.html', features_info=features_info)

def preprocess_features(input_data):
    """
    Preprocess and normalize features with imputation
    """
    try:
        # Convert input dictionary to DataFrame
        df = pd.DataFrame([input_data])
        
        # Handle categorical variables first
        if 'gender' in df.columns:
            df['gender'] = (df['gender'] == 'Male').astype(float)
            
        if 'mental_status' in df.columns:
            status_map = {
                'Alert': 0,
                'Confused': 1,
                'Drowsy': 2,
                'Unresponsive': 3
            }
            df['mental_status'] = df['mental_status'].map(status_map).astype(float)
        
        # Convert all columns to float
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Fill NaN values
        df = df.fillna(0)
        
        # Create engineered features more efficiently
        n_features = 1276
        feature_names = [f'engineered_feature_{i}' for i in range(n_features)]
        
        # Initialize with zeros
        data = np.zeros((1, n_features))
        
        # Fill in the actual values
        for i, col in enumerate(df.columns):
            if i < n_features:
                data[0, i] = df[col].iloc[0]
        
        # Create DataFrame all at once
        engineered_features = pd.DataFrame(
            data,
            columns=feature_names
        )
        
        print("Engineered features shape:", engineered_features.shape)
        return engineered_features
        
    except Exception as e:
        print(f"Error in preprocessing: {str(e)}")
        raise

def apply_clinical_rules(features, probability):
    # Define SIRS criteria
    sirs_criteria = 0
    if features['temperature'] > 38.0 or features['temperature'] < 36.0:
        sirs_criteria += 1
    if features['heart_rate'] > 90:
        sirs_criteria += 1
    if features['respiratory_rate'] > 20:
        sirs_criteria += 1
    if features['wbc_count'] > 12.0 or features['wbc_count'] < 4.0:
        sirs_criteria += 1

    # Adjust probability based on clinical rules
    if sirs_criteria < 2 and features['lactate'] < 2.0 and features['procalcitonin'] < 0.5:
        probability *= 0.5  # Reduce probability for clearly normal cases
    
    return probability

def calculate_confidence_metrics(features):
    # Calculate reliability score based on key indicators
    reliability_score = 0
    max_score = 7
    
    # Check vital signs reliability
    if all(pd.notna(features[vital]) for vital in ['heart_rate', 'respiratory_rate', 'temperature', 'blood_pressure']):
        reliability_score += 2
        
    # Check lab values reliability
    if all(pd.notna(features[lab]) for lab in ['wbc_count', 'lactate', 'procalcitonin']):
        reliability_score += 3
        
    # Check clinical assessment reliability
    if pd.notna(features['mental_status']) and pd.notna(features['gcs_score']):
        reliability_score += 2
        
    return reliability_score / max_score

def sum_sirs_criteria(features):
    """
    Calculate the number of SIRS criteria met
    """
    sirs_count = 0
    
    # Temperature criteria
    if features['temperature'] > 38.3 or features['temperature'] < 36.0:
        sirs_count += 1
        
    # Heart rate criteria
    if features['heart_rate'] > 90:
        sirs_count += 1
        
    # Respiratory rate criteria
    if features['respiratory_rate'] > 20:
        sirs_count += 1
        
    # WBC criteria
    if features['wbc_count'] > 12.0 or features['wbc_count'] < 4.0:
        sirs_count += 1
        
    return sirs_count

def check_organ_dysfunction(features):
    """
    Check for signs of organ dysfunction
    """
    dysfunction = {
        'cardiovascular': features['systolic_bp'] < 90,
        'respiratory': features['spo2'] < 92,
        'renal': features['creatinine'] > 1.5,
        'hepatic': features['bilirubin'] > 2.0,
        'coagulation': features['platelet_count'] < 100000,
        'neurological': features['gcs_score'] < 15 or features['mental_status'] != 'Alert'
    }
    
    return {k: bool(v) for k, v in dysfunction.items()}

def check_inflammation_markers(features):
    """
    Check inflammatory markers against critical thresholds
    """
    markers = {
        'procalcitonin': {
            'value': features['procalcitonin'],
            'elevated': features['procalcitonin'] > 0.5,
            'critical': features['procalcitonin'] > 2.0
        },
        'crp': {
            'value': features['crp'],
            'elevated': features['crp'] > 50,
            'critical': features['crp'] > 100
        },
        'lactate': {
            'value': features['lactate'],
            'elevated': features['lactate'] > 2.0,
            'critical': features['lactate'] > 4.0
        },
        'wbc': {
            'value': features['wbc_count'],
            'elevated': features['wbc_count'] > 12.0 or features['wbc_count'] < 4.0,
            'critical': features['wbc_count'] > 15.0 or features['wbc_count'] < 2.0
        }
    }
    
    return markers

if __name__ == '__main__':
    app.run(debug=True)

print(f"Checking if model exists: {os.path.exists(MODEL_PATH)}")
print(f"Full model path: {os.path.abspath(MODEL_PATH)}")
