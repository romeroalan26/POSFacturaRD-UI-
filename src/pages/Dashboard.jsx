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
        const [kpiData, tendenciaData, metodosData] = await Promise.all([
          reportsService.getResumenGeneral(dateRange),
          reportsService.getTendenciaVentas(dateRange),
          reportsService.getResumenMetodoPago(dateRange),
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
    <div className="space-y-6 p-4">
      {/* Filtro de fechas */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm sm:text-base">
              Total Ventas
            </span>
            <span className="text-xl sm:text-2xl font-bold text-indigo-600 mt-1">
              {kpi.total_ventas}
            </span>
          </div>
          <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm sm:text-base">
              Total Ingresos
            </span>
            <span className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
              RD${" "}
              {Number(kpi.total_ingresos).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm sm:text-base">
              Promedio por Venta
            </span>
            <span className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
              RD${" "}
              {Number(kpi.promedio_venta).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de líneas: Tendencia de Ventas */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Tendencia de Ventas
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={tendenciaVentas}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
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
                <Line
                  type="monotone"
                  dataKey="monto"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico circular: Métodos de Pago */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Métodos de Pago
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metodosPago}
                  dataKey="monto"
                  nameKey="metodo_pago"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#000"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        className="text-sm"
                      >
                        {`${metodosPago[index].metodo_pago} (${(
                          (value /
                            metodosPago.reduce((a, b) => a + b.monto, 0)) *
                          100
                        ).toFixed(1)}%)`}
                      </text>
                    );
                  }}
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Productos con Bajo Stock */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Productos con Bajo Stock
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bajoStock.map((producto, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {producto.nombre}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {producto.stock}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {producto.categoria_nombre}
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
