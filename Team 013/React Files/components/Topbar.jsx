import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token'); // Check if user is signed in
  const user = JSON.parse(localStorage.getItem('user')); // Get user details

  const handleAuthClick = () => {
    if (isAuthenticated) {
      localStorage.removeItem('token'); // Logout
      localStorage.removeItem('user'); // Remove user data
      navigate('/login');
    } else {
      navigate('/login'); // Login/Signup
    }
  };

  const handleHomeClick = () => {
    if (isAuthenticated) {
      if (user?.userType === 'patient') {
        navigate('/dashboard-patient'); // Redirect logged-in patient to their dashboard
      } else if (user?.userType === 'clinician') {
        navigate('/dashboard-clinician'); // Redirect logged-in clinician to their dashboard
      }
    } else {
      navigate('/qna'); // Redirect non-logged-in users to QnA
    }
  };

  return (
    <div className="w-full bg-transparent py-4 px-6 fixed top-0 left-0 z-20 flex justify-between items-center">
      {/* Navigation Links */}
      <div className="flex space-x-6">
        <button onClick={handleHomeClick} className="text-white hover:text-gray-300">
          Home
        </button>
        <button onClick={() => navigate('/qna')} className="text-white hover:text-gray-300">
          Predict CAD
        </button>
      </div>

      {/* Authentication Button */}
      <button
        onClick={handleAuthClick}
        className={`px-4 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isAuthenticated
            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
            : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
        }`}
      >
        {isAuthenticated ? 'Logout' : 'Login/Signup'}
      </button>
    </div>
  );
};

export default TopBar;
