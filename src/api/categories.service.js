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

    async getActiveCategories() {
        try {
            const response = await axiosInstance.get('/api/categorias?is_active=true');
            return response.data;
        } catch (error) {
            console.error('Error en getActiveCategories:', error);
            throw error;
        }
    },

    async getExpenseCategories(params = {}) {
        try {
            const query = buildQuery(params);
            const url = `/api/categorias-gastos${query ? `?${query}` : ''}`;
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error en getExpenseCategories:', error);
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

    async createExpenseCategory(categoryData) {
        try {
            const response = await axiosInstance.post('/api/categorias-gastos', categoryData);
            return response.data;
        } catch (error) {
            console.error('Error en createExpenseCategory:', error);
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

    async updateExpenseCategory(id, categoryData) {
        try {
            const response = await axiosInstance.put(`/api/categorias-gastos/${id}`, categoryData);
            return response.data;
        } catch (error) {
            console.error('Error en updateExpenseCategory:', error);
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
    },

    async deleteExpenseCategory(id) {
        try {
            const response = await axiosInstance.delete(`/api/categorias-gastos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error en deleteExpenseCategory:', error);
            throw error;
        }
    }
};

export default categoriesService; 