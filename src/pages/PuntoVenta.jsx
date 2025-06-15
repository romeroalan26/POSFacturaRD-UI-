import { useState, useEffect } from "react";
import posService from "../api/pos.service";
import { API_ENDPOINTS } from "../api/config";
import shoppingCartIcon from "../assets/images/shopping-cart.png";
import ProductImage from "../components/ProductImage";

const PuntoVenta = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const productsPerPage = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        categoria_id: selectedCategory || undefined,
        buscar: debouncedSearchTerm || undefined,
        page: currentPage,
        size: productsPerPage,
        is_active: true,
      };
      const response = await posService.getProducts(params);
      setProducts(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.totalElements || 0);
    } catch (err) {
      setError("Error al cargar los productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedSearchTerm, currentPage]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.cantidad + 1 > product.stock) {
          setError("No hay suficiente stock disponible");
          setTimeout(() => setError(""), 3000);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      if (product.stock < 1) {
        setError("No hay stock disponible para este producto");
        setTimeout(() => setError(""), 3000);
        return prevCart;
      }
      return [...prevCart, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return prevCart;

      if (newQuantity > product.stock) {
        setError("No hay suficiente stock disponible");
        setTimeout(() => setError(""), 3000);
        return prevCart;
      }

      return prevCart.map((item) =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item
      );
    });
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

  const handleCheckout = async () => {
    try {
      const stockErrors = cart
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          if (!product) return null;
          if (item.cantidad > product.stock) {
            return `No hay suficiente stock para ${product.nombre}. Stock disponible: ${product.stock}`;
          }
          return null;
        })
        .filter((error) => error !== null);

      if (stockErrors.length > 0) {
        setError(stockErrors.join("\n"));
        setTimeout(() => setError(""), 5000);
        return;
      }

      setLoading(true);
      const saleData = {
        productos: cart.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio),
          precio_compra: parseFloat(item.precio_compra || 0),
          ganancia: parseFloat(item.ganancia_unitaria || 0),
          margen: parseFloat(item.margen_ganancia || 0),
        })),
        metodo_pago: paymentMethod,
        subtotal: calculateSubtotal(),
        itbis_total: calculateITBIS(),
        total: calculateTotal(),
        ganancia_total: cart.reduce(
          (total, item) =>
            total + parseFloat(item.ganancia_unitaria || 0) * item.cantidad,
          0
        ),
        margen_promedio:
          cart.reduce(
            (total, item) =>
              total + parseFloat(item.margen_ganancia || 0) * item.cantidad,
            0
          ) / cart.reduce((total, item) => total + item.cantidad, 0),
      };

      await posService.createSale(saleData);
      setCart([]);
      setShowCart(false);
      setShowSuccess(true);
      setSuccessMessage("¡Venta realizada con éxito!");

      // Refrescar la lista de productos
      await fetchProducts();

      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error al procesar la venta:", error);
      if (error.response?.status === 403) {
        setError("No tiene permisos para realizar ventas");
      } else if (error.response?.data?.mensaje) {
        setError(error.response.data.mensaje);
      } else if (error.response?.data?.errores) {
        setError(error.response.data.errores[0]);
      } else {
        setError("Error al procesar la venta");
      }
      setTimeout(() => {
        setError("");
      }, 3000);
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

  const CartSummary = () => {
    const itemCount = cart.reduce((total, item) => total + item.cantidad, 0);
    if (itemCount === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowCart(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <img
            src={shoppingCartIcon}
            alt="Carrito"
            className="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(93deg)_brightness(103%)_contrast(103%)]"
          />
          <span className="font-semibold">{itemCount}</span>
          <span className="hidden sm:inline">
            {formatCurrency(calculateTotal())}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Button - Mobile */}
            <button
              onClick={() => setShowCart(true)}
              className="sm:hidden bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <img
                src={shoppingCartIcon}
                alt="Carrito"
                className="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(0%)_saturate(0%)_hue-rotate(93deg)_brightness(103%)_contrast(103%)]"
              />
              <span>
                Carrito (
                {cart.reduce((total, item) => total + item.cantidad, 0)})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
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
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                    <ProductImage
                      imageName={product.imagen}
                      alt={product.nombre}
                      className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity duration-200"
                    />
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1.5">
                      {product.nombre}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-semibold text-sm sm:text-base">
                        {formatCurrency(product.precio)}
                      </span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * productsPerPage + 1}
                      </span>{" "}
                      a{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * productsPerPage, totalProducts)}
                      </span>{" "}
                      de <span className="font-medium">{totalProducts}</span>{" "}
                      productos
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
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
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
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
            )}
          </>
        )}
      </div>

      {/* Cart Summary - Desktop */}
      <CartSummary />

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-0 z-50 ${
          showCart ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            showCart ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setShowCart(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl transform transition-transform duration-300 flex flex-col ${
            showCart ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Carrito de Compras
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg
                  className="h-6 w-6"
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

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8L5 21h14"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-sm text-gray-500">
                  Agrega algunos productos para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 bg-white rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <ProductImage
                        imageName={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm mb-1 leading-tight">
                            {item.nombre}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {item.categoria_nombre}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Eliminar producto"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.cantidad - 1);
                            }}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white border hover:bg-gray-50 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="w-6 sm:w-7 text-center font-medium text-gray-900 text-sm">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.cantidad + 1);
                            }}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white border hover:bg-gray-50 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm sm:text-base font-bold text-blue-600">
                            {formatCurrency(item.precio * item.cantidad)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(item.precio)} c/u
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Checkout Section */}
          {cart.length > 0 && (
            <div className="border-t bg-white p-4 space-y-4">
              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ITBIS (18%)</span>
                  <span className="font-medium">
                    {formatCurrency(calculateITBIS())}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-blue-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all ${
                      paymentMethod === "efectivo"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-100 hover:border-blue-200"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1"
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
                    <span className="text-xs sm:text-sm font-medium">
                      Efectivo
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("tarjeta")}
                    className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all ${
                      paymentMethod === "tarjeta"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-100 hover:border-blue-200"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">
                      Tarjeta
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("transferencia")}
                    className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all ${
                      paymentMethod === "transferencia"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-100 hover:border-blue-200"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">
                      Transferencia
                    </span>
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                    <span>Confirmar Pago</span>
                  </>
                )}
              </button>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCart([])}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Vaciar Carrito
                </button>
                <button
                  onClick={() => setShowCart(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Seguir Comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down">
          {error}
        </div>
      )}

      {/* Success Toast */}
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
    </div>
  );
};

export default PuntoVenta;
