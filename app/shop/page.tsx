'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/lib/hooks/useProducts';
import { useVibe } from '@/context/VibeContext';
import PremiumProductGrid from '@/components/PremiumProductGrid';
import MobileProductGrid from '@/components/MobileProductGrid';
import ShopSkeleton from '@/components/ShopSkeleton';

const ALL_CATEGORIES = ['All Products', 'Нүүр цэвэрлэгч', 'Тоник', 'Серум', 'Тос', 'Маск', 'Нарны тос'];

export default function ShopPage() {
  const { currentVibe } = useVibe();
  const { products, isLoading, error } = useProducts({});
  const [activeCategory, setActiveCategory] = useState('All Products');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All Products') return products;
    return products.filter((p: any) => p.category === activeCategory); // Assuming category is matched exactly
  }, [products, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FCFBFA] relative selection:text-white pb-20 lg:pb-0" style={{ ['--selection-bg' as string]: currentVibe.accent }}>
      
      {/* Hero Header */}
      <section className="relative z-10 pt-16 pb-10 lg:pt-24 lg:pb-16 px-4 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#333] mb-4">
            Our <span className="font-script text-5xl sm:text-6xl md:text-7xl" style={{ color: currentVibe.accent }}>Collections</span>
          </h1>
          <p className="text-[#666] font-light max-w-xl mx-auto text-sm sm:text-base tracking-wide">
            Pure, organic, and crafted for your skin's unique journey.
          </p>
        </motion.div>
      </section>

      {/* Sticky Category Bar */}
      <div className="sticky top-16 md:top-[76px] z-40 bg-[#FCFBFA]/90 backdrop-blur-md border-b border-gray-100 mb-8 md:mb-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3.5">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 md:gap-4 items-center pl-1 pr-4">
            {ALL_CATEGORIES.map((cat, idx) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`snap-center shrink-0 px-6 py-2.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-white shadow-md' 
                      : 'text-gray-500 bg-white hover:bg-gray-50 border border-gray-100/50'
                  }`}
                  style={{
                    backgroundColor: isActive ? currentVibe.accent : undefined,
                    boxShadow: isActive ? `0 4px 14px ${currentVibe.glow}` : undefined
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Grid Area */}
      <section className="relative z-10 w-full mx-auto max-w-[1400px] pb-24">
        {isLoading ? (
          <ShopSkeleton />
        ) : error ? (
          <div className="text-center text-red-400 py-12 text-sm font-medium">Couldn't load collection. Please try again.</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-20 font-serif text-xl border border-dashed border-gray-200 mx-4 md:mx-8 rounded-[20px] bg-white/50">
            Энэ ангилалд бүтээгдэхүүн олдсонгүй.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
              {/* Mobile Grid (< 768px) */}
              <div className="block md:hidden">
                <MobileProductGrid products={filteredProducts} />
              </div>

              {/* Desktop/Tablet Grid (>= 768px) */}
              <div className="hidden md:block">
                <PremiumProductGrid products={filteredProducts} />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </section>

    </div>
  );
}
