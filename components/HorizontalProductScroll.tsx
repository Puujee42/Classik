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
  title = 'Шилдэг Бүтээгдэхүүн',
  subtitle = 'Хамгийн их таалагддаг',
  viewAllHref = '#featured',
}: HorizontalProductScrollProps) {
  const { convertPrice, currency } = useLanguage();
  const { currentVibe } = useVibe();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  return (
    <section className="py-8 lg:py-12">
      {/* Section Header */}
      <div className="flex items-end justify-between px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-5">
        <div>
          <p
            className="uppercase tracking-[0.2em] text-[10px] font-bold mb-1"
            style={{ color: '#D4AF37' }}
          >
            {subtitle}
          </p>
          <h2 className="font-serif text-xl sm:text-2xl text-[#333]">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] shrink-0 pb-0.5 transition-colors"
          style={{ color: currentVibe.accent }}
        >
          Бүгдийг
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-5 sm:px-6 lg:px-8 pb-2 snap-x snap-mandatory scroll-smooth"
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

        {/* "See All" tail card */}
        <Link
          href={viewAllHref}
          className="snap-start shrink-0 w-[140px] sm:w-[160px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all group"
          style={{ borderColor: `${currentVibe.accent}30` }}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors"
            style={{ backgroundColor: currentVibe.bg }}
          >
            <ChevronRight className="w-5 h-5" style={{ color: currentVibe.accent }} />
          </motion.div>
          <span className="text-xs font-bold" style={{ color: currentVibe.accent }}>
            Бүгдийг үзэх
          </span>
        </Link>
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
          particleCount: 12,
          spread: 40,
          startVelocity: 12,
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
          background: 'linear-gradient(135deg, #E06B8B, #C55B7A)',
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
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="snap-start shrink-0 w-[160px] sm:w-[180px]"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(224,107,139,0.06)] border border-[#D4AF37]/8 transition-all active:scale-[0.97]">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F6]">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="180px"
              className="object-cover"
            />
            {/* Rose gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />

            {/* Wishlist */}
            <motion.button
              whileTap={{ scale: 0.8 }}
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
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`}
              />
            </motion.button>

            {/* Discount badge */}
            {product.discountPercent && product.discountPercent > 0 && (
              <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-[#FF3B30] rounded-lg shadow-sm">
                <span className="text-[9px] font-black text-white">-{product.discountPercent}%</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-2.5">
            <h3 className="text-[12px] font-semibold text-[#333] line-clamp-2 leading-snug min-h-[32px] tracking-tight">
              {product.name}
            </h3>
            <div className="flex items-end justify-between mt-1.5">
              <div className="flex items-baseline gap-0.5">
                <span className="text-[15px] font-black tracking-tight" style={{ color: currentVibe.accent }}>
                  {formattedPrice}
                </span>
                {currency !== 'USD' && (
                  <span className="text-[9px] font-bold mb-0.5" style={{ color: `${currentVibe.accent}99` }}>₮</span>
                )}
              </div>
              <motion.button
                ref={cartBtnRef}
                whileTap={{ scale: 0.85 }}
                onClick={handleAddToCart}
                className="w-8 h-8 flex items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(224,107,139,0.2)] transition-all overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #E06B8B, #C55B7A)' }}
              >
                <ShoppingCart className="w-[14px] h-[14px] text-white relative z-10" strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
