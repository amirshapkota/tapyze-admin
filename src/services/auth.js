import { apiService } from './api';

export const authAPI = {
  // Admin login
  login: async (email, password) => {
    return apiService.post('/auth/admin/login', { email, password });
  },

  // Create new admin
  createAdmin: async (adminData) => {
    return apiService.post('/auth/admin/create', adminData);
  },

  // Setup first admin (one-time)
  setupFirstAdmin: async (adminData) => {
    return apiService.post('/auth/admin/setup', adminData);
  },

  // Validate token
  validateToken: async () => {
    return apiService.get('/auth/validate');
  },

  // Refresh token
  refreshToken: async () => {
    return apiService.post('/auth/refresh');
  },

  // Logout (if backend tracking is needed)
  logout: async () => {
    return apiService.post('/auth/admin/logout');
  }
};

export default authAPI;