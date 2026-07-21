import axios from 'axios';

// API Instance with authorization token handling
const api = axios.create({
  baseURL: '', // Using Vite proxy
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const adminService = {
  // Fetch comprehensive platform statistics (Admin only)
  getPlatformStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  }
};

export default adminService;
