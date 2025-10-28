import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import useBestShopsByCity from '@/hooks/useBestShopsByCity.jsx';

const breakpoints = [
  { min: 1280, perView: 4 },
  { min: 1024, perView: 3 },
  { min: 768, perView: 2 },
  { min: 0, perView: 1 },
];

const usePerView = () => {
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const found = breakpoints.find(bp => w >= bp.min);
      setPerView(found?.perView || 1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return perView;
};

const ShopCard = ({ shop }) => {
  const placeholderImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4f29?q=80&w=800&auto=format&fit=crop';
  const img = shop?.image || placeholderImage;
  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="h-40 w-full overflow-hidden">
        <img src={img} alt={shop?.name || 'Restaurant'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { e.currentTarget.src = placeholderImage; }} />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 truncate">{shop?.name || 'Restaurant'}</h3>
          <div className="flex items-center text-amber-500 text-xs font-semibold">
            <FaStar className="mr-1" />
            <span>4.5</span>
          </div>
        </div>
        <div className="mt-2 flex items-center text-gray-600 text-sm">
          <FaMapMarkerAlt className="mr-1 text-red-500" />
          <span className="truncate">{shop?.address || shop?.city || 'City'}</span>
        </div>
        <button type="button" className="mt-3 w-full text-sm font-medium bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">View Menu</button>
      </div>
    </div>
  );
};

const BestRestaurantsCarousel = () => {
  const { city } = useSelector(state => state.user);
  const perView = usePerView();
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { shops, loading, error } = useBestShopsByCity(city);

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
  }, [shops]);

  const scrollByAmount = () => {
    const el = containerRef.current;
    if (!el) return 0;
    return Math.max(250, el.clientWidth * 0.8);
  };

  const scrollLeft = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: -scrollByAmount(), behavior: 'smooth' });
    setTimeout(updateScrollState, 250);
  };

  const scrollRight = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: scrollByAmount(), behavior: 'smooth' });
    setTimeout(updateScrollState, 250);
  };

  const cardStyle = useMemo(() => ({ flex: `0 0 ${100 / perView}%` }), [perView]);

  return (
    <div className="relative mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Best Shop {city ? city : ''}</h2>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Scroll left" onClick={scrollLeft} disabled={!canScrollLeft} className={`p-2 rounded-full border bg-white shadow-sm hover:bg-gray-50 ${!canScrollLeft ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <FaChevronLeft />
          </button>
          <button type="button" aria-label="Scroll right" onClick={scrollRight} disabled={!canScrollRight} className={`p-2 rounded-full border bg-white shadow-sm hover:bg-gray-50 ${!canScrollRight ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="p-6 text-gray-600">Loading best restaurants...</div>
        )}
        {error && (
          <div className="p-6 text-red-600">{error}</div>
        )}
        {!loading && !error && shops.length === 0 && (
          <div className="p-6 text-gray-600">No restaurants found in {city || 'your city'} yet.</div>
        )}
        {!loading && !error && shops.length > 0 && (
          <div ref={containerRef} className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar" onScroll={updateScrollState}>
            {shops.map((shop) => (
              <div key={shop._id || `${shop.name}-${shop.address}`} style={cardStyle}>
                <ShopCard shop={shop} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestRestaurantsCarousel;