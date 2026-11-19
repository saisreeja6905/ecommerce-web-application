import api from './api';

export const paymentService = {
  // Razorpay integration
  async createRazorpayOrder(orderId) {
    const res = await api.post('/payments/razorpay/create-order', { orderId });
    return res.data;
  },

  async verifyRazorpayPayment(verificationData) {
    const res = await api.post('/payments/razorpay/verify', verificationData);
    return res.data;
  },

  // Sandbox / Card integration
  async createPaymentIntent(orderId) {
    const res = await api.post('/payments/create-intent', { orderId });
    return res.data;
  },

  async confirmPayment(paymentData) {
    const res = await api.post('/payments/confirm', paymentData);
    return res.data;
  },

  async getPaymentByOrder(orderId) {
    const res = await api.get(`/payments/order/${orderId}`);
    return res.data;
  },

  async processRefund(paymentId) {
    const res = await api.post(`/payments/${paymentId}/refund`);
    return res.data;
  },
};
