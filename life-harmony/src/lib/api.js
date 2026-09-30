// src/lib/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lh_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Only clear session if the token validation endpoint (/auth/me) explicitly rejects the token
        const isAuthValidation = err.config?.url && (err.config.url.endsWith('/auth/me') || err.config.url.endsWith('/auth/profile'));
        if (err.response?.status === 401 && isAuthValidation) {
            try {
                localStorage.removeItem('lh_token');
                localStorage.removeItem('lh_user');
            } catch {}
        }
        return Promise.reject(err);
    }
);

export default api;