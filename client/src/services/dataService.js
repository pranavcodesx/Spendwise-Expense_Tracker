import api from './api';

const data = (r) => r.data.data;
export const transactionApi = {
  list: (params) => api.get('/transactions', { params }).then(data),
  create: (body) => api.post('/transactions', body).then(data),
  update: (id, body) => api.patch(`/transactions/${id}`, body).then(data),
  remove: (id) => api.delete(`/transactions/${id}`).then(data),
};
export const dashboardApi = {
  summary: (params) => api.get('/dashboard/summary', { params }).then(data),
  charts: (params) => api.get('/dashboard/charts', { params }).then(data),
  recent: (params) => api.get('/dashboard/recent-transactions', { params }).then(data),
};
export const budgetApi = {
  list: (month) => api.get('/budgets', { params: { month } }).then(data),
  create: (body) => api.post('/budgets', body).then(data),
  update: (id, body) => api.patch(`/budgets/${id}`, body).then(data),
  remove: (id) => api.delete(`/budgets/${id}`).then(data),
};
export const analyticsApi = {
  summary: (params) => api.get('/analytics/summary', { params }).then(data),
  categories: (params) => api.get('/analytics/spending-by-category', { params }).then(data),
  trends: (params) => api.get('/analytics/monthly-trends', { params }).then(data),
};
export const reportApi = {
  summary: (params) => api.get('/reports/summary', { params }).then(data),
  exportCsv: (params) => api.get('/reports/export', { params, responseType: 'blob' }).then((r) => r.data),
};
export const userApi = {
  updateProfile: (body) => api.patch('/users/profile', body).then(data),
  updatePassword: (body) => api.patch('/users/password', body).then((r) => r.data),
  loadDemo: () => api.post('/users/demo-data').then(data),
  removeDemo: () => api.delete('/users/demo-data').then(data),
};
