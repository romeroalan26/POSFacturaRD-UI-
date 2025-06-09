import axiosInstance from './axios.config';
import { API_ENDPOINTS } from './config';

const authService = {
    async login(email, password) {
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                email,
                password,
            });
            if (response.data.data && response.data.data.token) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    }
};

export default authService; 