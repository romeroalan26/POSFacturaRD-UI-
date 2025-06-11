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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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
  const [kpi, setKpi] = useState(null);
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [ventasPorHora, setVentasPorHora] = useState([]);
  const [tendenciaVentas, setTendenciaVentas] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [bajoStock, setBajoStock] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          kpiData,
          tendenciaData,
          metodosData,
          ventasHoraData,
          topProductosData,
          bajoStockData,
        ] = await Promise.all([
          reportsService.getResumenGeneral(dateRange),
          reportsService.getTendenciaVentas(dateRange),
          reportsService.getResumenMetodoPago(dateRange),
          reportsService.getVentasPorHora(dateRange),
          reportsService.getProductosMasVendidos(dateRange),
          reportsService.getProductosBajoStock(dateRange),
        ]);

        setKpi(kpiData.data);
        setTendenciaVentas(
          tendenciaData.data.map((item) => ({
            fecha: item.periodo,
            monto: parseFloat(item.total_monto),
          }))
        );
        setMetodosPago(
          metodosData.data.map((item) => ({
            metodo_pago: item.metodo_pago,
            monto: parseFloat(item.total_monto),
          }))
        );
        setVentasPorHora(
          ventasHoraData.data.map((item) => ({
            hora: item.hora,
            monto: parseFloat(item.total_monto),
          }))
        );
        setTopProductos(topProductosData.data);
        setBajoStock(bajoStockData.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Filtro de fechas */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
          <label className="font-medium w-full sm:w-auto">
            Desde:
            <input
              type="date"
              name="fecha_inicio"
              value={dateRange.fecha_inicio}
              onChange={handleDateChange}
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
              className="ml-2 border rounded px-2 py-1 w-full sm:w-auto"
            />
          </label>
        </div>
      </div>

      {/* KPIs */}
      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow rounded-lg p-3 sm:p-4 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Ventas</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {kpi.total_ventas}
                </p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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

          <div className="bg-gradient-to-br from-green-500 to-green-600 shadow rounded-lg p-3 sm:p-4 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Ingresos</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  RD${" "}
                  {Number(kpi.total_ingresos).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow rounded-lg p-3 sm:p-4 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Promedio por Venta</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  RD${" "}
                  {Number(kpi.promedio_venta).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 shadow rounded-lg p-3 sm:p-4 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Productos Vendidos</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {kpi.total_productos_vendidos || 0}
                </p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Gráfico de líneas: Tendencia de Ventas */}
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Tendencia de Ventas
          </h2>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={tendenciaVentas}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(d) => {
                    const date = new Date(d);
                    return `${date.getDate().toString().padStart(2, "0")}/${(
                      date.getMonth() + 1
                    )
                      .toString()
                      .padStart(2, "0")}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `RD$ ${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`,
                    "Monto",
                  ]}
                  labelFormatter={(d) => {
                    const date = new Date(d);
                    return `Día: ${date
                      .getDate()
                      .toString()
                      .padStart(2, "0")}/${(date.getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}`;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="monto"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico circular: Métodos de Pago */}
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Métodos de Pago
          </h2>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metodosPago}
                  dataKey="monto"
                  nameKey="metodo_pago"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                >
                  {metodosPago.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `RD$ ${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`,
                    "Monto",
                  ]}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{
                    paddingLeft: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {metodosPago.map((metodo, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900 capitalize">
                    {metodo.metodo_pago}
                  </span>
                </div>
                <div className="mt-2">
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    RD${" "}
                    {Number(metodo.monto).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(
                      (metodo.monto /
                        metodosPago.reduce((a, b) => a + b.monto, 0)) *
                      100
                    ).toFixed(1)}
                    % del total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de barras: Ventas por Hora */}
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Ventas por Hora
          </h2>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ventasPorHora}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `RD$ ${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`,
                    "Monto",
                  ]}
                />
                <Bar dataKey="monto" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Productos */}
        <div className="bg-white shadow rounded-lg p-3 sm:p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Productos Más Vendidos
          </h2>
          <div className="h-[300px] sm:h-[400px] overflow-y-auto">
            <div className="space-y-3 sm:space-y-4">
              {topProductos.map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-500">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {producto.nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {producto.categoria_nombre}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm text-gray-500">Unidades:</span>
                      <span className="font-medium text-gray-900">
                        {producto.total_vendido}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm text-gray-500">Ventas:</span>
                      <span className="font-medium text-gray-900">
                        {producto.total_ventas}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm text-gray-500">Ingresos:</span>
                      <span className="font-medium text-gray-900">
                        RD${" "}
                        {Number(producto.total_ingresos).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Productos con Bajo Stock */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Productos con Bajo Stock
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Mínimo
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bajoStock.map((producto, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {producto.nombre}
                  </td>
                  <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {producto.stock}
                  </td>
                  <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {producto.stock_minimo}
                  </td>
                  <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {producto.categoria_nombre}
                  </td>
                  <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        producto.stock <= 0
                          ? "bg-red-100 text-red-800"
                          : producto.stock < producto.stock_minimo
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {producto.stock <= 0
                        ? "Sin Stock"
                        : producto.stock < producto.stock_minimo
                        ? "Stock Bajo"
                        : "Stock Normal"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
