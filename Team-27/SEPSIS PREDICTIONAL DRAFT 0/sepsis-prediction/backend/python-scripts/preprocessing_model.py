from typing import Tuple, List, Dict
from dataclasses import dataclass
import yaml
from cerberus import Validator
import pandas as pd
import numpy as np
import os
import logging
from datetime import datetime
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer, KNNImputer
from imblearn.over_sampling import SMOTE
from statsmodels.tsa.seasonal import seasonal_decompose
from sklearn.ensemble import IsolationForest
import shap
import matplotlib.pyplot as plt
from scipy.stats import skew
from scipy.sparse import issparse
from lightgbm import LGBMClassifier
from sklearn.impute import KNNImputer
import joblib


@dataclass
class DataSchema:
    schema = {
        'data_paths': {
            'type': 'dict',
            'required': True,
            'schema': {
                'main_data': {'type': 'string', 'required': True},
                'time_series_data': {'type': 'string', 'required': True}
            }
        },
        'data_loading': {
            'type': 'dict',
            'required': False,
            'schema': {
                'chunk_size': {'type': ['string', 'integer'], 'required': False},
                'memory_limit': {'type': 'string', 'required': False}
            }
        },
        'split_sizes': {
            'type': 'dict',
            'required': True,
            'schema': {
                'test_size': {'type': 'float', 'required': True},
                'val_size': {'type': 'float', 'required': True},
                'min_samples': {'type': 'integer', 'required': False}
            }
        },
        'target_column': {'type': 'string', 'required': True},
        'random_state': {'type': 'integer', 'required': True},
        'time_series': {
            'type': 'dict',
            'required': True,
            'schema': {
                'aggregations': {'type': 'list', 'required': True},
                'window_sizes': {'type': 'list', 'required': True},
                'seasonality': {'type': 'dict', 'required': False},
                'rolling_statistics': {'type': 'boolean', 'required': False},
                'advanced_features': {
                    'type': 'dict',
                    'required': False,
                    'schema': {
                        'enabled': {'type': 'boolean', 'required': False},
                        'features': {'type': 'list', 'required': False}
                    }
                }
            }
        },
        'preprocessing': {
            'type': 'dict',
            'required': True,
            'schema': {
                'n_features': {'type': 'integer', 'required': True},
                'imputation_strategy': {'type': 'string', 'required': True},
                'shap_analysis': {'type': 'boolean', 'required': True},
                'detect_types': {'type': 'boolean', 'required': False},
                'categorical_strategy': {'type': 'string', 'required': False},
                'vif_threshold': {'type': 'integer', 'required': False},
                'contamination': {'type': 'float', 'required': False},
                'categorical_threshold': {'type': 'integer', 'required': False},
                'optimize_features': {'type': 'boolean', 'required': False},
                'error_handling': {
                    'type': 'dict',
                    'required': False,
                    'schema': {
                        'log_warnings': {'type': 'boolean', 'required': False},
                        'skip_failed_features': {'type': 'boolean', 'required': False},
                        'min_records_required': {'type': 'integer', 'required': False}
                    }
                },
                'imputation': {
                    'type': 'dict',
                    'required': False,
                    'schema': {
                        'numerical_strategy': {'type': 'string', 'required': False},
                        'categorical_strategy': {'type': 'string', 'required': False},
                        'time_series_strategy': {'type': 'string', 'required': False}
                    }
                }
            }
        },
        'output_paths': {
            'type': 'dict',
            'required': True,
            'schema': {
                'data': {'type': 'string', 'required': True},
                'logs': {'type': 'string', 'required': True},
                'models': {'type': 'string', 'required': False},
                'error_reports': {'type': 'string', 'required': False}
            }
        },
        'advanced_preprocessing': {
            'type': 'dict',
            'required': False,
            'schema': {
                'imputation': {
                    'type': 'dict',
                    'required': False,
                    'schema': {
                        'numerical_strategy': {'type': 'string', 'required': False},
                        'categorical_strategy': {'type': 'string', 'required': False},
                        'time_series_strategy': {'type': 'string', 'required': False}
                    }
                },
                'feature_selection': {
                    'type': 'dict',
                    'required': False,
                    'schema': {
                        'method': {'type': 'string', 'required': False},
                        'threshold': {'type': 'float', 'required': False}
                    }
                },
                'outlier_detection': {
                    'type': 'dict',
                    'required': False,
                    'schema': {
                        'method': {'type': 'string', 'required': False},
                        'contamination': {'type': 'float', 'required': False}
                    }
                }
            }
        },
        'resources': {
            'type': 'dict',
            'required': False,
            'schema': {
                'n_jobs': {'type': 'integer', 'required': False},
                'memory_limit': {'type': 'string', 'required': False},
                'temp_directory': {'type': 'string', 'required': False},
                'logging': {
                    'type': 'dict',
                    'required': False,
                    'schema': {
                        'level': {'type': 'string', 'required': True},
                        'format': {'type': 'string', 'required': True},
                        'file_rotation': {'type': 'boolean', 'required': True},
                        'max_file_size': {'type': 'string', 'required': True}
                    }
                }
            }
        }
    }


class AdvancedPreprocessingPipeline:
    def __init__(self, config_path: str):
        self.config = self._load_and_validate_config(config_path)
        self.logger = self._setup_logging()
        self.preprocessor = None
        
    def _setup_logging(self):
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)
        log_dir = self.config['output_paths']['logs']
        os.makedirs(log_dir, exist_ok=True)
        handler = logging.FileHandler(f"{log_dir}/preprocessing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
        logger.addHandler(handler)
        return logger

    def _load_and_validate_config(self, config_path: str) -> dict:
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        validator = Validator(DataSchema.schema)
        if not validator.validate(config):
            raise ValueError(f"Invalid configuration: {validator.errors}")
        return config

    def load_data(self):
        main_data = pd.read_csv(self.config['data_paths']['main_data'])
        time_series_data = pd.read_csv(self.config['data_paths']['time_series_data'])
        return main_data, time_series_data

    def preprocess_main_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess main data including handling categorical variables.
        """
        try:
            self.logger.info("Starting main data preprocessing...")
            
            # Identify numeric and categorical columns
            categorical_features = df.select_dtypes(include=['object', 'category']).columns
            numeric_features = df.select_dtypes(include=['int64', 'float64']).columns
            
            self.logger.info(f"Found {len(numeric_features)} numeric and {len(categorical_features)} categorical columns")
            
            # Create preprocessing pipeline
            numeric_transformer = Pipeline(steps=[
                ('imputer', KNNImputer(n_neighbors=5)),
                ('scaler', StandardScaler())
            ])
            
            categorical_transformer = Pipeline(steps=[
                ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
                ('onehot', OneHotEncoder(
                    drop='first',
                    sparse_output=False,
                    handle_unknown='ignore'
                ))
            ])
            
            # Combine transformers
            self.preprocessor = ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, numeric_features),
                    ('cat', categorical_transformer, categorical_features)
                ],
                remainder='passthrough'
            )
            
            # Fit and transform the data
            X_transformed = self.preprocessor.fit_transform(df)
            
            # Get feature names after transformation
            numeric_cols = numeric_features.tolist()
            
            # Get categorical feature names after one-hot encoding
            categorical_cols = []
            for feature in categorical_features:
                # Get unique values
                unique_values = df[feature].dropna().unique()
                # Convert all values to strings before sorting
                unique_values = sorted([str(val) for val in unique_values])[1:]  # Skip first value
                categorical_cols.extend([f"{feature}_{val}" for val in unique_values])
            
            # Combine all feature names
            all_features = numeric_cols + categorical_cols
            
            # Verify the number of columns matches
            if X_transformed.shape[1] != len(all_features):
                self.logger.warning(f"Feature names mismatch. Generated {len(all_features)} names for {X_transformed.shape[1]} columns")
                # Use generic feature names if mismatch occurs
                all_features = [f"feature_{i}" for i in range(X_transformed.shape[1])]
            
            # Convert to DataFrame
            X_transformed_df = pd.DataFrame(X_transformed, columns=all_features)
            
            self.logger.info(f"Preprocessed data shape: {X_transformed_df.shape}")
            return X_transformed_df
            
        except Exception as e:
            self.logger.error(f"Error in preprocessing main data: {str(e)}")
            raise

    def preprocess_time_series_data(self, df: pd.DataFrame) -> pd.DataFrame:
        # Add seasonality decomposition
        for col in df.select_dtypes(include=['float64', 'int64']).columns:
            decomposition = seasonal_decompose(df[col], period=24, model='additive', extrapolate_trend='freq')
            df[f'{col}_trend'] = decomposition.trend
            df[f'{col}_seasonal'] = decomposition.seasonal
            df[f'{col}_residual'] = decomposition.resid
        return df

    def handle_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
        iso = IsolationForest(contamination=0.01, random_state=self.config['random_state'])
        for col in numeric_cols:
            outliers = iso.fit_predict(df[[col]])
            df[col] = np.where(outliers == -1, np.median(df[col]), df[col])
        return df

    def handle_nulls(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values in the dataset based on the configured imputation strategy.
        Args:
            df (pd.DataFrame): Input DataFrame
        Returns:
            pd.DataFrame: DataFrame with imputed values
        """
        try:
            self.logger.info("Starting null value handling...")
            
            # Separate numerical and categorical columns
            numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns
            
            # Log initial null counts
            null_counts = df.isnull().sum()
            if null_counts.any():
                self.logger.info(f"Found null values in columns: {null_counts[null_counts > 0]}")
            
            # Handle numerical columns
            if len(numerical_cols) > 0:
                if self.config['preprocessing']['imputation_strategy'] == 'knn':
                    imputer = KNNImputer(n_neighbors=5)
                    df[numerical_cols] = imputer.fit_transform(df[numerical_cols])
                elif self.config['preprocessing']['imputation_strategy'] == 'mean':
                    df[numerical_cols] = df[numerical_cols].fillna(df[numerical_cols].mean())
                elif self.config['preprocessing']['imputation_strategy'] == 'median':
                    df[numerical_cols] = df[numerical_cols].fillna(df[numerical_cols].median())
                else:
                    self.logger.warning(f"Unknown imputation strategy: {self.config['preprocessing']['imputation_strategy']}")
                    df[numerical_cols] = df[numerical_cols].fillna(df[numerical_cols].mean())
            
            # Handle categorical columns
            if len(categorical_cols) > 0:
                for col in categorical_cols:
                    if df[col].isnull().any():
                        # Fill with mode (most frequent value)
                        mode_value = df[col].mode()[0]
                        df[col] = df[col].fillna(mode_value)
            
            # Verify no nulls remain
            remaining_nulls = df.isnull().sum()
            if remaining_nulls.any():
                self.logger.warning(f"Remaining null values after imputation: {remaining_nulls[remaining_nulls > 0]}")
            else:
                self.logger.info("All null values have been handled successfully")
            
            return df
            
        except Exception as e:
            self.logger.error(f"Error handling null values: {str(e)}")
            raise

    def run_pipeline(self):
        """Execute the preprocessing pipeline."""
        try:
            self.logger.info("Starting preprocessing pipeline...")
            main_data, time_series_data = self.load_data()

            self.logger.info(f"Initial data shapes - Main: {main_data.shape}, Time series: {time_series_data.shape}")

            # Separate target variable
            y = main_data[self.config['target_column']]
            X = main_data.drop(columns=[self.config['target_column']])

            # Preprocess main data
            X_processed = self.preprocess_main_data(X)

            # Handle time series data
            if time_series_data is not None:
                time_series_data = self.preprocess_time_series_data(time_series_data)

            # Split the data
            X_train, X_test, y_train, y_test = train_test_split(
                X_processed, y,
                test_size=self.config['split_sizes']['test_size'],
                random_state=self.config['random_state'],
                stratify=y
            )

            self.logger.info(f"Training set shape: {X_train.shape}")
            self.logger.info(f"Testing set shape: {X_test.shape}")

            # Feature selection if specified
            if self.config['preprocessing'].get('n_features'):
                selector = SelectKBest(score_func=f_classif, k=self.config['preprocessing']['n_features'])
                X_train = selector.fit_transform(X_train, y_train)
                X_test = selector.transform(X_test)

            # SHAP analysis if specified
            if self.config['preprocessing']['shap_analysis']:
                self._perform_shap_analysis(X_train, y_train)

            # Save processed data
            self._save_processed_data(X_train, X_test, y_train, y_test)

            self.logger.info("Pipeline completed successfully!")
            return X_train, X_test, y_train, y_test

        except Exception as e:
            self.logger.error(f"Pipeline failed: {str(e)}")
            raise

    def _save_processed_data(self, X_train, X_test, y_train, y_test):
        """Save processed data to specified output paths."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_dir = self.config['output_paths']['data']
        os.makedirs(output_dir, exist_ok=True)
        
        # Convert to DataFrame if necessary
        if not isinstance(X_train, pd.DataFrame):
            X_train = pd.DataFrame(X_train)
            X_test = pd.DataFrame(X_test)
        
        # Save data
        X_train.to_csv(f"{output_dir}/X_train_{timestamp}.csv", index=False)
        X_test.to_csv(f"{output_dir}/X_test_{timestamp}.csv", index=False)
        y_train.to_csv(f"{output_dir}/y_train_{timestamp}.csv", index=False)
        y_test.to_csv(f"{output_dir}/y_test_{timestamp}.csv", index=False)
        
        # Save preprocessor
        if self.preprocessor:
            joblib.dump(self.preprocessor, f"{output_dir}/preprocessor_{timestamp}.joblib")

    def _perform_shap_analysis(self, X, y):
        """
        Perform SHAP analysis for feature importance.
        Args:
            X: Training features (DataFrame or numpy array)
            y: Target variable
        """
        try:
            # Convert X to DataFrame if it's a numpy array
            if isinstance(X, np.ndarray):
                X = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(X.shape[1])])
            
            # Clean feature names
            X.columns = [str(col).replace(' ', '_') for col in X.columns]
            
            # Ensure all data is numeric
            for col in X.columns:
                if X[col].dtype == 'object':
                    self.logger.warning(f"Converting column {col} to numeric")
                    X[col] = pd.to_numeric(X[col], errors='coerce')
            
            # Fill any NaN values that might have been created
            X = X.fillna(X.mean())
            
            # Configure LightGBM
            model = LGBMClassifier(
                random_state=self.config['random_state'],
                verbose=-1,
                n_jobs=-1
            )
            
            # Fit the model
            model.fit(X, y)
            
            # Create explainer and calculate SHAP values
            explainer = shap.TreeExplainer(model)
            shap_values = explainer(X)
            
            # Create and save SHAP plots
            plt.figure(figsize=(12, 8))
            shap.summary_plot(
                shap_values, 
                X,
                plot_type="bar",
                show=False
            )
            plt.tight_layout()
            plt.savefig(f"{self.config['output_paths']['data']}/shap_importance.png")
            plt.close()
            
            # Save feature importance data
            feature_importance = pd.DataFrame({
                'feature': X.columns,
                'importance': np.abs(shap_values.values).mean(0)
            })
            feature_importance = feature_importance.sort_values('importance', ascending=False)
            feature_importance.to_csv(
                f"{self.config['output_paths']['data']}/feature_importance.csv",
                index=False
            )
            
            self.logger.info("SHAP analysis completed and saved successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to perform SHAP analysis: {str(e)}")
            self.logger.error(f"Input data shape: {X.shape}")
            if isinstance(X, pd.DataFrame):
                self.logger.error(f"Data types of columns: {X.dtypes}")
            raise


if __name__ == "__main__":
    pipeline = AdvancedPreprocessingPipeline('config/preprocessing_config.yaml')
    pipeline.run_pipeline()
