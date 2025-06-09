import axiosInstance from './axios.config';
import { API_ENDPOINTS } from './config';

const productsService = {
    async getProducts() {
        try {
            const response = await axiosInstance.get('/api/productos');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async createProduct(productData) {
        try {
            const response = await axiosInstance.post('/api/productos', productData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updateProduct(id, productData) {
        try {
            const response = await axiosInstance.put(`/api/productos/${id}`, productData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            const response = await axiosInstance.delete(`/api/productos/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default productsService; 