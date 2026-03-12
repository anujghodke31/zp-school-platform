import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Request interceptor — attach current token from localStorage
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — on 401 force-refresh the Firebase token and retry once
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retried) {
            originalRequest._retried = true;
            try {
                const firebaseUser = auth.currentUser;
                if (!firebaseUser) return Promise.reject(error);

                // Force a fresh token from Firebase
                const newToken = await firebaseUser.getIdToken(true);

                // Update stored user info with new token
                const stored = localStorage.getItem('userInfo');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    parsed.token = newToken;
                    localStorage.setItem('userInfo', JSON.stringify(parsed));
                }

                // Retry the original request with the refreshed token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;

