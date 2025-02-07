import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CADPredictionForm from './components/CADPredictionForm';
import CADPatient from './components/CADPatient';
import QnAForm from './components/QnAForm';
import TopBar from './components/TopBar';
import Login from './components/Login';
import Signup from './components/Signup';
import ClinicianDashboard from './components/ClinicianDashboard';
import UserDashboard from './components/UserDashboard'; 
import './index.css';

function HomePage({ onSelect }) {
  const [userType, setUserType] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setActiveComponent(type === 'clinician' ? 'prediction' : 'patient');
  };

  return (
    <div>
      {userType === null ? (
        <QnAForm onSelect={handleUserTypeSelection} />
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={() => setUserType(null)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Change User Type
            </button>
          </div>
          <div className="flex items-center justify-center">
            {activeComponent === 'prediction' ? <CADPredictionForm /> : <CADPatient />}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <TopBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/qna" element={<QnAForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Added routes for patient and clinician dashboards */}
        <Route path="/dashboard-patient" element={<UserDashboard />} />
        <Route path="/dashboard-clinician" element={<ClinicianDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;