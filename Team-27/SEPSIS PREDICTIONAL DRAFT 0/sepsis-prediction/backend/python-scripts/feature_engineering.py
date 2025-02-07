import pandas as pd
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
import shap
from sklearn.feature_selection import SelectFromModel
import logging

class FeatureEngineer:
    def __init__(self, config):
        self.config = config
        self.selected_features = None
        
    def preprocess_data(self, main_df, timeseries_df):
        """
        Preprocess and merge static and temporal data
        
        Parameters:
        -----------
        main_df : pd.DataFrame
            Static patient features
        timeseries_df : pd.DataFrame
            Temporal measurements
            
        Returns:
        --------
        tuple(pd.DataFrame, pd.DataFrame)
            Processed dataframe and temporal features
        """
        # Join static and temporal features
        processed_df = timeseries_df.merge(main_df, on='Patient_ID', how='left')
        
        # Create temporal features
        aggs = {
            'Heart_Rate': ['mean', 'min', 'max', 'std'],
            'Respiratory_Rate': ['mean', 'min', 'max', 'std'],
            'Temperature': ['mean', 'min', 'max', 'std'],
            'SBP': ['mean', 'min', 'max', 'std'],
            'DBP': ['mean', 'min', 'max', 'std'],
            'SpO2': ['mean', 'min', 'max', 'std']
        }
        
        temporal_features = timeseries_df.groupby('Patient_ID').agg(aggs)
        return processed_df, temporal_features
        
    def create_time_series_features(self, df, time_col):
        """
        Create time series features using rolling windows and lags
        """
        features = df.copy()
        
        # Rolling statistics
        for window in self.config['rolling_windows']:
            features[f'rolling_mean_{window}'] = df.rolling(window=window).mean()
            features[f'rolling_std_{window}'] = df.rolling(window=window).std()
            
        # Lagged features
        for lag in self.config['lag_periods']:
            features[f'lag_{lag}'] = df.shift(lag)
            
        return features
    
    def create_interaction_features(self, X):
        """
        Create interaction features using polynomial features
        """
        try:
            # Convert to numpy array if DataFrame
            if isinstance(X, pd.DataFrame):
                X = X.values
            
            # Ensure 2D array
            if X.ndim == 1:
                X = X.reshape(-1, 1)
            
            poly = PolynomialFeatures(
                degree=self.config['interaction_degree'], 
                interaction_only=True
            )
            return poly.fit_transform(X)
        
        except Exception as e:
            logging.error(f"Failed to create interaction features: {str(e)}")
            logging.error(f"Input shape: {X.shape}")
            raise
    
    def select_features(self, X, y, model):
        """
        Select important features using SHAP values
        """
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        
        # Get mean absolute SHAP values for each feature
        feature_importance = np.mean(np.abs(shap_values), axis=0)
        
        # Select features with importance above mean
        threshold = np.mean(feature_importance)
        selector = SelectFromModel(model, threshold=threshold)
        selector.fit(X, y)
        
        self.selected_features = selector.get_support()
        return X[:, self.selected_features] 
    
    def create_advanced_temporal_features(self, df):
        """
        Create advanced temporal features
        """
        features = df.copy()
        
        # Trend features
        for col in ['Heart_Rate', 'Respiratory_Rate', 'Temperature', 'SBP', 'DBP', 'SpO2']:
            # Rate of change
            features[f'{col}_rate_change'] = df.groupby('Patient_ID')[col].diff()
            
            # Acceleration (change in rate of change)
            features[f'{col}_acceleration'] = features[f'{col}_rate_change'].diff()
            
            # Volatility
            features[f'{col}_volatility'] = df.groupby('Patient_ID')[col].rolling(
                window=3
            ).std().reset_index(0, drop=True)
            
            # Peak detection
            rolling_max = df.groupby('Patient_ID')[col].rolling(
                window=5
            ).max().reset_index(0, drop=True)
            features[f'{col}_is_peak'] = (df[col] == rolling_max).astype(int)
        
        return features