import api from './api';

export const reviewService = {
  async getProductReviews(productId, params = {}) {
    const res = await api.get(`/reviews/product/${productId}`, { params });
    return res.data;
  },

  async createReview(productId, reviewData) {
    const res = await api.post(`/reviews/product/${productId}`, reviewData);
    return res.data;
  },

  async updateReview(reviewId, reviewData) {
    const res = await api.put(`/reviews/${reviewId}`, reviewData);
    return res.data;
  },

  async deleteReview(reviewId) {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data;
  },
};
