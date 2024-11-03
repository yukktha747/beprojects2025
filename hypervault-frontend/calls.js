import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000'

async function login(username, password) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login/`, {
            username,
            password,
        });

        if (response.status === 200) {
            const token = response.data.token;
            localStorage.setItem('token', token);
            console.log("Login successful");
            return true;
        }
    } catch (error) {
        return false;
    }
    
    return false;
}

async function register(username, password) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/register/`, {
            username,
            password,
        });

        if (response.status === 201) {
            console.log("Registration successful");
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

function getToken() {
    return localStorage.getItem('token');
}

function deleteToken() {
    localStorage.removeItem("token");
}

function isLoggedIn() {
    return Boolean(getToken());
}

module.exports = { login, getToken, isLoggedIn, deleteToken, register }
