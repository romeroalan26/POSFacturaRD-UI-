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

const expensesService = {
    // Gastos
    async getExpenses(params = {}) {
        try {
            const query = buildQuery(params);
            const response = await axiosInstance.get(`${API_ENDPOINTS.EXPENSES.LIST}?${query}`);
            return response.data;
        } catch (error) {
            console.error('Error en getExpenses:', error);
            throw error;
        }
    },

    async getExpense(id) {
        try {
            const response = await axiosInstance.get(`${API_ENDPOINTS.EXPENSES.DETAIL.replace(':id', id)}`);
            return response.data;
        } catch (error) {
            console.error('Error en getExpense:', error);
            throw error;
        }
    },

    async createExpense(expenseData) {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.EXPENSES.CREATE, expenseData);
            return response.data;
        } catch (error) {
            console.error('Error en createExpense:', error);
            throw error;
        }
    },

    async updateExpense(id, expenseData) {
        try {
            const response = await axiosInstance.put(
                API_ENDPOINTS.EXPENSES.UPDATE.replace(':id', id),
                expenseData
            );
            return response.data;
        } catch (error) {
            console.error('Error en updateExpense:', error);
            throw error;
        }
    },

    async deleteExpense(id) {
        try {
            const response = await axiosInstance.delete(
                API_ENDPOINTS.EXPENSES.DELETE.replace(':id', id)
            );
            return response.data;
        } catch (error) {
            console.error('Error en deleteExpense:', error);
            throw error;
        }
    },

    // Categorías de Gastos
    async getExpenseCategories(params = {}) {
        try {
            const query = buildQuery(params);
            const response = await axiosInstance.get(`${API_ENDPOINTS.EXPENSE_CATEGORIES.LIST}?${query}`);
            return response.data;
        } catch (error) {
            console.error('Error en getExpenseCategories:', error);
            throw error;
        }
    },

    async getExpenseCategory(id) {
        try {
            const response = await axiosInstance.get(
                API_ENDPOINTS.EXPENSE_CATEGORIES.DETAIL.replace(':id', id)
            );
            return response.data;
        } catch (error) {
            console.error('Error en getExpenseCategory:', error);
            throw error;
        }
    },

    async createExpenseCategory(categoryData) {
        try {
            const response = await axiosInstance.post(
                API_ENDPOINTS.EXPENSE_CATEGORIES.CREATE,
                categoryData
            );
            return response.data;
        } catch (error) {
            console.error('Error en createExpenseCategory:', error);
            throw error;
        }
    },

    async updateExpenseCategory(id, categoryData) {
        try {
            const response = await axiosInstance.put(
                API_ENDPOINTS.EXPENSE_CATEGORIES.UPDATE.replace(':id', id),
                categoryData
            );
            return response.data;
        } catch (error) {
            console.error('Error en updateExpenseCategory:', error);
            throw error;
        }
    },

    async deleteExpenseCategory(id) {
        try {
            const response = await axiosInstance.delete(
                API_ENDPOINTS.EXPENSE_CATEGORIES.DELETE.replace(':id', id)
            );
            return response.data;
        } catch (error) {
            console.error('Error en deleteExpenseCategory:', error);
            throw error;
        }
    },

    // Exportación
    async exportToCSV(params = {}) {
        try {
            const query = buildQuery(params);
            const response = await axiosInstance.get(`/api/gastos/exportar/csv?${query}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error en exportToCSV:', error);
            throw error;
        }
    },

    async exportToPDF(params = {}) {
        try {
            const query = buildQuery(params);
            const response = await axiosInstance.get(`/api/gastos/exportar/pdf?${query}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error en exportToPDF:', error);
            throw error;
        }
    }
};

export default expensesService; 