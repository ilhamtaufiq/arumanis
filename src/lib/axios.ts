import axios from 'axios';
import { useAuthStore } from '@/stores/auth-stores';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://apiamis.test/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
