import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../api/auth.service";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <h1 className="text-white text-xl font-bold">POS FacturaRD</h1>
        </div>
        <nav className="mt-5 px-2">
          <Link
            to="/dashboard"
            className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/pos"
            className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white hover:bg-gray-700"
          >
            Punto de Venta
          </Link>
          <Link
            to="/productos"
            className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white hover:bg-gray-700"
          >
            Productos
          </Link>
          <Link
            to="/categories"
            className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white hover:bg-gray-700"
          >
            Categorías
          </Link>
          <Link
            to="/sales"
            className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white hover:bg-gray-700"
          >
            Ventas
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div
        className={`${
          isSidebarOpen ? "ml-64" : "ml-0"
        } transition-all duration-300 ease-in-out`}
      >
        {/* Top navigation */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">
                  {currentUser?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
