import axiosInstance from './axios.config';

const buildQuery = (params = {}) => {
    const esc = encodeURIComponent;
    return (
        Object.keys(params)
            .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
            .map((k) => esc(k) + '=' + esc(params[k]))
            .join('&')
    );
};

const reportsService = {
    async getResumenGeneral(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/resumen-general${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    async getVentasDiarias(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/ventas-diarias${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    async getVentasPorHora(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/ventas-por-hora${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    async getTendenciaVentas(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/tendencia-ventas${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    async getProductosMasVendidos(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/productos-mas-vendidos${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    async getResumenMetodoPago(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/resumen-metodo-pago${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    async getProductosBajoStock(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/productos-bajo-stock${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },
};

export default reportsService; 