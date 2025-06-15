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
        if (response.data.data) {
            response.data.data.ganancia_total = Number(response.data.data.ganancia_total) || 0;
            response.data.data.total_ingresos = Number(response.data.data.total_ingresos) || 0;
            response.data.data.margen_promedio = Number(response.data.data.margen_promedio) || 0;
            response.data.data.total_gastos = Number(response.data.data.total_gastos) || 0;
        }
        return response.data;
    },

    async getVentasDiarias(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/ventas-diarias${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        if (response.data.data) {
            response.data.data = response.data.data
                .map(item => {
                    // Ajustar la fecha para manejar la zona horaria
                    const fecha = new Date(item.dia);
                    fecha.setHours(fecha.getHours() + fecha.getTimezoneOffset() / 60);

                    return {
                        ...item,
                        total_ventas: Number(item.total_ventas) || 0,
                        total_monto: parseFloat(item.total_monto) || 0,
                        dia: fecha.toLocaleDateString('es-DO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                    };
                })
                .sort((a, b) => new Date(a.dia) - new Date(b.dia));
        }
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

    async getGanancias(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/ganancias${query ? `?${query}` : ''}`;
        const response = await axiosInstance.get(url);
        if (response.data.data) {
            response.data.data = response.data.data.map(item => ({
                ...item,
                ganancia_bruta: Number(item.ganancia_bruta) || 0,
                total_ventas: Number(item.total_ventas) || 0
            }));
        }
        return response.data;
    },

    async getVentasPorCategoria(params = {}) {
        const query = buildQuery(params);
        const url = `/api/reportes/ventas-por-categoria${query ? `?${query}` : ''}`;
        try {
            const response = await axiosInstance.get(url);
            if (response.data && response.data.data) {
                return {
                    ...response.data,
                    data: response.data.data.map(item => ({
                        ...item,
                        total_ventas: Number(item.total_ventas) || 0,
                        total_ingresos: Number(item.total_ingresos) || 0,
                        total_productos_vendidos: Number(item.total_productos_vendidos) || 0,
                        precio_promedio: Number(item.precio_promedio) || 0,
                        ganancia_total: Number(item.ganancia_total) || 0,
                        margen_ganancia: Number(item.margen_ganancia) || 0
                    }))
                };
            }
            return { data: [] };
        } catch (error) {
            return { data: [] };
        }
    },
};

export default reportsService; 