import React, { useState, useEffect } from "react";
import usersService from "../api/users.service";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showRoleConfirmModal, setShowRoleConfirmModal] = useState(false);
  const [roleChangeData, setRoleChangeData] = useState({
    userId: null,
    newRoleId: null,
    userName: "",
    newRoleName: "",
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: null,
    newPassword: "",
    confirmPassword: "",
  });
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    nombre: "",
  });

  const roles = [
    { id: 1, nombre: "admin" },
    { id: 2, nombre: "cajero" },
    { id: 3, nombre: "inventario" },
    { id: 4, nombre: "invitado" },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    const user = users.find((u) => u.id === userId);
    const newRole = roles.find((r) => r.id === roleId);

    setRoleChangeData({
      userId,
      newRoleId: roleId,
      userName: user.nombre,
      newRoleName: newRole.nombre,
    });
    setShowRoleConfirmModal(true);
  };

  const confirmRoleChange = async () => {
    try {
      await usersService.updateUserRole(
        roleChangeData.userId,
        roleChangeData.newRoleId
      );
      await loadUsers();
      setShowRoleConfirmModal(false);
      setSuccessMessage(
        `Rol actualizado exitosamente para ${roleChangeData.userName}`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Error al actualizar el rol");
      console.error(err);
    }
  };

  const handleViewPermissions = async (userId) => {
    try {
      const data = await usersService.getUserPermissions(userId);
      setPermissions(data.permisos);
      setSelectedUser(userId);
      setShowPermissions(true);
    } catch (err) {
      setError("Error al cargar los permisos");
      console.error(err);
    }
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await usersService.registerUser(newUser);
      setShowNewUserForm(false);
      setNewUser({ email: "", password: "", nombre: "" });
      await loadUsers();
    } catch (err) {
      setError("Error al crear el usuario");
      console.error(err);
    }
  };

  const handleResetPassword = async (userId) => {
    setResetPasswordData({
      userId,
      newPassword: "",
      confirmPassword: "",
    });
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    if (resetPasswordData.newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await usersService.resetUserPassword(
        resetPasswordData.userId,
        resetPasswordData.newPassword
      );
      setShowResetPasswordModal(false);
      setResetPasswordData({
        userId: null,
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError(null);
      setSuccessMessage("Contraseña actualizada exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setPasswordError("Error al reiniciar la contraseña");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <div className="flex justify-end items-center mb-4 sm:mb-6">
        <button
          onClick={() => setShowNewUserForm(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-indigo-700 text-sm sm:text-base"
        >
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
          {successMessage}
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                    {user.nombre}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <select
                      value={user.role_id}
                      onChange={(e) =>
                        handleRoleChange(user.id, parseInt(e.target.value))
                      }
                      className="mt-1 block w-full pl-2 sm:pl-3 pr-8 sm:pr-10 py-1 sm:py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => handleViewPermissions(user.id)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Ver Permisos
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Reiniciar Contraseña
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Permisos */}
      {showPermissions && permissions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Permisos del Usuario
              </h3>
              <div className="mt-2 px-4 sm:px-7 py-3 max-h-[60vh] overflow-y-auto">
                {Object.entries(permissions).map(([resource, actions]) => (
                  <div key={resource} className="mb-4">
                    <h4 className="font-medium capitalize">{resource}</h4>
                    <div className="ml-4">
                      {Object.entries(actions).map(([action, value]) => (
                        <div key={action} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            disabled
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700 capitalize">
                            {action}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setShowPermissions(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reinicio de Contraseña */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Reiniciar Contraseña
              </h3>
              {passwordError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative text-sm">
                  <span className="block sm:inline">{passwordError}</span>
                </div>
              )}
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => {
                      setResetPasswordData({
                        ...resetPasswordData,
                        newPassword: e.target.value,
                      });
                      setPasswordError(null);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => {
                      setResetPasswordData({
                        ...resetPasswordData,
                        confirmPassword: e.target.value,
                      });
                      setPasswordError(null);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setPasswordError(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Reiniciar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Usuario */}
      {showNewUserForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Nuevo Usuario
              </h3>
              <form onSubmit={handleNewUserSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newUser.nombre}
                    onChange={(e) =>
                      setNewUser({ ...newUser, nombre: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0">
                  <button
                    type="button"
                    onClick={() => setShowNewUserForm(false)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Crear Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Cambio de Rol */}
      {showRoleConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Confirmar Cambio de Rol
              </h3>
              <div className="mt-2 px-4 sm:px-7 py-3">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  ¿Estás seguro que deseas cambiar el rol de{" "}
                  <span className="font-semibold">
                    {roleChangeData.userName}
                  </span>{" "}
                  a{" "}
                  <span className="font-semibold capitalize">
                    {roleChangeData.newRoleName}
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Este cambio afectará los permisos y accesos del usuario en el
                  sistema.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setShowRoleConfirmModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRoleChange}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
