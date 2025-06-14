import React, { useEffect, useState } from "react";
import salesService from "../api/sales.service";
import reportsService from "../api/reports.service";

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const METODOS_PAGO = [
  { value: "", label: "Todos", color: "gray" },
  { value: "efectivo", label: "Efectivo", color: "green" },
  { value: "tarjeta", label: "Tarjeta", color: "blue" },
  { value: "transferencia", label: "Transferencia", color: "purple" },
];

const getMetodoPagoColor = (metodo) => {
  const metodoInfo = METODOS_PAGO.find((m) => m.value === metodo);
  return metodoInfo ? metodoInfo.color : "gray";
};

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    metodo_pago: "",
  });
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' o 'grid'
  const [resumenGeneral, setResumenGeneral] = useState({
    total_ventas: 0,
    total_ingresos: 0,
    ganancia_total: 0,
    promedio_venta: 0,
  });
  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [devolucionLoading, setDevolucionLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState({
    csv: false,
    pdf: false,
  });

  useEffect(() => {
    fetchVentas();
    fetchResumenGeneral();
    // eslint-disable-next-line
  }, [page, size]);

  const fetchResumenGeneral = async () => {
    try {
      const params = {
        ...filtros,
      };
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] === null) && delete params[k]
      );
      const res = await reportsService.getResumenGeneral(params);
      if (res.data) {
        setResumenGeneral(res.data);
      }
    } catch (err) {
      console.error("Error al obtener resumen general:", err);
    }
  };

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        ...filtros,
      };
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] === null) && delete params[k]
      );
      const res = await salesService.getSales(params);
      setVentas(res.data);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      setVentas([]);
      setError("Error al cargar las ventas");
    }
    setLoading(false);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;

    // Validar que la fecha de inicio no sea mayor o igual al día actual
    if (name === "fecha_inicio") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Establecer a inicio del día
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        return; // No permitir fechas actuales o futuras
      }
    }

    setFiltros({ ...filtros, [name]: value });
  };

  const handleBuscar = () => {
    setPage(1);
    fetchVentas();
    fetchResumenGeneral();
  };

  const abrirModal = async (venta) => {
    try {
      const ventaDetalle = await salesService.getSaleById(venta.id);
      setVentaSeleccionada(ventaDetalle.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error al obtener detalles de la venta:", error);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setVentaSeleccionada(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    })
      .format(amount)
      .replace("DOP", "RD$");
  };

  const formatPercentage = (value) => {
    return value !== null && value !== undefined
      ? `${Number(value).toFixed(2)}%`
      : "N/A";
  };

  const handleDevolucion = async () => {
    if (!ventaSeleccionada) return;

    setDevolucionLoading(true);
    try {
      await salesService.deleteSale(ventaSeleccionada.id);
      setShowDevolucionModal(false);
      setShowModal(false);
      setVentaSeleccionada(null);
      fetchVentas(); // Recargar la lista de ventas
      setSuccessMessage("Venta devuelta exitosamente");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setError("Error al procesar la devolución: " + error.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setDevolucionLoading(false);
    }
  };

  const handleExportarCSV = async () => {
    setExportLoading((prev) => ({ ...prev, csv: true }));
    try {
      const params = {
        ...filtros,
      };
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] === null) && delete params[k]
      );

      const blob = await salesService.exportSalesToCSV(params);

      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento <a> temporal
      const link = document.createElement("a");
      link.href = url;

      // Generar nombre del archivo con fecha actual
      const fecha = new Date().toISOString().split("T")[0];
      link.download = `ventas_${fecha}.csv`;

      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();

      // Esperar un momento para asegurar que el archivo se haya descargado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mostrar mensaje de éxito después de la descarga
      setSuccessMessage("Archivo CSV exportado exitosamente");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setError("Error al exportar las ventas a CSV");
      setTimeout(() => setError(""), 5000);
    } finally {
      setExportLoading((prev) => ({ ...prev, csv: false }));
    }
  };

  const handleExportarPDF = async () => {
    setExportLoading((prev) => ({ ...prev, pdf: true }));
    try {
      const params = {
        ...filtros,
      };
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] === null) && delete params[k]
      );

      const blob = await salesService.exportSalesToPDF(params);

      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento <a> temporal
      const link = document.createElement("a");
      link.href = url;

      // Generar nombre del archivo con fecha actual
      const fecha = new Date().toISOString().split("T")[0];
      link.download = `ventas_${fecha}.pdf`;

      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();

      // Esperar un momento para asegurar que el archivo se haya descargado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mostrar mensaje de éxito después de la descarga
      setSuccessMessage("Archivo PDF exportado exitosamente");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setError("Error al exportar las ventas a PDF");
      setTimeout(() => setError(""), 5000);
    } finally {
      setExportLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mensajes de éxito y error */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Header con resumen */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Historial de Ventas
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona y visualiza todas tus ventas
              </p>
            </div>

            {/* Botones de exportación */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportarCSV}
                disabled={exportLoading.csv}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {exportLoading.csv ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={handleExportarPDF}
                disabled={exportLoading.pdf}
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {exportLoading.pdf ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-600">
                  Total Ventas
                </h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-500"
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
              <p className="text-2xl font-bold text-blue-700">
                {resumenGeneral.total_ventas}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-600">
                  Ingresos Totales
                </h3>
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-500"
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
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(resumenGeneral.total_ingresos)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-indigo-600">
                  Ganancias Totales
                </h3>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-indigo-500"
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
              <p className="text-2xl font-bold text-indigo-700">
                {formatCurrency(resumenGeneral.ganancia_total)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-600">
                  Promedio de Venta
                </h3>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-500"
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
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(resumenGeneral.promedio_venta)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={filtros.fecha_inicio}
                onChange={handleFiltroChange}
                max={
                  new Date(new Date().setDate(new Date().getDate() - 1))
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={filtros.fecha_fin}
                onChange={handleFiltroChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                name="metodo_pago"
                value={filtros.metodo_pago}
                onChange={handleFiltroChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm"
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBuscar}
                className="w-full bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-xs sm:text-sm"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Vista de ventas */}
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : ventas.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <svg
              className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">
              No hay ventas
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              No se encontraron ventas con los filtros seleccionados.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {venta.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(venta.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {venta.usuario?.nombre || "No especificado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize text-${getMetodoPagoColor(
                            venta.metodo_pago
                          )}-800 bg-${getMetodoPagoColor(
                            venta.metodo_pago
                          )}-100`}
                        >
                          {venta.metodo_pago}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(venta.total_final)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => abrirModal(venta)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ventas.map((venta) => (
              <div
                key={venta.id}
                className="bg-white rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                      Venta #{venta.id}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {formatearFecha(venta.fecha)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize text-${getMetodoPagoColor(
                      venta.metodo_pago
                    )}-800 bg-${getMetodoPagoColor(venta.metodo_pago)}-100`}
                  >
                    {venta.metodo_pago}
                  </span>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">
                      {formatCurrency(venta.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">ITBIS</span>
                    <span className="text-gray-900">
                      {formatCurrency(venta.itbis_total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(venta.total_final)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-indigo-500">Ganancia</span>
                    <span className="font-medium text-indigo-600">
                      {formatCurrency(venta.ganancia_total_venta)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-purple-500">Margen</span>
                    <span className="font-medium text-purple-600">
                      {formatPercentage(venta.margen_promedio)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <button
                    onClick={() => abrirModal(venta)}
                    className="w-full text-center text-xs sm:text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        <div className="mt-4 sm:mt-6 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">{(page - 1) * size + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(page * size, totalElements)}
                </span>{" "}
                de <span className="font-medium">{totalElements}</span> ventas
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showModal && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    Detalles de la Venta #{ventaSeleccionada.id}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    {formatearFecha(ventaSeleccionada.fecha)}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm">
                    <span className="text-gray-600">Vendedor: </span>
                    <span className="font-medium text-blue-600">
                      {ventaSeleccionada.usuario?.nombre || "No especificado"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowDevolucionModal(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Devolver Venta
                  </button>
                  <button
                    onClick={cerrarModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Resumen de la venta */}
              <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500">Subtotal</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                    {formatCurrency(ventaSeleccionada.subtotal)}
                  </p>
                </div>
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500">ITBIS</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                    {formatCurrency(ventaSeleccionada.itbis_total)}
                  </p>
                </div>
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500">Total</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                    {formatCurrency(ventaSeleccionada.total_final)}
                  </p>
                </div>
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Método de Pago
                  </p>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize text-${getMetodoPagoColor(
                        ventaSeleccionada.metodo_pago
                      )}-800 bg-${getMetodoPagoColor(
                        ventaSeleccionada.metodo_pago
                      )}-100`}
                    >
                      {ventaSeleccionada.metodo_pago}
                    </span>
                  </p>
                </div>
              </div>

              {/* Información de ganancias */}
              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-indigo-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-indigo-600">
                    Ganancia Total
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-indigo-900">
                    {formatCurrency(ventaSeleccionada.ganancia_total_venta)}
                  </p>
                </div>
                <div className="bg-purple-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-purple-600">
                    Margen Promedio
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-purple-900">
                    {formatPercentage(ventaSeleccionada.margen_promedio)}
                  </p>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="mt-4 sm:mt-6">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                  Productos vendidos
                </h4>
                <div className="mt-2 sm:mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio Unit.
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ventaSeleccionada.productos.map((producto, index) => (
                        <tr key={index}>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {producto.nombre_producto}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {producto.cantidad}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {formatCurrency(producto.precio_unitario)}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {formatCurrency(
                              producto.cantidad * producto.precio_unitario
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de devolución */}
      {showDevolucionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-3 sm:p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">
                Confirmar Devolución
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                ¿Estás seguro de que deseas devolver esta venta? Esta acción no
                se puede deshacer.
              </p>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDevolucionModal(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDevolucion}
                  disabled={devolucionLoading}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-transparent rounded-md text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {devolucionLoading ? "Procesando..." : "Confirmar Devolución"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
