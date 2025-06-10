import axiosInstance from './axios.config';
import { API_ENDPOINTS } from './config';

const buildQuery = (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    return queryParams.toString();
};

const salesService = {
    async getSales(params = {}) {
        try {
            const query = buildQuery(params);
            const url = `/api/ventas${query ? `?${query}` : ''}`;
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getSaleById(id) {
        try {
            const response = await axiosInstance.get(`/api/ventas/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async createSale(saleData) {
        try {
            const response = await axiosInstance.post('/api/ventas', saleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteSale(id) {
        try {
            const response = await axiosInstance.delete(`/api/ventas/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default salesService; 