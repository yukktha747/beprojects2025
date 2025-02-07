import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import TopBar from './TopBar';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Use navigation hook for programmatic routing

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/login/', { username, password });
            
            // Store more comprehensive user information
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.data.user_id,
                username: response.data.username,
                userType: response.data.user_type,
                name: response.data.name // Assuming the backend sends the user's name
            }));

            // Use navigate for routing instead of window.location.href
            if (response.data.user_type === 'clinician') {
                navigate('/dashboard-clinician');
            } else {
                navigate('/dashboard-patient');
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
            <TopBar />

            <motion.div
                className="absolute inset-0 flex justify-center items-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: [1.1, 1.4, 1.1] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <HeartPulse className="w-[650px] h-[650px] text-red-500/40" />
            </motion.div>

            <div className="absolute inset-0 opacity-20">
                <div className="pulse-animation absolute top-10 left-20 w-64 h-64 bg-blue-400 rounded-full filter blur-2xl"></div>
                <div className="pulse-animation absolute bottom-10 right-20 w-48 h-48 bg-red-400 rounded-full filter blur-2xl"></div>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-700 p-8 relative z-10"
            >
                <h2 className="text-3xl font-bold mb-6 text-white text-center">Login</h2>
                
                <div className="space-y-6">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full py-3 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full py-3 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className={`w-full flex items-center justify-center bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </motion.button>
                </div>

                <div className="mt-6 text-center text-white">
                    <p>Don't have an account?{' '}
                        <Link 
                            to="/signup" 
                            className="text-blue-400 hover:text-blue-500 underline"
                        >
                            Signup here
                        </Link>
                    </p>
                </div>
            </motion.form>
        </div>
    );
};

export default Login;