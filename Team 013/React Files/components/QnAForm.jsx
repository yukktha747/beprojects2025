import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, HeartPulse } from 'lucide-react';
import CADPredictionForm from './CADPredictionForm';
import CADPatient from './CADPatient';
import TopBar from './TopBar';

const QnAForm = () => {
  const [userType, setUserType] = useState(null);
  const [loggedInUserType, setLoggedInUserType] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setLoggedInUserType(storedUser.userType);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Top Bar */}
      <TopBar />

      {/* Animated heart in the background */}
      <motion.div
        className="absolute inset-0 flex justify-center items-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: [1.1, 1.4, 1.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <HeartPulse className="w-[650px] h-[650px] text-red-500/40" />
      </motion.div>

      {/* Medical-themed background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="pulse-animation absolute top-10 left-20 w-64 h-64 bg-blue-400 rounded-full filter blur-2xl"></div>
        <div className="pulse-animation absolute bottom-10 right-20 w-48 h-48 bg-red-400 rounded-full filter blur-2xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-700 p-8 relative z-10"
      >
        {!userType ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-white tracking-tight">Who Are You?</h2>
            <p className='mb-8 text-white tracking-tight'>Let's Predict your heart condition!</p>
            <div className="space-y-6">
              {/* Show "I am a Clinician" button only if the user is NOT a patient */}
              {loggedInUserType !== 'patient' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserType('clinician')}
                  className="w-full flex items-center justify-center bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors space-x-3"
                >
                  <Stethoscope className="w-6 h-6" />
                  <span>I am a Clinician</span>
                </motion.button>
              )}

              {/* Show "I am a Patient" button only if the user is NOT a clinician */}
              {loggedInUserType !== 'clinician' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserType('patient')}
                  className="w-full flex items-center justify-center bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-colors space-x-3"
                >
                  <HeartPulse className="w-6 h-6" />
                  <span>I am a Patient</span>
                </motion.button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {userType === 'clinician' ? <CADPredictionForm /> : <CADPatient />}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserType(null)}
              className="mt-6 w-full text-sm text-gray-400 hover:text-white underline transition-colors"
            >
              Go Back
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QnAForm;
