import { useState, useEffect } from "react";
import productsService from "../api/products.service";
import categoriesService from "../api/categories.service";
import { API_ENDPOINTS } from "../api/config";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    stock: "",
    con_itbis: true,
    categoria_id: "",
    imagen: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getProducts();
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError("Error al cargar los productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getCategories();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error al cargar las categorías:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const result = await productsService.uploadImage(file);
        setFormData((prev) => ({
          ...prev,
          imagen: result.nombre_archivo,
        }));
        setPreviewImage(URL.createObjectURL(file));
      } catch (error) {
        setError(error.message || "Error al subir la imagen");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setFormData((prev) => ({
      ...prev,
      imagen: "",
    }));
  };

  const showErrorMessage = (message) => {
    setError(message);
    setShowError(true);
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      setShowError(false);
      setError("");
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, dataToSend);
      } else {
        await productsService.createProduct(dataToSend);
      }

      setShowModal(false);
      setFormData({
        nombre: "",
        precio: "",
        stock: "",
        con_itbis: true,
        categoria_id: "",
        imagen: "",
      });
      setSelectedImage(null);
      setPreviewImage(null);
      fetchProducts();
    } catch (error) {
      if (error.response?.data?.errores) {
        showErrorMessage(error.response.data.errores[0]);
      } else if (error.response?.data?.mensaje) {
        showErrorMessage(error.response.data.mensaje);
      } else {
        showErrorMessage("Error al guardar el producto");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
      con_itbis: product.con_itbis,
      categoria_id: product.categoria_id,
      imagen: product.imagen || "",
    });
    if (product.imagen) {
      setPreviewImage(
        `${API_ENDPOINTS.BASE_URL}/api/imagenes/productos/${product.imagen}`
      );
    } else {
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        setLoading(true);
        await productsService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        if (error.response?.data?.errores) {
          showErrorMessage(error.response.data.errores[0]);
        } else if (error.response?.data?.mensaje) {
          showErrorMessage(error.response.data.mensaje);
        } else {
          showErrorMessage("Error al eliminar el producto");
        }
      } finally {
        setLoading(false);
      }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              nombre: "",
              precio: "",
              stock: "",
              con_itbis: true,
              categoria_id: "",
              imagen: "",
            });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Nuevo Producto
        </button>
      </div>

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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ITBIS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.imagen ? (
                    <img
                      src={`${API_ENDPOINTS.BASE_URL}/api/imagenes/productos/${product.imagen}`}
                      alt={product.nombre}
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  RD$ {Number(product.precio).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.categoria_nombre || product.categoria}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.con_itbis ? "Sí" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen del Producto
                  </label>
                  <div className="flex items-center space-x-4">
                    {previewImage && (
                      <div className="relative w-24 h-24">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="con_itbis"
                    checked={formData.con_itbis}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Incluye ITBIS
                  </label>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        nombre: "",
                        precio: "",
                        stock: "",
                        con_itbis: true,
                        categoria_id: "",
                        imagen: "",
                      });
                      setSelectedImage(null);
                      setPreviewImage(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Guardar"}
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

export default Products;
