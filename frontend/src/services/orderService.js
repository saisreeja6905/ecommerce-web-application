import api from './api';

export const orderService = {
  async createOrder(orderData) {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  async getOrder(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async getMyOrders(params = {}) {
    const res = await api.get('/orders/my-orders', { params });
    return res.data;
  },

  async getAllOrders(params = {}) {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  async updateOrderStatus(id, status, note = '') {
    const res = await api.put(`/orders/${id}/status`, { status, note });
    return res.data;
  },

  async cancelOrder(id, reason = '') {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
};
