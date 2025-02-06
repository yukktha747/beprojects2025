import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HeartPulse, User, FileText, Search } from 'lucide-react';

const ClinicianDashboard = () => {
    const [user, setUser] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchPredictions();
    }, [searchQuery]);

    const fetchPredictions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                // Redirect to login if needed
                return;
            }
    
            const response = await axios.get(
                `http://127.0.0.1:8000/api/clinician/predictions/?search=${searchQuery}`,
                {
                    headers: {
                        'Authorization': `Token ${token}`,  // Changed from 'Bearer' to 'Token'
                        'Content-Type': 'application/json'
                    }
                }
            );
            setPredictions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching predictions:', error);
            if (error.response?.status === 401) {
                // Handle unauthorized error - maybe redirect to login
                console.log('Authentication failed - redirecting to login');
                // You might want to redirect to login here
                // window.location.href = '/login';
            }
            setLoading(false);
        }
    };

    const handleViewPatientDetails = (prediction) => {
        setSelectedPatient(prediction);
    };

    const PatientDetailsModal = ({ patient, onClose }) => {
        if (!patient) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg w-3/4 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">Patient Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Personal Information</h3>
                            <p>Name: {patient.patient_name}</p>
                            <p>Email: {patient.patient_email}</p>
                            <p>Age: {patient.age}</p>
                            <p>Gender: {patient.sex === 1 ? 'Male' : 'Female'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Health Metrics</h3>
                            <p>Blood Pressure: {patient.resting_bp}</p>
                            <p>Cholesterol: {patient.cholesterol}</p>
                            <p>Max Heart Rate: {patient.max_heart_rate}</p>
                        </div>
                        <div className="col-span-2">
                            <h3 className="font-semibold">Risk Assessment</h3>
                            <p>Risk Level: {patient.risk_level}</p>
                            {/* <p>Risk Probability: {patient.risk_probability}%</p> */}
                            <p>Prediction Date: {patient.created_at}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white">
            <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto"
            >
                <div className="flex items-center justify-between mb-8 mt-10">
                    <div className="flex items-center">
                        <HeartPulse className="w-12 h-12 mr-4 text-blue-500" />
                        <h1 className="text-3xl font-bold">Clinician Dashboard</h1>
                    </div>
                    <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2">
                        <Search className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none focus:outline-none text-white"
                        />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="mr-2" /> Patient Predictions
                    </h2>
                    {loading ? (
                        <p>Loading predictions...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="py-2 text-left">Patient Name</th>
                                        <th className="py-2 text-left">Email</th>
                                        <th className="py-2 text-left">Risk Level</th>
                                        <th className="py-2 text-left">Date</th>
                                        <th className="py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.map((prediction) => (
                                        <tr key={prediction.id} className="border-b border-gray-700">
                                            <td className="py-2">{prediction.patient_name}</td>
                                            <td className="py-2">{prediction.patient_email}</td>
                                            <td className="py-2">
                                                <span className={`px-2 py-1 rounded ${
                                                    prediction.risk_level === "High Risk" 
                                                        ? "bg-red-500" 
                                                        : "bg-green-500"
                                                }`}>
                                                    {prediction.risk_level}
                                                </span>
                                            </td>
                                            <td className="py-2">{prediction.created_at}</td>
                                            <td className="py-2">
                                                <button 
                                                    onClick={() => handleViewPatientDetails(prediction)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
            
            {selectedPatient && (
                <PatientDetailsModal 
                    patient={selectedPatient} 
                    onClose={() => setSelectedPatient(null)} 
                />
            )}
        </div>
    );
};

export default ClinicianDashboard;