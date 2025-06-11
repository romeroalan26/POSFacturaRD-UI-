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

/**
 * @typedef {Object} ProductoVenta
 * @property {number} producto_id - ID del producto
 * @property {string} nombre - Nombre del producto
 * @property {number} cantidad - Cantidad vendida
 * @property {number} precio_unitario - Precio unitario al momento de la venta
 */

/**
 * @typedef {Object} Venta
 * @property {number} id - ID de la venta
 * @property {string} fecha - Fecha y hora de la venta
 * @property {number|null} total - Total de la venta (deprecated)
 * @property {string} metodo_pago - Método de pago (efectivo, tarjeta, transferencia)
 * @property {string} subtotal - Subtotal de la venta
 * @property {string} itbis_total - Total de ITBIS
 * @property {string} total_final - Total final de la venta
 * @property {ProductoVenta[]} productos - Lista de productos vendidos
 */

/**
 * @typedef {Object} VentasResponse
 * @property {Venta[]} data - Lista de ventas
 * @property {number} page - Página actual
 * @property {number} size - Tamaño de página
 * @property {number} totalElements - Total de elementos
 * @property {number} totalPages - Total de páginas
 * @property {string|null} fecha_inicio - Fecha de inicio del filtro
 * @property {string|null} fecha_fin - Fecha de fin del filtro
 * @property {string|null} metodo_pago - Método de pago del filtro
 */

const salesService = {
    /**
     * Obtiene la lista de ventas con paginación y filtros
     * @param {Object} params - Parámetros de búsqueda
     * @param {number} [params.page=1] - Número de página
     * @param {number} [params.size=10] - Tamaño de página
     * @param {string} [params.fecha_inicio] - Fecha de inicio (YYYY-MM-DD)
     * @param {string} [params.fecha_fin] - Fecha de fin (YYYY-MM-DD)
     * @param {string} [params.metodo_pago] - Método de pago
     * @returns {Promise<VentasResponse>} Respuesta con la lista de ventas
     */
    async getSales(params = {}) {
        try {
            const query = buildQuery(params);
            const url = `${API_ENDPOINTS.SALES.LIST}${query ? `?${query}` : ''}`;
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtiene los detalles de una venta específica
     * @param {number} id - ID de la venta
     * @returns {Promise<Venta>} Detalles de la venta
     */
    async getSaleById(id) {
        try {
            const response = await axiosInstance.get(`${API_ENDPOINTS.SALES.DETAIL.replace(':id', id)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Crea una nueva venta
     * @param {Object} saleData - Datos de la venta
     * @param {string} saleData.metodo_pago - Método de pago
     * @param {Array<{producto_id: number, cantidad: number, precio_unitario: number}>} saleData.productos - Lista de productos
     * @returns {Promise<Venta>} Venta creada
     */
    async createSale(saleData) {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.SALES.CREATE, saleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Elimina una venta
     * @param {number} id - ID de la venta
     * @returns {Promise<void>}
     */
    async deleteSale(id) {
        try {
            const response = await axiosInstance.delete(`${API_ENDPOINTS.SALES.DETAIL.replace(':id', id)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default salesService; 