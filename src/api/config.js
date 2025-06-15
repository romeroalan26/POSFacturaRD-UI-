export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
    BASE_URL: API_BASE_URL,
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
    },
    PRODUCTS: {
        LIST: '/api/productos',
        CREATE: '/api/productos',
        UPDATE: '/api/productos/:id',
        DELETE: '/api/productos/:id',
    },
    SALES: {
        LIST: '/api/ventas',
        CREATE: '/api/ventas',
        DETAIL: '/api/ventas/:id',
        EXPORT: '/api/ventas/exportar',
    },
    CATEGORIES: {
        LIST: '/api/categorias',
        CREATE: '/api/categorias',
        UPDATE: '/api/categorias/:id',
        DELETE: '/api/categorias/:id',
    },
    EXPENSES: {
        LIST: '/api/gastos',
        CREATE: '/api/gastos',
        UPDATE: '/api/gastos/:id',
        DELETE: '/api/gastos/:id',
        DETAIL: '/api/gastos/:id',
    },
    EXPENSE_CATEGORIES: {
        LIST: '/api/categorias-gastos',
        CREATE: '/api/categorias-gastos',
        UPDATE: '/api/categorias-gastos/:id',
        DELETE: '/api/categorias-gastos/:id',
        DETAIL: '/api/categorias-gastos/:id',
    },
    REPORTS: {
        DAILY_SALES: '/api/reportes/ventas-diarias',
        TOP_PRODUCTS: '/api/reportes/productos-mas-vendidos',
        PAYMENT_METHODS: '/api/reportes/resumen-metodo-pago'
    }
}; 