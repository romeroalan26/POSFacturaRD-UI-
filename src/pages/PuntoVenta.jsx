import { useState, useEffect } from "react";
import posService from "../api/pos.service";
import { API_ENDPOINTS } from "../api/config";

const PuntoVenta = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await posService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError("Error al cargar las categorías");
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        categoria_id: selectedCategory || undefined,
        buscar: searchTerm || undefined,
        size: 50,
      };
      const response = await posService.getProducts(params);
      setProducts(response.data || []);
    } catch (err) {
      setError("Error al cargar los productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const calculateITBIS = () => {
    return cart.reduce(
      (total, item) =>
        total + (item.con_itbis ? item.precio * item.cantidad * 0.18 : 0),
      0
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateITBIS();
  };

  const showErrorMessage = (message) => {
    setError(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      setError("");
    }, 5000);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const saleData = {
        productos: cart.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: parseFloat(item.precio),
        })),
        metodo_pago: paymentMethod,
      };

      await posService.createSale(saleData);
      setCart([]);
      setShowSuccess(true);
      setSuccessMessage("¡Venta realizada con éxito!");
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      if (error.response?.data?.mensaje) {
        showErrorMessage(error.response.data.mensaje);
      } else {
        showErrorMessage("Ocurrió un error inesperado al procesar la venta");
      }
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Panel Izquierdo - Lista de Productos */}
      <div className="w-full lg:w-2/3 p-4 space-y-4">
        {/* Mensaje de éxito */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <p className="font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.imagen ? (
                  <img
                    src={`${API_ENDPOINTS.BASE_URL}/api/imagenes/productos/${product.imagen}`}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/48?text=No+Image";
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-4xl">📦</span>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {product.nombre}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {product.categoria_nombre}
                </p>
                <div className="mt-auto">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-indigo-600">
                        ${parseFloat(product.precio).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Derecho - Carrito */}
      <div className="w-full lg:w-1/3 bg-white shadow-lg">
        <div className="h-full flex flex-col">
          {/* Encabezado del carrito */}
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Carrito de Venta
            </h2>
          </div>

          {/* Lista de productos en el carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                El carrito está vacío
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      {item.imagen ? (
                        <img
                          src={`${API_ENDPOINTS.BASE_URL}/api/imagenes/productos/${item.imagen}`}
                          alt={item.nombre}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/48?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">📦</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${parseFloat(item.precio).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.cantidad - 1)
                        }
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.cantidad + 1)
                        }
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen y botón de pago */}
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  RD${" "}
                  {Number(calculateSubtotal()).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ITBIS (18%):</span>
                <span className="font-medium">
                  RD${" "}
                  {Number(calculateITBIS()).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-indigo-600">
                  RD${" "}
                  {Number(calculateTotal()).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Procesar Venta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Procesar Pago
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total a Pagar
                  </label>
                  <div className="text-2xl font-bold text-indigo-600">
                    RD${" "}
                    {Number(calculateTotal()).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default PuntoVenta;
