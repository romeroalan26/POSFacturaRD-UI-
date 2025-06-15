// Página principal de Dashboard

import { useState, useEffect } from "react";
import reportsService from "../api/reports.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e42",
  "#ef4444",
  "#3b82f6",
  "#a21caf",
];

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return {
    fecha_inicio: start.toISOString().slice(0, 10),
    fecha_fin: end.toISOString().slice(0, 10),
  };
}

const Dashboard = () => {
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumenGeneral, setResumenGeneral] = useState(null);
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [ganancias, setGanancias] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          resumenData,
          ventasData,
          productosData,
          gananciasData,
          stockData,
          ventasCategoriaData,
        ] = await Promise.all([
          reportsService.getResumenGeneral(dateRange),
          reportsService.getVentasDiarias(dateRange),
          reportsService.getProductosMasVendidos(dateRange),
          reportsService.getGanancias(dateRange),
          reportsService.getProductosBajoStock(),
          reportsService.getVentasPorCategoria(dateRange),
        ]);

        setResumenGeneral(resumenData.data);
        setVentasDiarias(ventasData.data);
        setProductosMasVendidos(productosData.data);
        setGanancias(gananciasData.data);
        setProductosBajoStock(stockData.data);
        setVentasPorCategoria(ventasCategoriaData.data || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === "fecha_inicio" && value > dateRange.fecha_fin) {
      return; // No permitir fecha inicio mayor que fecha fin
    }

    if (name === "fecha_fin" && value < dateRange.fecha_inicio) {
      return; // No permitir fecha fin menor que fecha inicio
    }

    setDateRange({ ...dateRange, [name]: value });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4">
      {/* Filtro de fechas */}
      <div className="bg-white shadow rounded-lg p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center">
          <label className="font-medium w-full sm:w-auto">
            Desde:
            <input
              type="date"
              name="fecha_inicio"
              value={dateRange.fecha_inicio}
              onChange={handleDateChange}
              max={dateRange.fecha_fin}
              className="ml-2 border rounded px-2 py-1 w-full sm:w-auto"
            />
          </label>
          <label className="font-medium w-full sm:w-auto">
            Hasta:
            <input
              type="date"
              name="fecha_fin"
              value={dateRange.fecha_fin}
              onChange={handleDateChange}
              min={dateRange.fecha_inicio}
              className="ml-2 border rounded px-2 py-1 w-full sm:w-auto"
            />
          </label>
        </div>
      </div>

      {/* KPIs */}
      {resumenGeneral && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 shadow rounded-lg p-3 md:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Ingresos</p>
                <p className="text-xl md:text-2xl font-bold mt-1">
                  {formatCurrency(resumenGeneral.total_ingresos)}
                </p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 shadow rounded-lg p-3 md:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Gastos</p>
                <p className="text-xl md:text-2xl font-bold mt-1">
                  {formatCurrency(resumenGeneral.total_gastos || 0)}
                </p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 shadow rounded-lg p-3 md:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Ganancia Total</p>
                <p className="text-xl md:text-2xl font-bold mt-1">
                  {formatCurrency(resumenGeneral.ganancia_total || 0)}
                </p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow rounded-lg p-3 md:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Ventas</p>
                <p className="text-xl md:text-2xl font-bold mt-1">
                  {resumenGeneral.total_ventas}
                </p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Productos Más Vendidos */}
      <div className="bg-white shadow rounded-lg p-3 md:p-4">
        <h3 className="text-lg font-semibold mb-3 md:mb-4">
          Productos Más Vendidos
        </h3>
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Vendido
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Ventas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosMasVendidos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.nombre}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500">
                      {producto.categoria}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.total_vendido}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(producto.total_ingresos)}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.total_ventas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Productos Bajo Stock */}
      <div className="bg-white shadow rounded-lg p-3 md:p-4">
        <h3 className="text-lg font-semibold mb-3 md:mb-4">
          Productos Bajo Stock
        </h3>
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendido este Mes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosBajoStock.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.nombre}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500">
                      {producto.categoria}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.stock}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.stock_minimo}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.total_vendido_mes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Gráfico de Ganancias por Producto */}
      <div className="bg-white shadow rounded-lg p-3 md:p-4">
        <h3 className="text-lg font-semibold mb-3 md:mb-4">
          Ganancias por Producto
        </h3>
        <div className="h-64 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ganancias}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nombre_producto"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Producto: ${label}`}
                contentStyle={{ fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="ganancia_total"
                name="Ganancia Total"
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico Circular de Ventas por Categoría */}
      <div className="bg-white shadow rounded-lg p-3 md:p-4">
        <h3 className="text-lg font-semibold mb-3 md:mb-4">
          Ventas por Categoría
        </h3>
        <div className="h-64 md:h-96 flex items-center justify-center">
          {ventasPorCategoria && ventasPorCategoria.length > 0 ? (
            <Pie
              data={{
                labels: ventasPorCategoria.map((item) => item.categoria),
                datasets: [
                  {
                    data: ventasPorCategoria.map((item) =>
                      Number(item.total_ingresos)
                    ),
                    backgroundColor: COLORS,
                    borderColor: COLORS.map((color) => color + "80"),
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(
                          value
                        )} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="text-gray-500">No hay datos disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
