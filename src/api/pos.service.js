import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./config";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const buildQuery = (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value);
        }
    });
    return queryParams.toString();
};

const posService = {
    getProducts: async (params = {}) => {
        try {
            const query = buildQuery(params);
            const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS.LIST}?${query}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getCategories: async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.LIST);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createSale: async (saleData) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.SALES.CREATE, saleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTopProducts: async (params = {}) => {
        try {
            const query = buildQuery(params);
            const response = await axiosInstance.get(`${API_ENDPOINTS.REPORTS.TOP_PRODUCTS}?${query}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getDailySales: async (params = {}) => {
        try {
            const query = buildQuery(params);
            const response = await axiosInstance.get(`${API_ENDPOINTS.REPORTS.DAILY_SALES}?${query}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default posService; 