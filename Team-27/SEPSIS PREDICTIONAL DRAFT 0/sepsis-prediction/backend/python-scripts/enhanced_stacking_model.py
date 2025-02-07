import optuna
import numpy as np
import pandas as pd
import logging
import joblib
from sklearn.model_selection import cross_val_score, train_test_split, StratifiedKFold
from sklearn.metrics import f1_score, make_scorer, matthews_corrcoef
import shap
import matplotlib.pyplot as plt
import seaborn as sns
from concurrent.futures import ProcessPoolExecutor
from config import OPTUNA_CONFIG, FEATURE_ENGINEERING_CONFIG
from feature_engineering import FeatureEngineer
from sklearn.ensemble import RandomForestClassifier
import mlflow
import mlflow.sklearn
from dimension_reduction import DimensionalityReducer
from sklearn.base import BaseEstimator, ClassifierMixin
import lime
import lime.lime_tabular
import os


class EnhancedStackingModel(BaseEstimator, ClassifierMixin):
    def __init__(self, config):
        self.config = config
        # Initialize base models from configuration
        self.base_models = {}
        for name, model_config in config['base_models'].items():
            if isinstance(model_config, dict):
                # If it's a configuration dictionary, initialize the model
                model_class = model_config.pop('model')
                self.base_models[name] = model_class(**model_config)
            else:
                # If it's already a model instance, use it directly
                self.base_models[name] = model_config
        
        self.meta_model = config.get('meta_model', RandomForestClassifier(n_estimators=100, random_state=42))
        self.feature_engineer = FeatureEngineer(config.get('feature_engineering', {}))
        self.dim_reducer = DimensionalityReducer(config.get('dim_reduction', {}))
        self.include_original_features = config.get('include_original_features', False)
    
    def fit(self, X, y):
        """
        Fit the stacking model with the provided data
        """
        try:
            # Convert numpy arrays to pandas DataFrame/Series if necessary
            if isinstance(X, np.ndarray):
                X = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(X.shape[1])])
            if isinstance(y, np.ndarray):
                y = pd.Series(y)
            
            # Reset index of input data to ensure alignment
            X = X.reset_index(drop=True)
            y = y.reset_index(drop=True)
            
            # Apply feature engineering first
            X_engineered = self.feature_engineer.create_interaction_features(X)
            
            # Convert X_engineered to DataFrame if it's numpy array
            if isinstance(X_engineered, np.ndarray):
                X_engineered = pd.DataFrame(
                    X_engineered, 
                    columns=[f'engineered_feature_{i}' for i in range(X_engineered.shape[1])]
                )
            
            # Initialize and fit base models
            base_predictions = np.zeros((X.shape[0], len(self.base_models)))
            model_names = list(self.base_models.keys())
            
            for i, (name, model) in enumerate(self.base_models.items()):
                logging.info(f"Training base model: {name}")
                model.fit(X_engineered, y)
                base_predictions[:, i] = model.predict(X_engineered)
            
            # Prepare meta-features with consistent naming
            meta_features = pd.DataFrame(
                base_predictions,
                columns=[f"{name}_pred" for name in model_names]
            )
            
            # Store feature names for later use
            self.meta_feature_names_ = meta_features.columns.tolist()
            
            # Add original features if specified
            if self.include_original_features:
                meta_features = pd.concat([meta_features, X_engineered], axis=1)
                self.meta_feature_names_ = meta_features.columns.tolist()
            
            # Fit meta-model
            logging.info("Training meta-model")
            self.meta_model.fit(meta_features, y)
            
            return self
            
        except Exception as e:
            logging.error(f"Error in fitting stacking model: {str(e)}")
            raise
    
    def predict(self, X):
        """Make predictions using the stacking ensemble"""
        # Get base model predictions
        base_predictions = np.zeros((X.shape[0], len(self.base_models)))
        for i, (name, model) in enumerate(self.base_models.items()):
            base_predictions[:, i] = model.predict(X)
        
        # Create meta-features
        meta_features = pd.DataFrame(
            base_predictions,
            columns=[f"{name}_pred" for name in self.base_models.keys()]
        )
        
        # Add original features if specified
        if self.include_original_features:
            if isinstance(X, pd.DataFrame):
                meta_features = pd.concat([meta_features, X], axis=1)
            else:
                meta_features = pd.concat([meta_features, pd.DataFrame(X)], axis=1)
        
        # Make final prediction
        return self.meta_model.predict(meta_features)
    
    def predict_proba(self, X):
        """Get probability predictions using the stacking ensemble"""
        # Get base model predictions
        base_predictions = np.zeros((X.shape[0], len(self.base_models)))
        for i, (name, model) in enumerate(self.base_models.items()):
            base_predictions[:, i] = model.predict(X)
        
        # Create meta-features
        meta_features = pd.DataFrame(
            base_predictions,
            columns=[f"{name}_pred" for name in self.base_models.keys()]
        )
        
        # Add original features if specified
        if self.include_original_features:
            if isinstance(X, pd.DataFrame):
                meta_features = pd.concat([meta_features, X], axis=1)
            else:
                meta_features = pd.concat([meta_features, pd.DataFrame(X)], axis=1)
        
        # Get probability predictions
        return self.meta_model.predict_proba(meta_features)
    
    def _get_meta_features(self, X):
        """
        Generate meta-features from base models
        """
        try:
            base_predictions = []
            model_names = list(self.base_models.keys())  # Get list of model names
            
            for name, model in self.base_models.items():
                pred_proba = model.predict_proba(X)
                base_predictions.append(pred_proba[:, 1].reshape(-1, 1))
            
            meta_features = np.column_stack(base_predictions)
            
            # Use consistent feature names matching those used in fit
            meta_features_df = pd.DataFrame(
                meta_features,
                columns=[f"{name}_pred" for name in model_names]
            )
            
            # Add engineered features if specified
            if self.include_original_features:
                if isinstance(X, np.ndarray):
                    X_df = pd.DataFrame(
                        X,
                        columns=[f'engineered_feature_{i}' for i in range(X.shape[1])]
                    )
                else:
                    X_df = X.copy()
                meta_features_df = pd.concat([meta_features_df, X_df], axis=1)
            
            return meta_features_df
            
        except Exception as e:
            logging.error(f"Error generating meta-features: {str(e)}")
            raise
    
    def train_and_evaluate(self, X, y):
        """
        Train the model and evaluate its performance
        """
        try:
            # Ensure X is a DataFrame
            if not isinstance(X, pd.DataFrame):
                X = pd.DataFrame(X)
            
            # Convert y to Series if it's a NumPy array
            if isinstance(y, np.ndarray):
                y = pd.Series(y)
            
            # Apply PCA for dimensionality reduction
            X_reduced = self.dim_reducer.fit_pca(X)
            
            # Initialize cross-validation
            skf = StratifiedKFold(**self.config['cv'])
            
            # Initialize metrics storage
            cv_scores = {metric: [] for metric in self.config['scoring']}
            
            # Perform cross-validation
            for train_idx, val_idx in skf.split(X_reduced, y):
                X_train, X_val = X_reduced[train_idx], X_reduced[val_idx]
                y_train, y_val = y[train_idx], y[val_idx]
                
                # Train base models and meta-model
                base_predictions = self._train_base_models(X_train, y_train)
                self.meta_model.fit(base_predictions, y_train)
                
                # Make predictions
                val_base_predictions = self._predict_base_models(X_val)
                val_predictions = self.meta_model.predict(val_base_predictions)
                
                # Calculate metrics
                for metric_name, scorer in self.config['scoring'].items():
                    score = scorer._score_func(y_val, val_predictions)
                    cv_scores[metric_name].append(score)
            
            # Calculate mean scores
            mean_scores = {metric: np.mean(scores) for metric, scores in cv_scores.items()}
            return mean_scores
        
        except Exception as e:
            logging.error(f"Error during training and evaluation: {str(e)}")
            raise
    
    def _validate_features(self, X):
        """Validate feature dimensionality"""
        if hasattr(self, 'n_features_'):
            if X.shape[1] != self.n_features_:
                raise ValueError(f"X has {X.shape[1]} features, but {self.n_features_} features were expected.")
        else:
            self.n_features_ = X.shape[1]
    
    def save_model(self, filepath):
        """
        Save the trained model to disk
        """
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            # Save the complete model
            joblib.dump(self, filepath)
            logging.info(f"Model saved successfully to {filepath}")
            
            # Save individual base models and meta-model separately for flexibility
            model_dir = os.path.dirname(filepath)
            os.makedirs(model_dir, exist_ok=True)
            
            # Save base models
            for name, model in self.base_models.items():
                base_model_path = os.path.join(model_dir, f'base_model_{name}.joblib')
                joblib.dump(model, base_model_path)
            
            # Save meta-model
            meta_model_path = os.path.join(model_dir, 'meta_model.joblib')
            joblib.dump(self.meta_model, meta_model_path)
            
            return True
            
        except Exception as e:
            logging.error(f"Error saving model: {str(e)}")
            return False
    
    @staticmethod
    def load_model(filepath):
        """
        Load a trained model from disk
        """
        try:
            model = joblib.load(filepath)
            logging.info(f"Model loaded successfully from {filepath}")
            return model
        except Exception as e:
            logging.error(f"Error loading model: {str(e)}")
            raise

