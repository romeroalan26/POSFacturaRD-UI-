import axiosInstance from './axios.config';

const usersService = {
    // Obtener lista de usuarios
    async getUsers() {
        try {
            const response = await axiosInstance.get('/api/usuarios');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar rol de usuario
    async updateUserRole(userId, roleId) {
        try {
            const response = await axiosInstance.put(`/api/usuarios/${userId}/role`, {
                role_id: roleId
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Obtener permisos de usuario
    async getUserPermissions(userId) {
        try {
            const response = await axiosInstance.get(`/api/usuarios/${userId}/permissions`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Registrar nuevo usuario
    async registerUser(userData) {
        try {
            const response = await axiosInstance.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Reiniciar contraseña de usuario
    async resetUserPassword(userId, newPassword) {
        try {
            const response = await axiosInstance.put(`/api/usuarios/${userId}/reset-password`, {
                password: newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default usersService; 