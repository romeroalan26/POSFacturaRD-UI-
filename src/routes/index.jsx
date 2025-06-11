import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MainLayout from "../components/Layout/MainLayout";
import authService from "../api/auth.service";
import Categorias from "../pages/Categorias";

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

// Rutas públicas
const publicRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

// Rutas privadas
const privateRoutes = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/pos",
    element: (
      <PrivateRoute>
        <div>Punto de Venta</div>
      </PrivateRoute>
    ),
  },
  {
    path: "/productos",
    element: (
      <PrivateRoute>
        <div>Productos</div>
      </PrivateRoute>
    ),
  },
  {
    path: "/categories",
    element: (
      <PrivateRoute>
        <Categorias />
      </PrivateRoute>
    ),
  },
  {
    path: "/sales",
    element: (
      <PrivateRoute>
        <div>Ventas</div>
      </PrivateRoute>
    ),
  },
];

const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);

export default router;
