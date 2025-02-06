import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'patient', // Default userType
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const response = await axios.post('http://127.0.0.1:8000/signup/', formData, {
            headers: { 'Content-Type': 'application/json' },
        });
        console.log('Signup successful:', response.data);
        alert('Signup successful! Please login.');
        // Redirect to the login page
        window.location.href = '/login';
    } catch (err) {
        setError(err.response?.data?.error || 'An error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Heart */}
      <motion.div
        className="absolute inset-0 flex justify-center items-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: [1.1, 1.4, 1.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <UserPlus className="w-[650px] h-[650px] text-blue-500/40" />
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-700 p-8 relative z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full py-3 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full py-3 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full py-3 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            name="userType"
            onChange={handleChange}
            className="w-full py-3 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="patient">Patient</option>
            <option value="clinician">Clinician</option>
          </select>
          {error && <p className="text-red-500">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </motion.button>
        </form>
        <div className="mt-6 text-center text-white">
          <p>Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-500 underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
