import { useState, useEffect } from "react";
import salesService from "../api/sales.service";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [filters, setFilters] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    metodo_pago: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const showErrorMessage = (msg) => {
    setError(msg);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      setError("");
    }, 4000);
  };

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      const res = await salesService.getSales(params);
      setVentas(res.data);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showErrorMessage("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
    // eslint-disable-next-line
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  // Responsive: tarjetas en móvil, tabla en escritorio
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Historial de Ventas
      </h1>

      {/* Mensaje de error */}
      {showError && (
        <div className="fixed top-4 right-4 w-auto max-w-[90%] sm:max-w-md bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium break-words">{error}</p>
            <button
              className="flex-shrink-0 text-red-500 hover:text-red-700 focus:outline-none"
              onClick={() => {
                setShowError(false);
                setError("");
              }}
            >
              <span className="sr-only">Cerrar</span>
              <svg
                className="h-4 w-4"
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
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="date"
          name="fecha_inicio"
          value={filters.fecha_inicio}
          onChange={handleFilterChange}
          className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
        />
        <input
          type="date"
          name="fecha_fin"
          value={filters.fecha_fin}
          onChange={handleFilterChange}
          className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
        />
        <select
          name="metodo_pago"
          value={filters.metodo_pago}
          onChange={handleFilterChange}
          className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
        >
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      {/* Tabla en escritorio, tarjetas en móvil */}
      <div className="hidden sm:block">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Fecha
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Total
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Método
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  No hay ventas
                </td>
              </tr>
            )}
            {ventas.map((venta) => (
              <tr
                key={venta.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-2 text-sm">{venta.fecha}</td>
                <td className="px-4 py-2 text-sm font-bold text-indigo-700">
                  RD${" "}
                  {Number(venta.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-2 text-sm capitalize">
                  {venta.metodo_pago}
                </td>
                <td className="px-4 py-2 text-sm">
                  <button
                    className="text-indigo-600 hover:underline text-xs"
                    onClick={() => alert("Detalle de venta próximamente")}
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en móvil */}
      <div className="sm:hidden flex flex-col gap-3">
        {ventas.length === 0 && (
          <div className="text-center py-6 text-gray-400 bg-white rounded shadow">
            No hay ventas
          </div>
        )}
        {ventas.map((venta) => (
          <div
            key={venta.id}
            className="bg-white rounded-lg shadow p-3 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{venta.fecha}</span>
              <span className="text-xs capitalize bg-gray-100 px-2 py-0.5 rounded">
                {venta.metodo_pago}
              </span>
            </div>
            <div className="text-lg font-bold text-indigo-700">
              RD${" "}
              {Number(venta.total).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <button
              className="self-end text-indigo-600 hover:underline text-xs mt-1"
              onClick={() => alert("Detalle de venta próximamente")}
            >
              Ver Detalle
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
