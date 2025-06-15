import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import MainLayout from "./components/Layout/MainLayout";
import PuntoVenta from "./pages/PuntoVenta";
import Categorias from "./pages/Categorias";
import Ventas from "./pages/Ventas";
import AdminUsers from "./pages/AdminUsers";
import Gastos from "./pages/Gastos";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (
    !user ||
    user.user?.role === "cajero" ||
    user.user?.role === "inventario" ||
    user.user?.role === "invitado"
  ) {
    return <Navigate to="/dashboard" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const SalesRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (
    !user ||
    user.user?.role === "inventario" ||
    user.user?.role === "invitado"
  ) {
    return <Navigate to="/dashboard" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || user.user?.role !== "invitado") {
    return <Navigate to="/dashboard" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <SalesRoute>
              <PuntoVenta />
            </SalesRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categorias />
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <SalesRoute>
              <Ventas />
            </SalesRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/gastos"
          element={
            <AdminRoute>
              <Gastos />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
