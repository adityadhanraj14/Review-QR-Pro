import api from './api';

export const ownerService = {
  listBusinesses() {
    return api.get('/owner/businesses');
  },
  getQr(id) {
    return api.get(`/owner/businesses/${id}/qr`);
  },
  analytics(id) {
    return api.get(`/owner/businesses/${id}/analytics`);
  },
  feedback(id, params) {
    return api.get(`/owner/businesses/${id}/feedback`, { params });
  },
};
