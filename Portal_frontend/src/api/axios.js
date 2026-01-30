import axios from 'axios';

const api = axios.create({
  // Use your backend's base URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // CRITICAL: This allows the browser to send and receive cookies 
  // (JWT tokens) from your backend auth controller
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
  }
});

// Optional: Add a response interceptor to handle common errors like 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic for handling expired sessions (e.g., redirecting to login)
      console.error('Unauthorized: Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;