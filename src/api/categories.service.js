import axiosInstance from './axios.config';

const buildQuery = (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });
    return queryParams.toString();
};

const categoriesService = {
    async getCategories(params = {}) {
        try {
            const query = buildQuery(params);
            const url = `/api/categorias${query ? `?${query}` : ''}`;
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error en getCategories:', error);
            throw error;
        }
    },

    async createCategory(categoryData) {
        try {
            const response = await axiosInstance.post('/api/categorias', categoryData);
            return response.data;
        } catch (error) {
            console.error('Error en createCategory:', error);
            throw error;
        }
    },

    async updateCategory(id, categoryData) {
        try {
            const response = await axiosInstance.put(`/api/categorias/${id}`, categoryData);
            return response.data;
        } catch (error) {
            console.error('Error en updateCategory:', error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const response = await axiosInstance.delete(`/api/categorias/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error en deleteCategory:', error);
            throw error;
        }
    }
};

export default categoriesService; 