# POSFacturaRD - Sistema de Gestión

Sistema de gestión y punto de venta desarrollado para CORO 69, una solución completa para la administración de negocios.

## 🚀 Características

- **Dashboard Interactivo**: Visualización de estadísticas y métricas clave
- **Gestión de Productos**: Control de inventario y precios
- **Punto de Venta**: Interfaz intuitiva para ventas rápidas
- **Gestión de Categorías**: Organización eficiente de productos
- **Control de Ventas**: Seguimiento y reportes de transacciones
- **Administración de Usuarios**: Sistema de roles y permisos
- **Gestión de Gastos**: Control y categorización de gastos
- **Reportes**: Análisis detallado de ventas y productos

## 🛠️ Tecnologías

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Context API

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Git

## 🔧 Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/romeroalan26/POSFacturaRD-UI-.git
```

2. Instalar dependencias:

```bash
cd POSFacturaRD-UI-
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

Editar el archivo `.env` con las siguientes configuraciones:

```env
VITE_API_URL=http://localhost:8000
VITE_COMPANY_NAME="Nombre de tu Empresa"
VITE_HEADER_TITLE="Título del Sistema"
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

## 👥 Roles de Usuario

- **Administrador**: Acceso completo al sistema
- **Cajero**: Gestión de ventas y punto de venta
- **Inventario**: Control de productos y categorías
- **Invitado**: Acceso limitado a dashboard y productos

## 📦 Estructura del Proyecto

```
src/
├── api/          # Servicios y configuración de API
├── assets/       # Recursos estáticos
├── components/   # Componentes reutilizables
├── context/      # Contextos de React
├── pages/        # Páginas de la aplicación
└── routes/       # Configuración de rutas
```

## 🔐 Seguridad

- Autenticación basada en JWT
- Protección de rutas por rol
- Manejo seguro de sesiones
- Validación de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Alan Joel Romero De Oleo - [@romeroalan26](https://github.com/romeroalan26)

Link del Proyecto: [https://github.com/romeroalan26/POSFacturaRD-UI-](https://github.com/romeroalan26/POSFacturaRD-UI-)
