import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      // Handle specific error cases
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          toast.error(data.message || 'Session expired. Please login again.');
          break;
          
        case 403:
          toast.error(data.message || 'You do not have permission to perform this action.');
          break;
          
        case 404:
          toast.error(data.message || 'Resource not found.');
          break;
          
        case 409:
          toast.error(data.message || 'Conflict error.');
          break;
          
        case 422:
        case 400:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.message);
            });
          } else {
            toast.error(data.message || 'Validation error.');
          }
          break;
          
        case 429:
          toast.error(data.message || 'Too many requests. Please try again later.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh'),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),
  getStats: () => api.get('/courses/stats'),
};

export const enrollmentsAPI = {
  getAll: (params) => api.get('/enrollments', { params }),
  getById: (id) => api.get(`/enrollments/${id}`),
  getMy: (params) => api.get('/enrollments/my', { params }),
  create: (data) => api.post('/enrollments', data),
  update: (id, data) => api.put(`/enrollments/${id}`, data),
  delete: (id) => api.delete(`/enrollments/${id}`),
  enrollInCourse: (courseId) => api.post(`/enrollments/enroll/${courseId}`),
  getStats: () => api.get('/enrollments/stats'),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  resetPassword: (id, data) => api.patch(`/users/${id}/reset-password`, data),
  getStats: () => api.get('/users/stats'),
};

export default api;