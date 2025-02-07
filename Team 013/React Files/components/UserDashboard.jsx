import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Thermometer, 
  Weight, 
  Ruler 
} from 'lucide-react';

const PredictionHistoryCard = ({ prediction }) => {
  const getRiskColor = (riskLevel) => {
    return riskLevel.includes('High') 
      ? 'bg-red-500/20 border-red-500' 
      : 'bg-green-500/20 border-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg border ${getRiskColor(prediction.risk_level)} mb-4`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">
          {new Date(prediction.created_at).toLocaleDateString()}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          prediction.risk_level.includes('High') 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {prediction.risk_level}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center space-x-2">
          <Ruler className="text-blue-400" size={20} />
          <span className="text-gray-300">{prediction.height} cm</span>
        </div>
        <div className="flex items-center space-x-2">
          <Weight className="text-blue-400" size={20} />
          <span className="text-gray-300">{prediction.weight} kg</span>
        </div>
        <div className="flex items-center space-x-2">
          <Thermometer className="text-blue-400" size={20} />
          <span className="text-gray-300">BMI: {prediction.bmi}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="text-blue-400" size={20} />
          <span className="text-gray-300">{prediction.bmi_category}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-gray-400">Blood Pressure</p>
          <p className="text-white">{prediction.systolic_bp}/{prediction.diastolic_bp} mmHg</p>
          <p className="text-xs text-gray-300">{prediction.blood_pressure_category}</p>
        </div>
        {/* <div>
          <p className="text-sm text-gray-400">Risk Probability</p>
          <p className="text-white">{prediction.risk_probability}%</p>
        </div> */}
      </div>

      <div className="mt-3 border-t border-gray-700 pt-3">
        <p className="text-sm text-gray-400">Lifestyle Factors</p>
        <div className="flex space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs ${
            prediction.smoking ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            Smoking: {prediction.smoking ? 'Yes' : 'No'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            prediction.alcohol ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            Alcohol: {prediction.alcohol ? 'Yes' : 'No'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            prediction.physical_activity ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            Physical Activity: {prediction.physical_activity ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(storedUser);
    
    if (storedUser.userType === 'patient') {
      fetchPatientPredictions(storedUser.id);
    } else if (storedUser.userType === 'clinician') {
      fetchClinicianData(storedUser.id);
    }
    
    setIsLoading(false);
  }, [navigate]);

  const fetchPatientPredictions = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/patient/predictions/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching patient predictions:', error);
      setError('Failed to fetch predictions');
    }
  };

  const fetchClinicianData = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/clinician/patients/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching clinician data:', error);
      setError('Failed to fetch patient data');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg mt-12"
      >
        <h1 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center">
          <Heart className="mr-3 text-red-500" />
          Welcome, {user.name} ({user.userType.charAt(0).toUpperCase() + user.userType.slice(1)})
        </h1>
        
        <div>
          <h2 className="text-xl text-indigo-400 font-semibold mb-4">
            {user.userType === 'patient' ? 'Prediction History' : 'Patient Summaries'}
          </h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {user.userType === 'patient' && predictions.length > 0 ? (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <PredictionHistoryCard 
                  key={prediction.id} 
                  prediction={prediction} 
                />
              ))}
            </div>
          ) : user.userType === 'clinician' ? (
            <div className="text-white">
              {predictions.map((patient, index) => (
                <div 
                  key={index} 
                  className="bg-gray-700 p-4 rounded-lg mb-2 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{patient.name}</p>
                    <p className="text-sm text-gray-300">Risk Level: {patient.risk_level}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/patient-details/${patient.id}`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center">No prediction history available</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;