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

  return (
    <div className={`min-h-screen bg-[#FAF9F6] relative selection:text-white overflow-hidden transition-colors duration-700`}
      style={{ ['--selection-bg' as string]: currentVibe.accent }}
    >

      {/* ═══════════════ SECTION 1: HERO ═══════════════ */}
      <section className="relative z-10 pt-4 pb-10 lg:pt-16 lg:pb-28 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-20">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-center lg:text-left w-full"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="uppercase tracking-[0.25em] text-[10px] sm:text-xs font-bold mb-3 lg:mb-6"
              style={{ color: currentVibe.accent }}
            >
              ✦ Classik Store ✦
            </motion.p>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#333] leading-[1.15] mb-4 lg:mb-6 tracking-tight">
              Таны Арьс Арчилгааны <br />
              <motion.span
                key={vibe}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-script text-4xl sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r bg-[length:200%_auto] animate-gradient"
                style={{
                  backgroundImage: vibe === 'calm'
                    ? 'linear-gradient(to right, #7CB9A8, #5AAFA0, #3B9E8F)'
                    : vibe === 'radiant'
                      ? 'linear-gradient(to right, #D4AF37, #C5A059, #E8C547)'
                      : 'linear-gradient(to right, #E06B8B, #C55B7A, #D4AF37)',
                }}
              >
                {vibe === 'calm' ? 'Тайван Гоо' : vibe === 'radiant' ? 'Алтан Гэрэл' : 'Байгалийн Гоо'}
              </motion.span>
            </h1>

            <p className="text-[#666] text-sm sm:text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto lg:mx-0 mb-5 lg:mb-8 px-2 sm:px-0">
              Зөөлөн, гэрэлтсэн арьс арчилгаа. Манай дээд зэрэглэлийн бүтээгдэхүүнүүд байгалийн ургамлын хүчийг орчин үеийн шинжлэх ухаантай хослуулсан.
            </p>

            {/* ✨ Mood/Vibe Selector ✨ */}
            <div className="mb-6 lg:mb-10">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-[#999] font-bold block mb-2 lg:mb-0 lg:inline lg:mr-3">Төрх сонгох</span>
              <div className="flex items-center justify-center lg:justify-start gap-2 overflow-x-auto scrollbar-hide pb-1">
                {(Object.keys(vibeConfigs) as VibeType[]).map((v) => {
                  const config = vibeConfigs[v];
                  const isActive = vibe === v;
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={v}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setVibe(v)}
                      className={`relative px-3.5 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] transition-all duration-300 flex items-center gap-1 sm:gap-1.5 shrink-0 ${isActive
                        ? 'text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-[#666]'
                        }`}
                      style={isActive ? {
                        backgroundColor: config.accent,
                        boxShadow: `0 6px 20px ${config.glow}`,
                      } : {}}
                    >
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                      {config.label}
                      {isActive && (
                        <motion.div
                          layoutId="vibeIndicator"
                          className="absolute inset-0 rounded-full"
                          style={{ border: `2px solid ${config.accent}`, opacity: 0.3 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-2 sm:px-0">
              <motion.a
                href="#featured"
                whileTap={{ scale: 0.97 }}
                className="px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center inline-block rounded-full text-white font-bold transition-all"
                style={{ backgroundColor: currentVibe.accent, boxShadow: `0 4px 14px ${currentVibe.glow}` }}
              >
                Цуглуулга үзэх
              </motion.a>
              <motion.a
                href="#philosophy"
                whileTap={{ scale: 0.97 }}
                className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full border border-[#D4AF37]/30 text-[#333] text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all"
              >
                Бидний тухай
              </motion.a>
            </div>
          </motion.div>

          {/* Right: Hero Banner Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 relative w-full max-w-xl lg:max-w-none"
          >
            {/* Decorative rings */}
            <motion.div
              className="absolute -top-8 -right-8 w-48 h-48 rounded-full border hidden lg:block transition-colors duration-700"
              style={{ borderColor: `${currentVibe.accent}20` }}
            />
            <motion.div
              className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full border hidden lg:block transition-colors duration-700"
              style={{ borderColor: `${currentVibe.accent}15` }}
            />

            <div className="relative h-[240px] sm:h-[380px] lg:h-[560px] rounded-2xl sm:rounded-[2rem] overflow-hidden group">
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

              {/* Carousel controls */}
              {banners.length > 1 && (
                <>
                  {/* Prev/Next arrows */}
                  <button
                    onClick={() => setBannerIndex(prev => (prev - 1 + banners.length) % banners.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setBannerIndex(prev => (prev + 1) % banners.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {banners.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setBannerIndex(i)}
                        className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i === bannerIndex ? currentVibe.accent : 'rgba(255,255,255,0.5)',
                          transform: i === bannerIndex ? 'scale(1.3)' : 'scale(1)',
                          boxShadow: i === bannerIndex ? `0 0 8px ${currentVibe.glow}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Banner title badge */}
              {banners.length > 0 && banners[bannerIndex]?.title && (
                <motion.div
                  key={`title-${bannerIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg border border-[#D4AF37]/10"
                >
                  <p className="text-sm font-bold text-[#333]">{banners[bannerIndex].title}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>




      {/* ═══════════════ SECTION 3: ALL PRODUCTS GRID ═══════════════ */}
      {!loading && !error && sortedProducts.length > 0 && (
        <section className="relative z-10 w-full mx-auto max-w-[1400px] pt-12 pb-2">

          {/* Beautiful Feminine Header */}
          <div className="text-center mb-10 px-4">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold mb-3"
              style={{ color: '#D4AF37' }}
            >
              Цуглуулга
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl md:text-5xl text-[#333] mb-4"
            >
              Танд зориулсан <span className="font-script text-4xl md:text-6xl text-[#E27289] block mt-1 sm:inline sm:mt-0">Бүтээгдэхүүн</span>
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#E27289] to-transparent mx-auto"
            />
          </div>

          {/* Mobile Grid (< 768px) */}
          <div className="block md:hidden">
            <MobileProductGrid products={sortedProducts} />
          </div>

          {/* Desktop/Tablet Grid (>= 768px) */}
          <div className="hidden md:block">
            <PremiumProductGrid products={sortedProducts} />
          </div>

          <div className="flex justify-center mt-6 mb-6">
            <motion.a
              href="/shop"
              whileHover={{ y: -3, boxShadow: `0 8px 25px rgba(226,114,137,0.3)` }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 text-[13px] uppercase tracking-[0.2em] inline-block rounded-full bg-white border border-[#E27289]/30 text-[#E27289] font-bold transition-all shadow-sm hover:bg-[#E27289] hover:text-white"
            >
              БҮХ БҮТЭЭГДЭХҮҮН ҮЗЭХ
            </motion.a>
          </div>
        </section>
      )}


      {/* ═══════════════ SECTION 3.5: BRAND PILLARS ═══════════════ */}
      <section className="relative z-10 py-6 lg:py-10 bg-white/50 border-y border-[#D4AF37]/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 md:gap-8 lg:justify-between items-center pb-2 md:pb-0">
            {[
              { icon: Leaf, title: '100% Органик', desc: 'Байгалийн гаралтай' },
              { icon: Heart, title: 'Хэрэглэгчдэд зориулсан', desc: 'Зөөлөн, харшилгүй' },
              { icon: Gem, title: 'Монгол брэнд', desc: 'Үндэсний үйлдвэрлэл' },
              { icon: Truck, title: 'Хүргэлт 24ц', desc: 'Шуурхай, найдвартай' }
            ].map((pillar, idx) => (
              <div key={idx} className="flex flex-col items-center text-center min-w-[130px] snap-center group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: '#FFF4F6' }}>
                  <pillar.icon className="w-6 h-6 text-[#E27289]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[13px] font-bold text-gray-800 mb-1">{pillar.title}</h4>
                <p className="text-[11px] text-gray-500">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4: ABOUT / PHILOSOPHY ═══════════════ */}
      <section id="philosophy" className="relative z-10 py-16 lg:py-28 overflow-hidden transition-colors duration-700" style={{ backgroundColor: currentVibe.bg }}>
        {/* Decorative gold rings */}
        <div className="absolute top-12 right-12 w-64 h-64 rounded-full border border-[#D4AF37]/15 hidden lg:block" />
        <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full border border-[#D4AF37]/10 hidden lg:block" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-[#D4AF37]/8 hidden lg:block" style={{ animation: 'goldPulse 6s ease-in-out infinite' }} />

        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold mb-4 md:mb-6" style={{ color: '#D4AF37' }}>Бидний Философи</p>

            <h2 className="font-serif text-3xl md:text-5xl text-[#333] mb-4 md:mb-6 leading-tight">
              Мөнхийн Гоо Үзэсгэлэн, <br />
              <span className="font-script text-4xl md:text-6xl" style={{ color: currentVibe.accent }}>Байгалийн Сонгодог</span>
            </h2>

            <p className="text-[#555] text-sm md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10">
              Classik Store-д бид жинхэнэ гоо үзэсгэлэн дотор талаас ирдэг гэдэгт итгэдэг. Манай бүтээгдэхүүнүүд байгалийн хамгийн хүчирхэг ургамлуудыг хүндэтгэж,
              эмэгтэй сэтгэлийг баясгах гоёмсог савлагаанд хийсэн. Бүх бүтээгдэхүүн нь гэрэлтсэн, итгэлтэй арьсанд зориулсан хайрын захидал юм.
            </p>

            {/* Stats - Horizontal Scroll on Mobile */}
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 md:gap-8 justify-start md:justify-center mb-10 pb-4 md:pb-0 px-2 md:px-0">
              {[
                { number: '100%', label: 'Дээд зэрэглэлийн найрлага' },
                { number: '50+', label: 'Арьс арчилгааны бүтээгдэхүүн' },
                { number: '10K+', label: 'Сэтгэл ханамжтай хэрэглэгч' },
              ].map((stat) => (
                <div key={stat.label} className="text-center min-w-[140px] snap-center shrink-0">
                  <p className="font-serif text-3xl md:text-4xl font-bold" style={{ color: currentVibe.accent }}>{stat.number}</p>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#888] mt-1 font-bold leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>

            <motion.a
              href="#featured"
              whileHover={{ y: -3, boxShadow: `0 15px 35px ${currentVibe.glow.replace('0.3', '0.4')}` }}
              whileTap={{ scale: 0.97 }}
              className="px-8 md:px-10 py-3.5 md:py-4 text-xs tracking-[0.15em] md:text-sm md:tracking-[0.2em] uppercase inline-block rounded-full text-white font-bold relative overflow-hidden transition-all shadow-md"
              style={{ backgroundColor: currentVibe.accent, boxShadow: `0 4px 14px ${currentVibe.glow}` }}
            >
              Цуглуулга харах
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ NEWSLETTER CTA ═══════════════ */}

    </div>
  );
}
