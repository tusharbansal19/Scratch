import axios from 'axios';

// Base API URL - Railway backend
export const API_BASE_URL = 'https://scratch-production-e94b.up.railway.app';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect if the error is from the login endpoint itself
        if (error.response?.status === 401 && !error.config.url.includes('/auth/token')) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            
        }
        return Promise.reject(error);
    }
);

export default api;
