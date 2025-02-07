import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import RecommendationDisplay from './RecommendationDisplay';

const CADPredictionForm = () => {
  const [formData, setFormData] = useState({
    age: '',
    sex: '0',
    chest_pain: '0',
    resting_bp: '',
    cholesterol: '',
    fasting_bs: '0',
    resting_ecg: '0',
    max_heart_rate: '',
    exercise_angina: '0',
    oldpeak: '',
    slope: '0',
    major_vessels: '0',
    patient_name: '',
    patient_email: '',
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'number' ? parseFloat(value) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    if (!token) {
      setError('You must be logged in to make predictions');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const result = await response.json();
      setPredictionResult(result);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <div className="pulse-animation absolute top-10 left-20 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="pulse-animation absolute bottom-10 right-20 w-48 h-48 bg-red-500 rounded-full filter blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-700 p-8 relative z-10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white flex items-center justify-center">
          <HeartPulse className="mr-2 text-red-500" /> Clinician's Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div>
            <label htmlFor="patient_name" className="block text-sm font-medium text-gray-300">
              Patient Name
            </label>
            <input
              type="text"
              id="patient_name"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="patient_email" className="block text-sm font-medium text-gray-300">
              Patient Email
            </label>
            <input
              type="email"
              id="patient_email"
              name="patient_email"
              value={formData.patient_email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          {/* Existing form fields */}
          {[
            { name: 'age', label: 'Age', type: 'number', min: 0, max: 120 },
            { name: 'sex', label: 'Sex', type: 'select', options: { '0': 'Female', '1': 'Male' } },
            { name: 'chest_pain', label: 'Chest Pain Type', type: 'select', options: { '0': 'Typical Angina', '1': 'Atypical Angina', '2': 'Non-Anginal Pain', '3': 'Asymptomatic' } },
            { name: 'resting_bp', label: 'Resting Blood Pressure', type: 'number', min: 0, max: 300 },
            { name: 'cholesterol', label: 'Cholesterol', type: 'number', min: 0, max: 600 },
            { name: 'fasting_bs', label: 'Fasting Blood Sugar', type: 'select', options: { '0': '< 120 mg/dl', '1': '> 120 mg/dl' } },
            { name: 'resting_ecg', label: 'Resting ECG', type: 'select', options: { '0': 'Normal', '1': 'ST-T Wave Abnormality', '2': 'Left Ventricular Hypertrophy' } },
            { name: 'max_heart_rate', label: 'Max Heart Rate', type: 'number', min: 0, max: 300 },
            { name: 'exercise_angina', label: 'Exercise Induced Angina', type: 'select', options: { '0': 'No', '1': 'Yes' } },
            { name: 'oldpeak', label: 'Oldpeak ST', type: 'number', min: -10, max: 10, step: 0.1 },
            { name: 'slope', label: 'Slope of Peak Exercise ST', type: 'select', options: { '0': 'Upsloping', '1': 'Flat', '2': 'Downsloping' } },
            { name: 'major_vessels', label: 'Number of Major Vessels Colored', type: 'select', options: { '0': '0', '1': '1', '2': '2', '3': '3' } },
          ].map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-300">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(field.options).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  min={field.min}
                  max={field.max}
                  step={field.step || undefined}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              )}
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Predicting...' : 'Predict CAD Risk'}
          </motion.button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900 border border-red-700 text-red-300 rounded">
            <p>{error}</p>
          </div>
        )}

        {predictionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded"
          >
            <h3 className="font-bold text-lg mb-4 text-white">Prediction Result</h3>
            <p
              className={`text-lg font-semibold mb-4 ${
                predictionResult.prediction === 1 ? 'text-red-400' : 'text-green-400'
              }`}
            >
              Risk Level: {predictionResult.risk_level}
            </p>
            <RecommendationDisplay
              recommendations={predictionResult.recommendations}
              healthMetrics={predictionResult.risk_factors}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CADPredictionForm;