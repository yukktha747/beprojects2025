import os
os.system('pip install imbalanced-learn')
os.system('pip install pyswarms')

# Import libraries
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
from imblearn.over_sampling import SMOTE
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import EarlyStopping
import joblib

# Load dataset
data = pd.read_csv('heart.csv')

# Check if 'cp' field is present
print("Columns in dataset:", data.columns)

# Check if there are any missing values in the dataset
print("Missing values in each column:\n", data.isnull().sum())

# Handle missing values in 'cp' (if any)
if data['cp'].isnull().sum() > 0:
    print("'cp' column has missing values, filling with mode...")
    data['cp'].fillna(data['cp'].mode()[0], inplace=True)

# Ensure 'cp' is of the correct data type (integer)
if data['cp'].dtype != 'int':
    print("Converting 'cp' column to integer...")
    data['cp'] = data['cp'].astype(int)

# Define features and target
X = data.drop(columns=["target"])
y = data["target"]

# Check if 'cp' is in the features
print("Features in the dataset:", X.columns)

# Handle class imbalance using SMOTE
sm = SMOTE(random_state=42)
X_resampled, y_resampled = sm.fit_resample(X, y)

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_resampled)

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_resampled, test_size=0.2, random_state=42)

# Function to create the ANN model
def create_model(neurons_layer1, neurons_layer2):
    model = Sequential([
        Dense(neurons_layer1, activation='relu', input_dim=X_train.shape[1]),
        Dense(neurons_layer2, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

# **Fitness Function for Optimization**
def fitness_function(params):
    accuracies = []  # Store accuracies for each particle
    for particle in params:
        neurons_layer1, neurons_layer2 = int(particle[0]), int(particle[1])
        try:
            model = create_model(neurons_layer1, neurons_layer2)
            early_stop = EarlyStopping(monitor='val_loss', patience=5, verbose=0)
            model.fit(X_train, y_train, epochs=50, batch_size=32, verbose=0, validation_split=0.2, callbacks=[early_stop])

            y_pred = (model.predict(X_test) > 0.5).astype(int)
            accuracy = accuracy_score(y_test, y_pred)
            accuracies.append(-accuracy)  # Minimize negative accuracy
        except:
            accuracies.append(float('inf'))  # Handle potential errors with large penalties
    return np.array(accuracies)

# **Bird Swarm Optimization (BSO)**
def bird_swarm_optimization(fitness_function, n_birds, max_iterations, bounds):
    n_dimensions = len(bounds[0])
    birds = np.random.uniform(bounds[0], bounds[1], (n_birds, n_dimensions))
    best_bird = birds[0]
    best_fitness = fitness_function([best_bird])[0]

    for _ in range(max_iterations):
        for i, bird in enumerate(birds):
            accuracy = fitness_function([bird])[0]
            if accuracy < best_fitness:
                best_fitness = accuracy
                best_bird = bird

            # Update bird position (foraging/vigilance behavior)
            birds[i] = bird + np.random.uniform(-0.1, 0.1, n_dimensions)

    return best_bird

# **Hybrid SMO-BSO**
def hybrid_smo_bso(fitness_function, n_monkeys, n_birds, max_iterations, bounds):
    n_dimensions = len(bounds[0])
    monkeys = np.random.uniform(bounds[0], bounds[1], (n_monkeys, n_dimensions))
    birds = np.random.uniform(bounds[0], bounds[1], (n_birds, n_dimensions))

    # Combine monkey and bird populations
    combined_population = np.vstack((monkeys, birds))
    best_solution = combined_population[0]
    best_fitness = fitness_function([best_solution])[0]

    for iteration in range(max_iterations):
        # SMO step
        for i, monkey in enumerate(monkeys):
            accuracy = fitness_function([monkey])[0]
            if accuracy < best_fitness:
                best_fitness = accuracy
                best_solution = monkey

            # Update monkey positions
            monkeys[i] = monkey + np.random.uniform(-0.1, 0.1, n_dimensions)

        # BSO step
        for i, bird in enumerate(birds):
            accuracy = fitness_function([bird])[0]
            if accuracy < best_fitness:
                best_fitness = accuracy
                best_solution = bird

            # Update bird positions
            birds[i] = bird + np.random.uniform(-0.1, 0.1, n_dimensions)

        # Combine updated populations
        combined_population = np.vstack((monkeys, birds))

    return best_solution

# **Main Execution**
if __name__ == "__main__":
    # Define bounds for neurons
    bounds = ([16, 16], [128, 128])  # Min/Max neurons for Layer 1 and Layer 2

    # Run Hybrid SMO-BSO
    best_neurons_hybrid = hybrid_smo_bso(fitness_function, n_monkeys=5, n_birds=5, max_iterations=10, bounds=bounds)
    best_neurons_hybrid = [int(neuron) for neuron in best_neurons_hybrid]

    # Train the final model with the best parameters
    final_model_hybrid = create_model(best_neurons_hybrid[0], best_neurons_hybrid[1])
    early_stop = EarlyStopping(monitor='val_loss', patience=10)
    final_model_hybrid.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test), callbacks=[early_stop])

    # Evaluate the final model
    y_pred_hybrid = (final_model_hybrid.predict(X_test) > 0.5).astype(int)
    accuracy_hybrid = accuracy_score(y_test, y_pred_hybrid)
    cm_hybrid = confusion_matrix(y_test, y_pred_hybrid)

    # Print results
    print("Hybrid SMO-BSO Results")
    print(f"Optimized Neurons (Layer 1, Layer 2): {best_neurons_hybrid}")
    print(f"Hybrid SMO-BSO Final Model Accuracy: {accuracy_hybrid * 100:.2f}%")
    print("Confusion Matrix (Hybrid SMO-BSO):\n", cm_hybrid)

    # Save the final model
    joblib.dump(final_model_hybrid, 'model.pkl')
    print("Model saved as model.pkl")
