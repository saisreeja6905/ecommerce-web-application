import api from './api';

export const adminService = {
  async getDashboardStats() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getAllUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async getUserById(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  async updateUser(id, data) {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },

  async deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
