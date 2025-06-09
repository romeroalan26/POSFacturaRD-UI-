import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Manejar errores específicos
            switch (error.response.status) {
                case 401:
                    // Token expirado o inválido
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    // No tiene permisos
                    console.error('No tiene permisos para acceder a este recurso');
                    break;
                case 404:
                    // Recurso no encontrado
                    console.error('El recurso solicitado no existe');
                    break;
                case 500:
                    // Error del servidor
                    console.error('Error interno del servidor');
                    break;
                default:
                    console.error('Error en la petición:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 