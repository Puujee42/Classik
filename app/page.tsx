'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, SlidersHorizontal, X, ShoppingBag, Sun, Leaf, Gem, ChevronLeft, ChevronRight, Heart, ShieldCheck, Truck } from 'lucide-react';
import PremiumProductGrid from '@/components/PremiumProductGrid';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useProducts } from '@/lib/hooks/useProducts';
import { type Product } from '@/models/Product';
import MobileProductGrid from '@/components/MobileProductGrid';
import HorizontalProductScroll from '@/components/HorizontalProductScroll';
import InfiniteScrollTrigger from '@/components/InfiniteScrollTrigger';
import FloatingIngredients from '@/components/FloatingIngredients';
import { useVibe, vibeConfigs, type VibeType } from '@/context/VibeContext';

type SortType = 'newest' | 'price-low' | 'price-high' | 'name-az';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function HomePage() {
  const { currency, convertPrice } = useLanguage();
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<SortType>('name-az');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  // Use global vibe context
  const { vibe, setVibe, currentVibe } = useVibe();

  // Banner carousel
  const { data: bannersData } = useSWR('/api/banners', fetcher, { refreshInterval: 60000 });
  const banners = bannersData?.banners || [];
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const { products: allProducts, isLoading: loading, isLoadingMore, isReachingEnd, size, setSize, error } = useProducts({
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined
  });

  let filteredProducts = [...allProducts];

  const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Infinity;
  if (minPrice || maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= minPriceNum && p.price <= maxPriceNum);
  }

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name-az': return a.name.localeCompare(b.name);
      case 'newest':
      default: return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
    }
  });

  const prices = filteredProducts.map(p => convertPrice(p.price));
  const suggestedMin = prices.length > 0 ? Math.floor(Math.min(...prices) / (currency === 'USD' ? 10 : 1000)) * (currency === 'USD' ? 10 : 1000) : 0;
  const suggestedMax = prices.length > 0 ? Math.ceil(Math.max(...prices) / (currency === 'USD' ? 10 : 1000)) * (currency === 'USD' ? 10 : 1000) : (currency === 'USD' ? 1000 : 1000000);

  const bestSellers = sortedProducts.filter(p => p.featured);
  const featuredProducts = sortedProducts;

  return (
    <div className={`min-h-screen bg-[#FAF9F6] relative selection:text-white overflow-hidden transition-colors duration-700`}
      style={{ ['--selection-bg' as string]: currentVibe.accent }}
    >

      {/* ═══════════════ SECTION 1: HERO BANNERS ═══════════════ */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-4 md:mt-6 mb-8 lg:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full"
        >
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-[24px] md:rounded-[32px] overflow-hidden group shadow-sm">
            {/* Overlay gradient */}
            <div className="absolute inset-0 z-10 pointer-events-none transition-all duration-700"
              style={{
                background: `linear-gradient(135deg, ${currentVibe.bg}30 0%, transparent 50%, ${currentVibe.accent}10 100%)`,
              }}
            />

              {/* Banner images */}
              <AnimatePresence mode="wait">
                {banners.length > 0 ? (
                  <motion.div
                    key={bannerIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full relative"
                  >
                    {banners[bannerIndex]?.link ? (
                      <Link href={banners[bannerIndex].link} className="block w-full h-full">
                        <img
                          src={banners[bannerIndex].image}
                          alt={banners[bannerIndex].title || 'Banner'}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ) : (
                      <img
                        src={banners[bannerIndex]?.image}
                        alt={banners[bannerIndex]?.title || 'Banner'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-full relative"
                  >
                    <Image
                      src="/hero_bg_1774502855596.png"
                      alt="Classik Store — Luxury Skincare"
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Banner OVERLAYS */}
              {banners.length > 0 && (
                <>
                  {/* Bottom Center "Details" Button removed as requested */}

                  {/* Controls (Arrows) at Bottom Right */}
                  {banners.length > 1 && (
                    <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-30 flex gap-2">
                      <button
                        onClick={(e) => { e.preventDefault(); setBannerIndex(prev => (prev - 1 + banners.length) % banners.length); }}
                        className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/60 transition-all border border-white/20 shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setBannerIndex(prev => (prev + 1) % banners.length); }}
                        className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/60 transition-all border border-white/20 shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>
        </motion.div>
      </section>




      {/* ═══════════════ SECTION 3: HOME PRODUCTS ═══════════════ */}
      {!loading && !error && sortedProducts.length > 0 && (
        <section className="relative z-10 w-full mx-auto max-w-[1400px] pt-8 pb-10">

          {/* BEST SELLER SECTION */}
          {bestSellers.length > 0 && (
            <div className={featuredProducts.length > 0 ? "mb-12 lg:mb-16" : ""}>
              <div className="flex justify-between items-end mb-6 px-4 md:px-8">
                <div>
                  <h2 className="text-xl md:text-[28px] font-extrabold uppercase tracking-tight" style={{ color: currentVibe.accent }}>BEST SELLER</h2>
                  <p className="text-[11px] md:text-sm text-[#999] uppercase mt-1 font-semibold tracking-wider">BEST SELLER</p>
                </div>
                <Link href="/shop" className="text-[12px] md:text-sm font-bold flex items-center gap-1 hover:underline pb-1 transition-all" style={{ color: currentVibe.accent }}>
                  Бүгдийг харах <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
              {/* Mobile Grid (< 768px) */}
              <div className="block md:hidden">
                <MobileProductGrid products={bestSellers.slice(0, 4)} />
              </div>
              {/* Desktop/Tablet Grid (>= 768px) */}
              <div className="hidden md:block">
                <PremiumProductGrid products={bestSellers.slice(0, 5)} />
              </div>
            </div>
          )}

          {/* FEATURED SECTION */}
          {featuredProducts.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-6 px-4 md:px-8">
                <div>
                  <h2 className="text-xl md:text-[28px] font-extrabold uppercase tracking-tight" style={{ color: currentVibe.accent }}>Онцлох бүтээгдэхүүн</h2>
                </div>
                <Link href="/shop" className="text-[12px] md:text-sm font-bold flex items-center gap-1 hover:underline pb-1 transition-all" style={{ color: currentVibe.accent }}>
                  Бүгдийг харах <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
              {/* Mobile Grid (< 768px) */}
              <div className="block md:hidden">
                <MobileProductGrid products={featuredProducts.slice(0, 4)} />
              </div>
              {/* Desktop/Tablet Grid (>= 768px) */}
              <div className="hidden md:block">
                <PremiumProductGrid products={featuredProducts.slice(0, 5)} />
              </div>
            </div>
          )}

        </section>
      )}


      {/* ═══════════════ SECTION 3.5: BRAND PILLARS ═══════════════ */}



      {/* ═══════════════ SECTION 4: ABOUT / PHILOSOPHY ═══════════════ */}

      {/* ═══════════════ NEWSLETTER CTA ═══════════════ */}

    </div>
  );
}
