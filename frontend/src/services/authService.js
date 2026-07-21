import axios from 'axios';

// API Instance
const api = axios.create({
  baseURL: '', // Using Vite proxy
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to attach JWT token to all requests if it exists
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

export const authService = {
  // Login call
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Register a new employee (Admin only)
  registerEmployee: async (name, email, password) => {
    const response = await api.post('/api/auth/register-employee', { name, email, password });
    return response.data;
  }
};

export default authService;
