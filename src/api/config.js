export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },
    PRODUCTS: {
        LIST: '/productos',
        CREATE: '/productos',
        UPDATE: '/productos/:id',
        DELETE: '/productos/:id',
    },
    SALES: {
        LIST: '/ventas',
        CREATE: '/ventas',
        DETAIL: '/ventas/:id',
    },
    CATEGORIES: {
        LIST: '/categorias',
        CREATE: '/categorias',
        UPDATE: '/categorias/:id',
        DELETE: '/categorias/:id',
    },
    REPORTS: {
        DAILY_SALES: '/reportes/ventas-diarias',
        TOP_PRODUCTS: '/reportes/productos-mas-vendidos',
        PAYMENT_METHODS: '/reportes/resumen-metodo-pago'
    }
}; 