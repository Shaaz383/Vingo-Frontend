import React from 'react';

const OwnerItemCard = ({ item, onClick }) => {
  const {
    name = 'Unnamed Dish',
    image = '',
    category = 'Uncategorized',
    foodType = 'Veg',
    price,
    description,
  } = item || {};

  const isVeg = String(foodType).toLowerCase().includes('veg') && !String(foodType).toLowerCase().includes('non');
  const vegColor = isVeg ? 'bg-green-600' : 'bg-red-600';
  const vegLabel = isVeg ? 'Veg' : 'Non-Veg';

  const placeholderImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';

  return (
    <div
      role="button"
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={image || placeholderImg}
          alt={name}
          className="w-full h-40 object-cover"
          onError={(e) => (e.currentTarget.src = placeholderImg)}
        />
        {/* Food type dot */}
        <div className={`absolute top-3 left-3 h-4 w-4 rounded-sm border-2 border-white ${vegColor}`}></div>
        {/* Category badge */}
        <span className="absolute bottom-3 left-3 text-xs font-medium bg-white/90 text-gray-800 px-2 py-1 rounded-md shadow-sm">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate group-hover:text-red-700">
          {name}
        </h3>

        {/* Meta */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {vegLabel}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {category}
            </span>
          </div>
          {price !== undefined && (
            <span className="text-sm font-semibold text-gray-900">₹{price}</span>
          )}
        </div>

        {/* Description (optional) */}
        {description && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export default OwnerItemCard;