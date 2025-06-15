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
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("servicios");
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
    // Verificar si el producto existe en la lista actual de productos
    const productExists = products.some((p) => p.id === product.id);
    if (!productExists) {
      setError("Este producto ya no está disponible");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      let newCart;
      if (existingItem) {
        if (existingItem.cantidad + 1 > product.stock) {
          setError("No hay suficiente stock disponible");
          setTimeout(() => setError(""), 3000);
          return prevCart;
        }
        newCart = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        if (product.stock < 1) {
          setError("No hay stock disponible para este producto");
          setTimeout(() => setError(""), 3000);
          return prevCart;
        }
        newCart = [...prevCart, { ...product, cantidad: 1 }];
      }
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== productId);
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
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

      const newCart = prevCart.map((item) =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
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
      // Verificar que todos los productos en el carrito existan
      const invalidProducts = cart.filter(
        (item) => !products.some((p) => p.id === item.id)
      );
      if (invalidProducts.length > 0) {
        setError(
          "Algunos productos ya no están disponibles. Por favor, actualice su carrito."
        );
        setTimeout(() => setError(""), 5000);
        setCart([]);
        localStorage.removeItem("cart");
        return;
      }

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
      localStorage.removeItem("cart");
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
    })
      .format(amount)
      .replace("DOP", "RD$");
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
          {/* Tabs */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("servicios")}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === "servicios"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setActiveTab("productos")}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === "productos"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Productos
            </button>
          </div>

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
                placeholder={`Buscar ${
                  activeTab === "productos" ? "productos" : "servicios"
                }...`}
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
        ) : activeTab === "servicios" ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Módulo de Servicios en Desarrollo
              </h3>
              <p className="text-gray-500">
                Próximamente podrás vender servicios y combos de productos
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="w-full max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden">
                      <ProductImage
                        imageName={product.imagen}
                        alt={product.nombre}
                        className="w-full h-full object-cover"
                      />
                      {/* Stock Indicator */}
                      <div
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.stock <= 0
                            ? "bg-red-500/90 text-white"
                            : product.stock <= 5
                            ? "bg-yellow-500/90 text-white"
                            : "bg-green-500/90 text-white"
                        }`}
                      >
                        {product.stock <= 0 ? "Sin stock" : `${product.stock}`}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800 text-sm mb-1.5 line-clamp-2">
                        {product.nombre}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-blue-600">
                            {formatCurrency(product.precio)}
                          </span>
                          {product.con_itbis && (
                            <span className="text-[10px] text-gray-500">
                              Incluye ITBIS
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Icon */}
                        <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
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

              {/* Modern Pagination */}
              <div className="mt-4 px-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {(currentPage - 1) * productsPerPage + 1} a{" "}
                    {Math.min(currentPage * productsPerPage, totalProducts)} de{" "}
                    {totalProducts} productos
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`w-8 h-8 text-sm font-medium rounded-lg ${
                                currentPage === pageNumber
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <span key={pageNumber} className="text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cart Summary - Desktop */}
      <CartSummary />

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Cart Header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Carrito de Compras
            </h2>
            <button
              onClick={() => setShowCart(false)}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
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
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 bg-white rounded-xl p-3 border border-gray-100"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg overflow-hidden">
                      <ProductImage
                        imageName={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm mb-0.5">
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
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.cantidad - 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-8 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.cantidad + 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatCurrency(item.precio * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ITBIS</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(calculateITBIS())}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod("efectivo")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                        paymentMethod === "efectivo"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod("tarjeta")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                        paymentMethod === "tarjeta"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Tarjeta
                    </button>
                    <button
                      onClick={() => setPaymentMethod("transferencia")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                        paymentMethod === "transferencia"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Transferencia
                    </button>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Completar Venta
                  </button>
                </div>
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
