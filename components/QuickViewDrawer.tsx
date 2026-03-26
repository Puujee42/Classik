'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, ShoppingBag, ChevronLeft, ChevronRight, Star, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

interface QuickViewProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image?: string | null;
  images?: string[];
  category: string;
  rating?: number;
  inventory?: number;
}

interface QuickViewDrawerProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewDrawer({ product, isOpen, onClose }: QuickViewDrawerProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useLanguage();

  if (!product) return null;

  const allImages: string[] = (() => {
    const combined: string[] = [];
    if (product.image) combined.push(product.image);
    if (product.images?.length) {
      product.images.forEach(img => { if (!combined.includes(img)) combined.push(img); });
    }
    return combined.length > 0 ? combined : ['/placeholder.png'];
  })();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      images: product.images,
      description: product.description || '',
      category: product.category,
      inventory: product.inventory || 99,
      stockStatus: 'in-stock',
    } as any, quantity);
    toast.success('Added to cart!', { icon: '🛍️' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Desktop: Side drawer | Mobile: Bottom sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-white z-[201] shadow-2xl hidden lg:flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/10">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Quick View</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#FCEEF2] transition-colors"
              >
                <X className="w-5 h-5 text-[#333]" strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Image carousel */}
            <div className="relative aspect-square bg-[#FAF9F6] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIdx}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={allImages[activeImageIdx]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="480px"
                  />
                </motion.div>
              </AnimatePresence>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx(p => Math.max(0, p - 1))}
                    disabled={activeImageIdx === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#333]" />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx(p => Math.min(allImages.length - 1, p + 1))}
                    disabled={activeImageIdx === allImages.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5 text-[#333]" />
                  </button>

                  {/* Thumbnail dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={`rounded-full transition-all duration-300 ${
                          activeImageIdx === i
                            ? 'w-6 h-2 bg-[#E06B8B]'
                            : 'w-2 h-2 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Discount badge */}
              {product.discountPercent && product.discountPercent > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#FF3B30] rounded-xl text-white text-xs font-black shadow-lg">
                  -{product.discountPercent}%
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-2">
                {product.category}
              </p>
              <h2 className="font-serif text-2xl text-[#333] mb-3 leading-tight">
                {product.name}
              </h2>

              {product.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating!) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-[#888] ml-1">({product.rating})</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-black text-[#E06B8B]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-[#AAA] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-[#666] text-sm font-light leading-relaxed mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#333]">Qty</span>
                <div className="flex items-center border border-[#D4AF37]/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 text-[#333] hover:bg-[#FCEEF2] transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="px-4 py-2.5 text-sm font-bold text-[#333] min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-2.5 text-[#333] hover:bg-[#FCEEF2] transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="px-6 py-4 border-t border-[#D4AF37]/10 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isWishlisted) {
                    removeFromWishlist(product.id);
                    toast.success('Removed from wishlist');
                  } else {
                    addToWishlist(product as any);
                    toast.success('Added to wishlist!', { icon: '💖' });
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWishlisted
                    ? 'bg-[#FCEEF2] border-[#E06B8B]/30 text-[#E06B8B]'
                    : 'border-[#D4AF37]/20 text-[#999] hover:text-[#E06B8B] hover:border-[#E06B8B]/30'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#E06B8B]' : ''}`} />
              </motion.button>

              <motion.button
                whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(224,107,139,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="flex-1 btn-rose py-3.5 text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </motion.button>

              <Link href={`/product/${product.id}`} onClick={onClose}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3.5 rounded-xl border border-[#D4AF37]/20 text-[#999] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Mobile: Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl z-[201] shadow-2xl lg:hidden flex flex-col overflow-hidden"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Image */}
              <div className="relative aspect-[4/3] bg-[#FAF9F6] mx-4 rounded-2xl overflow-hidden">
                <Image
                  src={allImages[activeImageIdx]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={`rounded-full transition-all ${activeImageIdx === i ? 'w-5 h-1.5 bg-[#E06B8B]' : 'w-1.5 h-1.5 bg-white/60'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-1">{product.category}</p>
                <h2 className="font-serif text-xl text-[#333] mb-2">{product.name}</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-black text-[#E06B8B]">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-[#AAA] line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 flex gap-3 border-t border-[#D4AF37]/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isWishlisted) removeFromWishlist(product.id);
                  else addToWishlist(product as any);
                }}
                className={`p-3 rounded-xl border ${isWishlisted ? 'bg-[#FCEEF2] border-[#E06B8B]/30 text-[#E06B8B]' : 'border-gray-200 text-gray-400'}`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#E06B8B]' : ''}`} />
              </button>
              <button onClick={handleAddToCart} className="flex-1 btn-rose py-3 text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
