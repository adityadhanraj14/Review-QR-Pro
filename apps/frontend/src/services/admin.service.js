import api from './api';

export const adminService = {
  createAdmin(payload) {
    return api.post('/admin/admins', payload);
  },
  createOwner(payload) {
    return api.post('/admin/owners', payload);
  },
  listOwners() {
    return api.get('/admin/owners');
  },
  createBusiness(payload) {
    return api.post('/admin/businesses', payload);
  },
  listBusinesses() {
    return api.get('/admin/businesses');
  },
  analytics() {
    return api.get('/admin/analytics');
  },
  listFeedback(params) {
    return api.get('/admin/feedback', { params });
  },
  getBusinessQr(id) {
    return api.get(`/admin/businesses/${id}/qr`);
  },
  businessAnalytics(id) {
    return api.get(`/admin/businesses/${id}/analytics`);
  },
  businessFeedback(id, params) {
    return api.get(`/admin/businesses/${id}/feedback`, { params });
  },
};
