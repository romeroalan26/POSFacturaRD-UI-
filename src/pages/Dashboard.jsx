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
  AreaChart,
  Area,
  Pie,
  Cell,
} from "recharts";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Pie as ReactPie } from "react-chartjs-2";
import Accordion from "../components/Accordion";

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
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [ganancias, setGanancias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Ajustar las fechas para incluir todo el día
        const adjustedDateRange = {
          fecha_inicio: dateRange.fecha_inicio,
          fecha_fin: dateRange.fecha_fin,
        };

        // Ajustar la fecha final para incluir todo el día
        if (adjustedDateRange.fecha_fin) {
          const endDate = new Date(adjustedDateRange.fecha_fin);
          endDate.setHours(23, 59, 59, 999);
          adjustedDateRange.fecha_fin = endDate.toISOString().split("T")[0];
        }

        const [resumenData, productosData, gananciasData, stockData] =
          await Promise.all([
            reportsService.getResumenGeneral(adjustedDateRange),
            reportsService.getProductosMasVendidos(adjustedDateRange),
            reportsService.getGanancias(adjustedDateRange),
            reportsService.getProductosBajoStock(),
          ]);

        setResumenGeneral(resumenData.data);
        setProductosMasVendidos(productosData.data);
        setGanancias(gananciasData.data);
        setProductosBajoStock(stockData.data);
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
    })
      .format(amount)
      .replace("DOP", "RD$");
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
        <Accordion title="Resumen General" defaultOpen={true}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Ingresos Totales */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-green-800">
                    Ingresos Totales
                  </h3>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(resumenGeneral.total_ingresos)}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-green-600 font-medium">
                    Total de ventas: {resumenGeneral.total_ventas}
                  </span>
                </div>
              </div>

              {/* Gastos Totales */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 shadow-sm border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-red-800">
                    Gastos Totales
                  </h3>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-red-600"
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
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(resumenGeneral.total_gastos)}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-red-600 font-medium">
                    Días con gastos: {resumenGeneral.dias_con_ventas}
                  </span>
                </div>
              </div>

              {/* Ganancia Total */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-indigo-800">
                    Ganancia Total
                  </h3>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-indigo-600"
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
                <p className="text-2xl font-bold text-indigo-900">
                  {formatCurrency(resumenGeneral.ganancia_total)}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-indigo-600 font-medium">
                    Margen:{" "}
                    {(
                      (resumenGeneral.ganancia_total /
                        resumenGeneral.total_ingresos) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>

              {/* Promedio de Venta */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-purple-800">
                    Promedio de Venta
                  </h3>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-purple-600"
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
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(resumenGeneral.promedio_venta)}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-purple-600 font-medium">
                    Productos vendidos:{" "}
                    {resumenGeneral.total_productos_vendidos}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Accordion>
      )}

      {/* Productos Más Vendidos */}
      <Accordion title="Productos Más Vendidos">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Producto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoría
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unidades Vendidas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ingresos
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ganancia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosMasVendidos.map((producto, index) => (
                  <tr
                    key={producto.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {producto.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${
                                (producto.total_ventas /
                                  productosMasVendidos[0].total_ventas) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {producto.total_ventas}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(producto.total_ingresos)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${
                            producto.ganancia_total >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(producto.ganancia_total)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({producto.margen_ganancia}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productosMasVendidos.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No hay datos disponibles
              </h3>
              <p className="text-gray-500">
                No se encontraron productos vendidos en el período seleccionado.
              </p>
            </div>
          )}
        </div>
      </Accordion>

      {/* Productos Bajo Stock */}
      <Accordion title="Productos Bajo Stock">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productosBajoStock.map((producto) => {
            const estadoStock =
              producto.stock <= producto.stock_minimo ? "crítico" : "bajo";

            return (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-gray-900">
                      {producto.nombre}
                    </h3>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        estadoStock === "crítico"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {estadoStock.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Stock Actual: {producto.stock}
                    </span>
                    <span className="text-gray-600">
                      Mínimo: {producto.stock_minimo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {productosBajoStock.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No hay productos con bajo stock</p>
          </div>
        )}
      </Accordion>

      {/* Gráfico de Ganancias por Producto */}
      <Accordion title="Ganancias por Producto">
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
      </Accordion>
    </div>
  );
};

export default Dashboard;
