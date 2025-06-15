import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MainLayout from "../components/Layout/MainLayout";
import authService from "../api/auth.service";
import Categorias from "../pages/Categorias";
import AdminUsers from "../pages/AdminUsers";
import PuntoVenta from "../pages/PuntoVenta";
import Gastos from "../pages/Gastos";
import { useAuth } from "../context/AuthContext";

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para proteger rutas de administrador
const AdminRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  if (!user || user.user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Rutas públicas
const publicRoutes = [
  {
    path: "/login",
    element: (
      <PrivateRoute>
        <Login />
      </PrivateRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PrivateRoute>
        <Register />
      </PrivateRoute>
    ),
  },
];

// Rutas privadas
const privateRoutes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
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
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <AdminUsers />
      </AdminRoute>
    ),
  },
  {
    path: "/punto-venta",
    element: (
      <PrivateRoute>
        <PuntoVenta />
      </PrivateRoute>
    ),
  },
  {
    path: "/gastos",
    element: (
      <PrivateRoute>
        <MainLayout>
          <Gastos />
        </MainLayout>
      </PrivateRoute>
    ),
  },
];

const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);

export default router;
