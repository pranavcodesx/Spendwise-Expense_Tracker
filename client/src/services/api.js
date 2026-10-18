import axios from 'axios';

// withCredentials lets the browser send the HttpOnly auth cookie.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });

// If a private API call comes back 401, the session ended: tell the app so it can send the user to /login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.startsWith('/auth/')) window.dispatchEvent(new Event('auth:expired'));
    return Promise.reject(err);
  }
);
export default api;
