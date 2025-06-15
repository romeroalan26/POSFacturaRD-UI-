import React, { useState, useEffect } from "react";
import expensesService from "../api/expenses.service";

const Gastos = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    monto: "",
    descripcion: "",
    categoria_id: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const itemsPerPage = 10;
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
    categoria_id: "",
  });
  const [exportLoading, setExportLoading] = useState({
    csv: false,
    pdf: false,
  });
  const [resumenGeneral, setResumenGeneral] = useState({
    kpis_generales: {
      total_gastos: 0,
      total_monto: 0,
      promedio_gasto: 0,
      gasto_maximo: 0,
      gasto_minimo: 0,
      variacion_mensual: null,
    },
    gastos_por_categoria: [],
    gastos_por_mes: [],
    gastos_por_usuario: [],
    tendencia_gastos: [],
    periodo: {
      fecha_inicio: null,
      fecha_fin: null,
      categoria_id: null,
    },
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchResumenGeneral();
  }, [currentPage]);

  const fetchResumenGeneral = async () => {
    try {
      const params = {
        ...filtros,
      };
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] === null) && delete params[k]
      );
      const res = await expensesService.getResumenGeneral(params);
      if (res.data) {
        setResumenGeneral(res.data);
      }
    } catch (err) {
      console.error("Error al obtener resumen general:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: itemsPerPage,
        ...filtros,
      };
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] === null) && delete params[k]
      );
      const response = await expensesService.getExpenses(params);

      if (response && response.data) {
        setExpenses(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalElements || 0);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      setError("Error al cargar los gastos");
      console.error("Error al cargar gastos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await expensesService.getExpenseCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError("Error al cargar las categorías");
      console.error("Error al cargar categorías:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (editingExpense) {
        await expensesService.updateExpense(editingExpense.id, formData);
      } else {
        await expensesService.createExpense(formData);
      }
      setShowModal(false);
      setEditingExpense(null);
      setFormData({
        monto: "",
        descripcion: "",
        categoria_id: "",
        fecha: new Date().toISOString().split("T")[0],
      });
      await fetchExpenses();
    } catch (err) {
      console.error("Error al guardar gasto:", err);
      if (err.response?.data?.errores) {
        setError(err.response.data.errores[0]);
      } else if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError("Error al guardar el gasto. Por favor, intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      monto: expense.monto,
      descripcion: expense.descripcion,
      categoria_id: expense.categoria_id,
      fecha: expense.fecha.split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      try {
        await expensesService.deleteExpense(id);
        fetchExpenses();
      } catch (err) {
        if (err.response?.data?.errores) {
          setError(err.response.data.errores[0]);
        } else {
          setError("Error al eliminar el gasto");
        }
        console.error(err);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
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

    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = () => {
    setCurrentPage(1); // Reiniciamos a la primera página
    fetchExpenses(); // Buscamos con los filtros actuales
  };

  const handleExport = async (type) => {
    try {
      setExportLoading((prev) => ({ ...prev, [type]: true }));
      const params = {
        ...filtros,
      };
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] === null) && delete params[k]
      );

      let response;
      if (type === "csv") {
        response = await expensesService.exportToCSV(params);
      } else {
        response = await expensesService.exportToPDF(params);
      }

      // Crear un blob con la respuesta
      const blob = new Blob([response], {
        type: type === "csv" ? "text/csv" : "application/pdf",
      });

      // Crear un enlace temporal y hacer clic en él para descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `gastos_${new Date().toISOString().split("T")[0]}.${type}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error al exportar a ${type}:`, err);
      setError(`Error al exportar a ${type.toUpperCase()}`);
    } finally {
      setExportLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con resumen */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Historial de Gastos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona y visualiza todos tus gastos
              </p>
            </div>

            {/* Botones de exportación */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleExport("csv")}
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
                onClick={() => handleExport("pdf")}
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
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          {/* Resumen general */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-600">
                  Total Gastos
                </h3>
                <div className="p-2 bg-red-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-red-500"
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
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(resumenGeneral.kpis_generales.total_monto)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {resumenGeneral.kpis_generales.total_gastos} gastos registrados
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-600">
                  Promedio por Gasto
                </h3>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-orange-500"
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
              <p className="text-2xl font-bold text-orange-700">
                {formatCurrency(resumenGeneral.kpis_generales.promedio_gasto)}
              </p>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>
                  Mín:{" "}
                  {formatCurrency(resumenGeneral.kpis_generales.gasto_minimo)}
                </span>
                <span>
                  Máx:{" "}
                  {formatCurrency(resumenGeneral.kpis_generales.gasto_maximo)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-600">
                  Gastos del Mes
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(resumenGeneral.gastos_por_mes[0]?.total || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {resumenGeneral.gastos_por_mes[0]?.cantidad || 0} gastos este
                mes
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-600">
                  Categorías Activas
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {resumenGeneral.gastos_por_categoria.length}
              </p>
              <div className="text-sm text-gray-500 mt-1">
                {resumenGeneral.gastos_por_categoria.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {resumenGeneral.gastos_por_categoria
                        .slice(0, 3)
                        .map((cat, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {cat.categoria_nombre}
                          </span>
                        ))}
                    </div>
                    {resumenGeneral.gastos_por_categoria.length > 3 && (
                      <p className="mt-1 text-xs text-gray-500">
                        +{resumenGeneral.gastos_por_categoria.length - 3}{" "}
                        categorías más
                      </p>
                    )}
                  </>
                ) : (
                  <p>No hay categorías activas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setFormData({
                    monto: "",
                    descripcion: "",
                    categoria_id: "",
                    fecha: new Date().toISOString().split("T")[0],
                  });
                  setShowModal(true);
                }}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Nuevo Gasto</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={filtros.fecha_inicio}
                onChange={handleFiltroChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={filtros.fecha_fin}
                onChange={handleFiltroChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                value={filtros.descripcion}
                onChange={handleFiltroChange}
                placeholder="Buscar por descripción"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="categoria_id"
                value={filtros.categoria_id}
                onChange={handleFiltroChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              onClick={handleBuscar}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                          {expense.descripcion}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.categoria_nombre}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(expense.monto)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.usuario_nombre ||
                            expense.usuario?.nombre ||
                            "No especificado"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                de <span className="font-medium">{totalItems}</span> resultados
              </div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  // Mostrar solo 5 páginas en móvil, centradas alrededor de la página actual
                  if (totalPages <= 5 || window.innerWidth >= 640) {
                    return (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  }

                  // En móvil, mostrar páginas alrededor de la actual
                  const pageNumber = i + 1;
                  const isNearCurrentPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1);

                  if (isNearCurrentPage) {
                    return (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  }

                  // Agregar puntos suspensivos
                  if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 &&
                      currentPage < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={i + 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Monto
                  </label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoría
                  </label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {editingExpense ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gastos;
