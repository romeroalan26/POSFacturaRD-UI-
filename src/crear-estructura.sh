#!/bin/bash

# Crear carpetas
mkdir -p api auth components pages routes

# Crear archivos vacíos o con contenido mínimo
echo "// Axios config" > api/axios.js
echo "// Zustand store de autenticación" > auth/useAuthStore.js
echo "// Componentes reutilizables aquí" > components/README.md
echo "// Página de Login" > pages/Login.jsx
echo "// Página principal de Dashboard" > pages/Dashboard.jsx
echo "// Rutas protegidas" > routes/AppRouter.jsx

# Crear App.jsx si no existe
if [ ! -f App.jsx ]; then
  echo "// App principal" > App.jsx
fi

# Crear main.jsx si no existe
if [ ! -f main.jsx ]; then
  echo "// Punto de entrada" > main.jsx
fi

echo "✅ Estructura creada exitosamente."
