import api from './api';

const data = (r) => r.data.data;
export const login = (payload) => api.post('/auth/login', payload).then(data);
export const register = (payload) => api.post('/auth/register', payload).then(data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me').then(data);
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload).then((r) => r.data);
export const resetPassword = (payload) => api.post('/auth/reset-password', payload).then((r) => r.data);
