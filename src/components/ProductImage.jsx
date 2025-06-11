import { useState } from "react";
import { API_ENDPOINTS } from "../api/config";

const ProductImage = ({
  imageName,
  alt,
  className = "w-12 h-12 object-cover rounded-lg",
  fallbackIcon = "📦",
  fallbackIconSize = "text-4xl",
}) => {
  const [imageError, setImageError] = useState(false);

  if (!imageName || imageError) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center`}
      >
        <span className={`text-gray-400 ${fallbackIconSize}`}>
          {fallbackIcon}
        </span>
      </div>
    );
  }

  return (
    <img
      src={`${API_ENDPOINTS.BASE_URL}/api/imagenes/productos/${imageName}`}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ProductImage;
