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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
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
    { id: 1, nombre: "admin", color: "purple" },
    { id: 2, nombre: "cajero", color: "blue" },
    { id: 3, nombre: "inventario", color: "green" },
    { id: 4, nombre: "invitado", color: "gray" },
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

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await usersService.deleteUser(userToDelete.id);
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
      await loadUsers();
      setSuccessMessage(
        `Usuario ${userToDelete.nombre} eliminado exitosamente`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Error al eliminar el usuario");
      console.error(err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.role_id === parseInt(roleFilter);
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Administración de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los usuarios y sus permisos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowNewUserForm(true)}
          className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todos los roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nombre.charAt(0).toUpperCase() + role.nombre.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {user.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role_id}
                      onChange={(e) =>
                        handleRoleChange(user.id, parseInt(e.target.value))
                      }
                      className={`text-sm rounded-full px-3 py-1 font-medium ${
                        roles.find((r) => r.id === user.role_id)?.color ===
                        "purple"
                          ? "bg-purple-100 text-purple-800"
                          : roles.find((r) => r.id === user.role_id)?.color ===
                            "blue"
                          ? "bg-blue-100 text-blue-800"
                          : roles.find((r) => r.id === user.role_id)?.color ===
                            "green"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      } border-0 focus:ring-2 focus:ring-indigo-500`}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.nombre.charAt(0).toUpperCase() +
                            role.nombre.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewPermissions(user.id)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                        title="Ver Permisos"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors duration-200"
                        title="Reiniciar Contraseña"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                        title="Eliminar Usuario"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
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
              <div className="mt-2 px-2 sm:px-4 py-3 max-h-[60vh] overflow-y-auto">
                {Object.entries(permissions).map(([resource, actions]) => (
                  <div key={resource} className="mb-4">
                    <h4 className="font-medium capitalize text-sm sm:text-base">
                      {resource}
                    </h4>
                    <div className="ml-2 sm:ml-4">
                      {Object.entries(actions).map(([action, value]) => (
                        <div key={action} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            disabled
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-xs sm:text-sm text-gray-700 capitalize">
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
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative text-xs sm:text-sm">
                  <span className="block sm:inline">{passwordError}</span>
                </div>
              )}
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
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
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-xs sm:text-sm">
                <p className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  El usuario será creado con el rol de cajero por defecto.
                  Podrás cambiar su rol posteriormente desde la lista de
                  usuarios.
                </p>
              </div>
              <form onSubmit={handleNewUserSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newUser.nombre}
                    onChange={(e) =>
                      setNewUser({ ...newUser, nombre: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewUserForm(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
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

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirmModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">
                  Confirmar Eliminación
                </h3>
                <div className="mt-2 px-2 sm:px-4 py-3">
                  <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                    ¿Estás seguro que deseas eliminar al usuario{" "}
                    <span className="font-semibold">{userToDelete.nombre}</span>
                    ?
                  </p>
                  <p className="text-xs sm:text-sm text-red-500 mb-4">
                    Esta acción no se puede deshacer y eliminará permanentemente
                    el usuario y todos sus datos asociados.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setUserToDelete(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Eliminar Usuario
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
