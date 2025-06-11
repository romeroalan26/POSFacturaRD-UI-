import axiosInstance from './axios.config';
import { API_ENDPOINTS } from './config';

const buildQuery = (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });
    return queryParams.toString();
};

const productsService = {
    async getProducts(params = {}) {
        try {
            const query = buildQuery(params);
            const url = `/api/productos${query ? `?${query}` : ''}`;
            const response = await axiosInstance.get(url);
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
    },

    uploadImage: async (imageFile) => {
        const formData = new FormData();
        formData.append("imagen", imageFile);
        const response = await axiosInstance.post(
            "/api/productos/upload-imagen",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },
};

export default productsService; 