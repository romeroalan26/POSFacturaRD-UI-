import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../api/auth.service";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  // Función para obtener el título de la página actual
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/pos":
        return "Punto de Venta";
      case "/productos":
        return "Productos";
      case "/categories":
        return "Categorías";
      case "/sales":
        return "Ventas";
      case "/admin/users":
        return "Administración de Usuarios";
      default:
        return "Coro 69";
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    // Actualizar la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-DO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">CORO 69</h1>
        </div>

        {/* Botón de collapse para desktop */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 hidden lg:flex items-center justify-center w-6 h-6 bg-gray-800 rounded-full shadow-md border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
        >
          <svg
            className={`w-4 h-4 transform ${isSidebarOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {currentUser?.user?.nombre?.charAt(0) ||
                    currentUser?.username?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser?.user?.nombre || currentUser?.username}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {currentUser?.user?.role || "Usuario"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">
          <Link
            to="/dashboard"
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActiveRoute("/dashboard")
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <svg
              className={`mr-3 h-5 w-5 ${
                isActiveRoute("/dashboard")
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-300"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>

          <Link
            to="/pos"
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActiveRoute("/pos")
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <svg
              className={`mr-3 h-5 w-5 ${
                isActiveRoute("/pos")
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-300"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Punto de Venta
          </Link>

          <Link
            to="/productos"
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActiveRoute("/productos")
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <svg
              className={`mr-3 h-5 w-5 ${
                isActiveRoute("/productos")
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-300"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Productos
          </Link>

          <Link
            to="/categories"
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActiveRoute("/categories")
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <svg
              className={`mr-3 h-5 w-5 ${
                isActiveRoute("/categories")
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-300"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Categorías
          </Link>

          <Link
            to="/sales"
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActiveRoute("/sales")
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <svg
              className={`mr-3 h-5 w-5 ${
                isActiveRoute("/sales")
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-300"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Ventas
          </Link>

          {currentUser?.user?.role === "admin" && (
            <Link
              to="/admin/users"
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActiveRoute("/admin/users")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <svg
                className={`mr-3 h-5 w-5 ${
                  isActiveRoute("/admin/users")
                    ? "text-white"
                    : "text-gray-400 group-hover:text-gray-300"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Administración
            </Link>
          )}
        </nav>

        {/* Footer del Sidebar */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="text-sm text-gray-400">
              <p>{formatDate(currentTime)}</p>
              <p className="font-medium text-gray-300">
                {formatTime(currentTime)}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                {/* Botón de hamburguesa para móvil */}
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none lg:hidden"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <h2 className="ml-4 text-xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h2>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
