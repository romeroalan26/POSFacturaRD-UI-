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
      setLoading(true);
      setError(null);
      try {
        const [
          kpiRes,
          diariasRes,
          horaRes,
          tendenciaRes,
          pagoRes,
          topProdRes,
          bajoStockRes,
        ] = await Promise.all([
          reportsService.getResumenGeneral(dateRange),
          reportsService.getVentasDiarias({ ...dateRange, page: 1, size: 10 }),
          reportsService.getVentasPorHora(dateRange),
          reportsService.getTendenciaVentas({ ...dateRange, intervalo: "dia" }),
          reportsService.getResumenMetodoPago({
            ...dateRange,
            page: 1,
            size: 10,
          }),
          reportsService.getProductosMasVendidos({
            ...dateRange,
            page: 1,
            size: 5,
          }),
          reportsService.getProductosBajoStock({
            limite_stock: 10,
            page: 1,
            size: 5,
          }),
        ]);
        setKpi(kpiRes.data || null);
        setVentasDiarias(diariasRes.data || []);
        setVentasPorHora(horaRes.data || []);
        setTendenciaVentas(tendenciaRes.data || []);
        setMetodosPago(pagoRes.data || []);
        setTopProductos(topProdRes.data || []);
        setBajoStock(bajoStockRes.data || []);
      } catch (err) {
        setError("Error al cargar los datos del dashboard");
        console.error(err);
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
    <div className="space-y-8">
      {/* Filtro de fechas */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <label className="font-medium">
          Desde:
          <input
            type="date"
            name="fecha_inicio"
            value={dateRange.fecha_inicio}
            onChange={handleDateChange}
            className="ml-2 border rounded px-2 py-1"
          />
        </label>
        <label className="font-medium">
          Hasta:
          <input
            type="date"
            name="fecha_fin"
            value={dateRange.fecha_fin}
            onChange={handleDateChange}
            className="ml-2 border rounded px-2 py-1"
          />
        </label>
      </div>

      {/* KPIs */}
      {kpi && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
            <span className="text-gray-500">Total Ventas</span>
            <span className="text-2xl font-bold text-indigo-600">
              {kpi.total_ventas}
            </span>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
            <span className="text-gray-500">Total Ingresos</span>
            <span className="text-2xl font-bold text-green-600">
              RD${" "}
              {Number(kpi.total_ingresos).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
            <span className="text-gray-500">Promedio por Venta</span>
            <span className="text-2xl font-bold text-blue-600">
              RD${" "}
              {Number(kpi.promedio_venta).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}

      {/* Gráfico de barras: Ventas Diarias */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Ventas Diarias
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={ventasDiarias}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="dia"
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
              formatter={(value, name) => {
                if (name === "total_monto") {
                  return [
                    `RD$ ${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`,
                    "Monto Total",
                  ];
                }
                if (name === "total_ventas") {
                  return [value, "Cantidad de Ventas"];
                }
                return [value, name];
              }}
              labelFormatter={(d) => {
                const date = new Date(d);
                return `Día: ${date.getDate().toString().padStart(2, "0")}/${(
                  date.getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")}`;
              }}
            />
            <Bar
              dataKey="total_ventas"
              fill="#6366f1"
              name="Cantidad de Ventas"
            />
            <Bar dataKey="total_monto" fill="#10b981" name="Monto Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de líneas: Ventas por Hora */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Ventas por Hora
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={ventasPorHora}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total_monto"
              stroke="#10b981"
              name="Ingresos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de área: Tendencia de Ventas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Tendencia de Ventas
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={tendenciaVentas}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="total_monto"
              stroke="#3b82f6"
              fill="#93c5fd"
              name="Ingresos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico circular: Resumen por Método de Pago */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Resumen por Método de Pago
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={metodosPago}
              dataKey="total_monto"
              nameKey="metodo_pago"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#6366f1"
              label={(entry) => entry.metodo_pago}
            >
              {metodosPago.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla: Productos más vendidos */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Productos Más Vendidos
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Vendida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Ingresos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProductos.map((prod) => (
                <tr key={prod.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.total_vendido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RD${" "}
                    {Number(prod.total_ingresos).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla: Productos con Bajo Stock */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Productos con Bajo Stock
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendidos este mes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bajoStock.map((prod) => (
                <tr
                  key={prod.id}
                  className={Number(prod.stock) <= 10 ? "bg-red-100" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RD${" "}
                    {Number(prod.precio).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prod.total_vendido_mes}
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
