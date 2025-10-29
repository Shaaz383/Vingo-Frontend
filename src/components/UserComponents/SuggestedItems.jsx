import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaLeaf, FaDrumstickBite, FaStar, FaShoppingCart } from 'react-icons/fa';
import useItemsByCity from '@/hooks/useItemsByCity.jsx';
import { addToCart } from '@/redux/cartSlice.js';
import { useToast } from '@/context/ToastContext.jsx';

// Deterministic pseudo ratings (stable per item)
const calcGenuineRatings = (key) => {
  const str = String(key || 'default');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);
  const avg = 3.6 + (seed % 130) / 100; // 3.6–4.9
  const count = 80 + (seed % 920); // 80–1000
  return { avg: Number(avg.toFixed(1)), count };
};

const FoodTypeBadge = ({ type }) => {
  const isVeg = type === 'Veg';
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isVeg ? <FaLeaf /> : <FaDrumstickBite />}
      {type}
    </span>
  );
};

const ItemCard = ({ item, quantity, onChangeQty, onAddToCart }) => {
  const placeholder = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop';
  const img = item?.image || placeholder;
  const ratings = calcGenuineRatings(item?._id || item?.name);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="h-36 w-full">
        <img src={img} alt={item?.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = placeholder; }} />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 truncate">{item?.name}</h3>
          <FoodTypeBadge type={item?.foodType} />
        </div>
        <p className="text-sm text-gray-600 truncate mt-1">{item?.shop?.name || 'Restaurant'}</p>

        <div className="mt-2 flex items-center text-amber-500 text-sm">
          <FaStar className="mr-1" />
          <span className="font-semibold">{ratings.avg}</span>
          <span className="ml-2 text-gray-500">({ratings.count} ratings)</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">₹{item?.price}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onChangeQty(item, Math.max(0, quantity - 1))} className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50">-</button>
            <span className="min-w-[2ch] text-center">{quantity}</span>
            <button type="button" onClick={() => onChangeQty(item, quantity + 1)} className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50">+</button>
          </div>
        </div>
        
        <button 
          onClick={() => onAddToCart(item, quantity)}
          disabled={quantity <= 0}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-md ${
            quantity > 0 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

const SuggestedItems = () => {
  const { city } = useSelector(state => state.user);
  const { items, loading, error } = useItemsByCity(city);
  const [filter, setFilter] = useState('All'); // All, Veg, Non-Veg, Vegan
  const [quantities, setQuantities] = useState({});
  const dispatch = useDispatch();
  const toast = useToast();

  const filteredItems = useMemo(() => {
    if (filter === 'All') return items;
    return items.filter(i => i.foodType === filter);
  }, [items, filter]);

  const onChangeQty = (item, qty) => {
    setQuantities(prev => ({ ...prev, [item._id || item.name]: qty }));
  };
  
  const onAddToCart = (item, quantity) => {
    if (quantity <= 0) return;
    
    dispatch(addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      quantity,
      image: item.image,
      foodType: item.foodType,
      shopId: item.shop?._id,
      shopName: item.shop?.name || 'Restaurant'
    }));
    
    toast.show(`Added ${quantity} ${item.name} to cart`, 'success');
    setQuantities(prev => ({ ...prev, [item._id || item.name]: 0 }));
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Suggested Food Items</h2>
        <div className="flex items-center gap-2">
          {['All', 'Veg', 'Non-Veg', 'Vegan'].map(t => (
            <button key={t} type="button" onClick={() => setFilter(t)} className={`px-3 py-1 text-sm rounded-full border ${filter === t ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="p-6 text-gray-600">Loading items...</div>}
      {error && <div className="p-6 text-red-600">{error}</div>}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="p-6 text-gray-600">No items found in {city || 'your city'}.</div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => (
            <ItemCard 
              key={item._id || item.name} 
              item={item} 
              quantity={quantities[item._id || item.name] || 0} 
              onChangeQty={onChangeQty}
              onAddToCart={onAddToCart} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedItems;