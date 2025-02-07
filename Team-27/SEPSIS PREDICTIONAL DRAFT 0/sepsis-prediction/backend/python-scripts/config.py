from sklearn.ensemble import (
    RandomForestClassifier, 
    AdaBoostClassifier,
    GradientBoostingClassifier
)
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    make_scorer, 
    matthews_corrcoef, 
    balanced_accuracy_score,
    cohen_kappa_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)
from sklearn.neural_network import MLPClassifier

# Base models configuration
BASE_MODELS = {
    'rf': {
        'model': RandomForestClassifier,
        'n_estimators': 100,
        'max_depth': 10,
        'min_samples_split': 5,
        'min_samples_leaf': 2,
        'random_state': 42
    },
    'ada': {
        'model': AdaBoostClassifier,
        'n_estimators': 100,
        'learning_rate': 0.1,
        'random_state': 42
    },
    'cat': {
        'model': CatBoostClassifier,
        'iterations': 100,
        'depth': 6,
        'learning_rate': 0.1,
        'random_seed': 42,
        'verbose': False
    },
    'nb': {
        'model': GaussianNB
    },
    'neural_net': {
        'model': MLPClassifier,
        'hidden_layer_sizes': (100, 50),
        'max_iter': 1000,
        'random_state': 42
    },
    'xgb': {
        'model': XGBClassifier,
        'n_estimators': 100,
        'max_depth': 6,
        'learning_rate': 0.1,
        'random_state': 42
    },
    'lgb': {
        'model': LGBMClassifier,
        'n_estimators': 100,
        'num_leaves': 31,
        'random_state': 42
    }
}

# Optuna hyperparameter optimization configuration
OPTUNA_CONFIG = {
    'rf': {
        'n_trials': 50,
        'params': {
            'n_estimators': (50, 300),
            'max_depth': (3, 30)
        }
    },
    'ada': {
        'n_trials': 50,
        'params': {
            'n_estimators': (50, 300),
            'learning_rate': (0.01, 1.0)
        }
    },
    'cat': {
        'n_trials': 50,
        'params': {
            'iterations': (50, 300),
            'learning_rate': (0.01, 0.3)
        }
    },
    'nb': {
        'n_trials': 30,
        'params': {
            'var_smoothing': (1e-10, 1e-8)
        }
    },
    'neural_net': {
        'n_trials': 50,
        'params': {
            'hidden_layer_sizes': (50, 200),
            'learning_rate_init': (0.0001, 0.01),
            'alpha': (0.0001, 0.01)
        }
    }
}

# Enhanced metrics configuration
METRICS_CONFIG = {
    'scoring': {
        'accuracy': 'accuracy',
        'balanced_acc': make_scorer(balanced_accuracy_score),
        'f1': 'f1',
        'kappa': make_scorer(cohen_kappa_score),
        'matthews': make_scorer(matthews_corrcoef)
    },
    'cv': {
        'n_splits': 5,
        'shuffle': True,
        'random_state': 42
    }
}

# Feature engineering configuration
FEATURE_ENGINEERING_CONFIG = {
    'rolling_windows': [3, 5, 7],
    'lag_periods': [1, 2, 3],
    'interaction_degree': 2
}

# Dimensionality reduction configuration
DIM_REDUCTION_CONFIG = {
    'pca': {
        'n_components': 0.95,
        'random_state': 42
    }
}

# MLflow configuration
MLFLOW_CONFIG = {
    'experiment_name': 'sepsis_prediction',
    'tracking_uri': 'sqlite:///mlflow.db',
    'run_name': 'stacking_ensemble'
}

CV_CONFIG = {
    'n_splits': 5,
    'shuffle': True,
    'random_state': 42
}

SCORING_CONFIG = {
    'accuracy': accuracy_score,
    'precision': lambda y_true, y_pred: precision_score(y_true, y_pred, average='weighted'),
    'recall': lambda y_true, y_pred: recall_score(y_true, y_pred, average='weighted'),
    'f1': lambda y_true, y_pred: f1_score(y_true, y_pred, average='weighted'),
    'roc_auc': lambda y_true, y_pred: roc_auc_score(y_true, y_pred, average='weighted')
}

# Meta-model configuration
META_MODEL = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42
)

# Stacking model configuration
STACKING_CONFIG = {
    'include_original_features': True,
    'base_models': BASE_MODELS,
    'meta_model': META_MODEL,
    'cv': CV_CONFIG,
    'feature_engineering': FEATURE_ENGINEERING_CONFIG,
    'dim_reduction': DIM_REDUCTION_CONFIG,
    'metrics': METRICS_CONFIG,
    'mlflow': MLFLOW_CONFIG,
    'optuna': OPTUNA_CONFIG
} 