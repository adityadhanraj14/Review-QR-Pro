import api from './api';

export const publicService = {
  getBusiness(slug) {
    return api.get(`/public/r/${slug}`);
  },
  generateReviews(slug, rating, sessionId) {
    return api.post('/public/review/generate', { slug, rating, sessionId });
  },
  logAnalytics(body) {
    return api.post('/public/analytics/log', body);
  },
  submitFeedback(body) {
    return api.post('/public/feedback', body);
  },
};
