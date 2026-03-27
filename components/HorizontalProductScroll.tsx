'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, ChevronRight } from 'lucide-react';
import { type Product } from '@/models/Product';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useVibe } from '@/context/VibeContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface HorizontalProductScrollProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
}

export default function HorizontalProductScroll({
  products,
  title = 'Шинээр Нэмэгдсэн',
  subtitle = 'ТАНД ЗОРИУЛСАН',
  viewAllHref = '/new-arrivals',
}: HorizontalProductScrollProps) {
  const { convertPrice, currency } = useLanguage();
  const { currentVibe } = useVibe();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  return (
    <section className="bg-[#FCFBFA] py-12 lg:py-16 overflow-hidden">
      {/* Section Header */}
      <div className="flex items-end justify-between px-4 md:px-8 max-w-7xl mx-auto mb-8">
        <div>
          <p
            className="text-[10px] tracking-[0.2em] font-bold uppercase mb-2"
            style={{ color: '#D4AF37' }}
          >
            {subtitle}
          </p>
          <h2 className="font-serif text-3xl text-gray-800 leading-none">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase shrink-0 pb-1 transition-all hover:opacity-80 group text-gray-500"
        >
          <span>Бүгдийг</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" style={{ color: currentVibe.accent || '#D4AF37' }} />
        </Link>
      </div>

      {/* Horizontal Scroll Container (Left Padding Trick) */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide w-full pb-12 pt-4 snap-x snap-mandatory scroll-smooth pl-4 md:pl-8 lg:pl-[max(32px,calc((100vw-1280px)/2+32px))] pr-4 md:pr-8"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.slice(0, 10).map((product, index) => (
          <HorizontalCard
            key={product.id}
            product={product}
            index={index}
            currency={currency}
            convertPrice={convertPrice}
            addItem={addItem}
            addToWishlist={addToWishlist}
            removeFromWishlist={removeFromWishlist}
            isInWishlist={isInWishlist}
            currentVibe={currentVibe}
          />
        ))}

        {/* Full-height "See All" tail card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(10, products.length) * 0.05, duration: 0.4 }}
          className="snap-start shrink-0 w-[180px] sm:w-[220px]"
        >
          <Link
            href={viewAllHref}
            className="block cursor-pointer group h-full"
          >
            <div className="bg-[#FDFBF7] rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 h-full flex flex-col items-center justify-center border border-[#D4AF37]/5 px-4 min-h-[320px] sm:min-h-[380px]">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-transform duration-500 ease-out group-hover:translate-x-2"
              >
                <ChevronRight className="w-6 h-6" style={{ color: currentVibe.accent || '#D4AF37' }} />
              </div>
              <span className="text-[12px] font-bold text-gray-800 tracking-wider text-center uppercase">
                Бүгдийг үзэх
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Individual Horizontal Card ──────────────────────────────────────

function HorizontalCard({
  product,
  index,
  currency,
  convertPrice,
  addItem,
  addToWishlist,
  removeFromWishlist,
  isInWishlist: isInWishlistFn,
  currentVibe,
}: {
  product: Product;
  index: number;
  currency: string;
  convertPrice: (price: number) => number;
  addItem: any;
  addToWishlist: any;
  removeFromWishlist: any;
  isInWishlist: (id: string) => boolean;
  currentVibe: any;
}) {
  const price = convertPrice(product.price);
  const formattedPrice =
    currency === 'USD' ? `$${price.toLocaleString()}` : `${formatCurrency(price)}`;
  const isWishlisted = isInWishlistFn(product.id);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  const mainImage = product.image || product.images?.[0] || '/placeholder.png';

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        stockStatus: (product.stockStatus as any) || 'in-stock',
        category: product.category || '',
        description: product.description || undefined,
      });

      if (cartBtnRef.current) {
        const rect = cartBtnRef.current.getBoundingClientRect();
        confetti({
          particleCount: 15,
          spread: 45,
          startVelocity: 15,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
          colors: ['#E06B8B', '#D4AF37', '#FCEEF2', '#FFD700'],
          ticks: 60,
          gravity: 0.8,
          scalar: 0.6,
          shapes: ['circle'],
          disableForReducedMotion: true,
        });
      }

      if (navigator.vibrate) navigator.vibrate(20);
      toast.success('Сагсанд нэмлээ', {
        style: {
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #F8B4C4, #E06B8B)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '13px',
        },
        icon: '🛍️',
        duration: 1500,
      });
    },
    [addItem, product]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      // Slightly wider cards on desktop
      className="snap-start shrink-0 w-[180px] sm:w-[220px]"
    >
      <Link href={`/product/${product.id}`} className="block h-full cursor-pointer">
        <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 h-full flex flex-col group relative overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-[#F8F8F8] flex-shrink-0 overflow-hidden">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 180px, 220px"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* Soft gradient overlay for mobile text legibility if needed, but we chose bottom block */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#F8F8F8]/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (navigator.vibrate) navigator.vibrate(15);
                if (isWishlisted) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist({ ...product } as any);
                  toast.success('💖', { duration: 800 });
                }
              }}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all"
            >
              <Heart
                className={`w-4 h-4 transition-all ${isWishlisted ? 'fill-[#E06B8B] text-[#E06B8B]' : 'text-gray-400'}`}
                strokeWidth={isWishlisted ? 0 : 1.5}
              />
            </motion.button>
            
            {/* Discount badge */}
            {product.discountPercent && product.discountPercent > 0 && (
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-[0_4px_10px_rgb(0,0,0,0.05)]">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: currentVibe.accent || '#E06B8B' }}>-{product.discountPercent}%</span>
              </div>
            )}
          </div>

          {/* Info Block (Bottom Anchored) */}
          <div className="p-4 flex flex-col flex-1 bg-white">
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mt-1 leading-snug tracking-tight flex-grow">
              {product.name}
            </h3>
            
            {/* Desktop: Price + Circular Cart Button */}
            <div className="hidden sm:flex items-center justify-between mt-4">
              <div className="flex items-baseline min-w-0">
                <span className="text-[16px] font-bold tracking-tight truncate mr-0.5" style={{ color: currentVibe.accent || '#E06B8B' }}>
                  {formattedPrice}
                </span>
                {currency !== 'USD' && (
                  <span className="text-[10px] font-bold" style={{ color: currentVibe.accent || '#E06B8B', opacity: 0.8 }}>₮</span>
                )}
              </div>
              
              <motion.button
                ref={cartBtnRef}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full shadow-md transition-all overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #F8B4C4, #E06B8B)' }}
              >
                <ShoppingCart className="w-[18px] h-[18px] text-white relative z-10" strokeWidth={1.5} />
                <motion.div
                  className="absolute inset-0 z-0"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </motion.button>
            </div>

            {/* Mobile: Anchored Minimalist Add to Cart */}
            <div className="flex flex-col sm:hidden mt-3">
              <div className="flex items-baseline mb-2 mx-auto">
                <span className="text-[15px] font-bold tracking-tight truncate mr-0.5" style={{ color: currentVibe.accent || '#E06B8B' }}>
                  {formattedPrice}
                </span>
                {currency !== 'USD' && (
                  <span className="text-[10px] font-bold" style={{ color: currentVibe.accent || '#E06B8B', opacity: 0.8 }}>₮</span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 text-[11px] font-bold uppercase tracking-widest bg-gray-900 active:bg-black text-white rounded-xl shadow-sm transition-colors"
              >
                Сагсанд
              </button>
            </div>
            
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
