import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
import pandas as pd
from sklearn.manifold import TSNE
from umap import UMAP

class DimensionalityReducer:
    def __init__(self, config):
        self.config = config
        self.pca = None
        self.preprocessor = None
        self.feature_names = None
        self.categorical_columns = None
        self.numerical_columns = None
        
    def _prepare_data(self, X):
        """
        Prepare data by handling categorical variables and missing values
        """
        if isinstance(X, pd.DataFrame):
            # Store feature names
            self.feature_names = X.columns.tolist()
            
            # Identify categorical and numerical columns
            self.categorical_columns = X.select_dtypes(include=['object', 'category']).columns
            self.numerical_columns = X.select_dtypes(include=['int64', 'float64']).columns
            
            if len(self.categorical_columns) == 0:
                # If no categorical columns, just use numerical preprocessing
                self.preprocessor = Pipeline([
                    ('imputer', SimpleImputer(strategy='mean')),
                    ('scaler', StandardScaler())
                ])
                return self.preprocessor.fit_transform(X)
            
            # Create preprocessing pipelines
            numeric_transformer = Pipeline(steps=[
                ('imputer', SimpleImputer(strategy='mean')),
                ('scaler', StandardScaler())
            ])
            
            categorical_transformer = Pipeline(steps=[
                ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
                ('onehot', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'))
            ])
            
            # Combine preprocessing steps
            self.preprocessor = ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, self.numerical_columns),
                    ('cat', categorical_transformer, self.categorical_columns)
                ],
                remainder='passthrough'
            )
            
            # Fit and transform the data
            X_processed = self.preprocessor.fit_transform(X)
            return X_processed
        else:
            # If input is already numpy array, assume it's preprocessed
            return X
        
    def fit_pca(self, X):
        """
        Fit PCA transformation
        """
        # Prepare data
        X_processed = self._prepare_data(X)
        
        # Apply PCA
        self.pca = PCA(**self.config['pca'])
        return self.pca.fit_transform(X_processed)
    
    def transform(self, X):
        """
        Transform data using fitted PCA
        """
        if self.pca is None:
            raise ValueError("PCA not fitted yet. Call fit_pca first.")
        
        # Handle DataFrame input
        if isinstance(X, pd.DataFrame):
            X = self.preprocessor.transform(X)
        
        return self.pca.transform(X)
    
    def get_feature_names(self):
        """
        Get feature names after preprocessing
        """
        if self.preprocessor is None:
            return None
        
        if hasattr(self.preprocessor, 'get_feature_names_out'):
            return self.preprocessor.get_feature_names_out()
        return None
    
    def initialize_reducers(self):
        """Initialize different dimensionality reduction methods"""
        self.reducers = {
            'pca': PCA(**self.config.get('pca', {'n_components': 2})),
            'tsne': TSNE(
                n_components=2,
                random_state=self.config.get('random_state', 42),
                **self.config.get('tsne', {})
            ),
            'umap': UMAP(
                n_components=2,
                random_state=self.config.get('random_state', 42),
                **self.config.get('umap', {})
            )
        }

    def compare_reduction_methods(self, X):
        """
        Compare different dimensionality reduction techniques
        
        Args:
            X: Input data (DataFrame or numpy array)
            
        Returns:
            Dictionary containing reduced data and metrics for each method
        """
        # Prepare data
        X_processed = self._prepare_data(X)
        
        # Initialize reducers if not done
        if not hasattr(self, 'reducers'):
            self.initialize_reducers()
        
        results = {}
        for name, reducer in self.reducers.items():
            try:
                # Fit and transform data
                reduced_data = reducer.fit_transform(X_processed)
                
                # Calculate reconstruction error for PCA
                reconstruction_error = None
                if name == 'pca':
                    X_reconstructed = reducer.inverse_transform(reduced_data)
                    reconstruction_error = np.mean((X_processed - X_reconstructed) ** 2)
                
                results[name] = {
                    'data': reduced_data,
                    'shape': reduced_data.shape,
                    'explained_variance': getattr(reducer, 'explained_variance_ratio_', None),
                    'reconstruction_error': reconstruction_error
                }
                
            except Exception as e:
                print(f"Warning: {name} reduction failed - {str(e)}")
                continue
        
        return results

    def get_best_reduction(self, X, metric='explained_variance'):
        """
        Get the best dimensionality reduction method based on specified metric
        
        Args:
            X: Input data
            metric: Metric to use for comparison ('explained_variance' or 'reconstruction_error')
            
        Returns:
            Tuple of (best_method_name, reduced_data, metric_value)
        """
        results = self.compare_reduction_methods(X)
        
        best_method = None
        best_score = float('-inf') if metric == 'explained_variance' else float('inf')
        best_data = None
        
        for method, result in results.items():
            if metric == 'explained_variance':
                score = np.sum(result['explained_variance']) if result['explained_variance'] is not None else float('-inf')
                if score > best_score:
                    best_score = score
                    best_method = method
                    best_data = result['data']
            elif metric == 'reconstruction_error':
                score = result['reconstruction_error'] if result['reconstruction_error'] is not None else float('inf')
                if score < best_score:
                    best_score = score
                    best_method = method
                    best_data = result['data']
        
        return best_method, best_data, best_score