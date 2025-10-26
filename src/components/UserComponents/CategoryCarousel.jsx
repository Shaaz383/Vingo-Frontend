import React, { useEffect, useMemo, useRef, useState } from 'react';
import { categories } from '@/data/categories.js';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const breakpoints = [
  { min: 1280, perView: 6 },
  { min: 1024, perView: 5 },
  { min: 768, perView: 4 },
  { min: 640, perView: 3 },
  { min: 0, perView: 2 },
];

const usePerView = () => {
  const [perView, setPerView] = useState(4);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const found = breakpoints.find(bp => w >= bp.min);
      setPerView(found?.perView || 2);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return perView;
};

const CategoryCarousel = () => {
  const perView = usePerView();
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
  }, [perView]);

  const scrollByAmount = () => {
    const el = containerRef.current;
    if (!el) return 0;
    // Scroll by one card width (container width / perView)
    return el.clientWidth / perView;
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

  const cardStyle = useMemo(() => ({
    flex: `0 0 ${100 / perView}%`,
  }), [perView]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Choose Food</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border bg-white shadow-sm hover:bg-gray-50 ${!canScrollLeft ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border bg-white shadow-sm hover:bg-gray-50 ${!canScrollRight ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
          onScroll={updateScrollState}
        >
          {categories.map((c) => (
            <div key={c.category} style={cardStyle} className="">
              <div className="group relative h-36 md:h-40 lg:h-48 xl:h-56 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <img
                  src={c.image}
                  alt={c.category}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white text-lg md:text-xl font-bold drop-shadow-sm">
                    {c.category}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edge fade */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent"></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent"></div>
      </div>
    </div>
  );
};

export default CategoryCarousel;