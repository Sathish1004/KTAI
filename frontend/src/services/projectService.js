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

export const projectService = {
  // Fetch active projects (accessible by role)
  getProjects: async () => {
    const response = await api.get('/api/projects');
    return response.data;
  },

  // Fetch full project metrics, team, and files by ID
  getProject: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  // Create new project with detailed assignments and resources
  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },

  // Fetch active employees lists to assign (Admin only)
  getEmployeesList: async () => {
    const response = await api.get('/api/projects/meta/employees');
    return response.data;
  },

  // Upload file resource to project context
  uploadResource: async (projectId, file, title) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const response = await api.post(`/api/projects/${projectId}/resources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update existing project details
  updateProject: async (id, projectData) => {
    const response = await api.patch(`/api/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project and cascade all assignments/resources
  deleteProject: async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  }
};

export default projectService;
