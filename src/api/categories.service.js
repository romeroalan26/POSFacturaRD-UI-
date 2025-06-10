import axiosInstance from './axios.config';
import { API_ENDPOINTS } from './config';

const categoriesService = {
    async getCategories() {
        try {
            const response = await axiosInstance.get('/api/categorias');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async createCategory(categoryData) {
        try {
            const response = await axiosInstance.post('/api/categorias', categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updateCategory(id, categoryData) {
        try {
            const response = await axiosInstance.put(`/api/categorias/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const response = await axiosInstance.delete(`/api/categorias/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default categoriesService; 