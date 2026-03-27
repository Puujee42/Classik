'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, ChevronLeft, ChevronRight, Eye, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import ProductBadge from '@/components/ProductBadge';
import QuickViewDrawer from '@/components/QuickViewDrawer';
import { useVibe } from '@/context/VibeContext';

interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    sections?: string[];
    image?: string | null;
    images?: string[];
    category: string;
    stockStatus?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    discount?: number;
    inventory?: number;
    rating?: number;
    featured?: boolean;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.25
        } as any
    },
};

export default function PremiumProductCard({ product, isFeatured = false }: { product: Product, isFeatured?: boolean }) {
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const { formatPrice: formatPriceWithCurrency } = useLanguage();
    const { t } = useTranslation();
    const [activeIdx, setActiveIdx] = useState(0);
    const isDragging = useRef(false);
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const { currentVibe } = useVibe();

    const isWishlisted = isInWishlist(product.id);

    // Build images array
    const allImages: string[] = (() => {
        const combined: string[] = [];
        if (product.image) combined.push(product.image);
        if (product.images?.length) {
            product.images.forEach(img => {
                if (!combined.includes(img)) combined.push(img);
            });
        }
        return combined.length > 0 ? combined : ['/placeholder.png'];
    })();

    const hasMultiple = allImages.length > 1;

    return (
        <>
            <motion.div
                variants={itemVariants}
                className="group h-full touch-action-manipulation"
                whileTap={{ scale: 0.98 }}
            >
                <Link href={`/product/${product.id}`} className="block h-full" onClick={(e) => { if (isDragging.current || quickViewOpen) e.preventDefault(); }}>
                    <div className="h-full flex flex-col relative group">

                        {/* Image Section */}
                        <div className="relative aspect-square overflow-hidden bg-[#F5F5F5] rounded-2xl mb-3">
                            {/* Badges */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
                                <ProductBadge
                                    sections={product.sections}
                                    isFeatured={product.featured}
                                    className="z-10"
                                />
                                {product.discountPercent && product.discountPercent > 0 && (
                                    <div className="px-2 py-0.5 rounded-full" style={{ backgroundColor: currentVibe.accent }}>
                                        <span className="text-[10px] font-bold text-white flex items-center gap-1">
                                            -{product.discountPercent}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Wishlist + Quick-View Buttons */}
                            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex flex-col gap-1 sm:gap-1.5">
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isWishlisted) {
                                            removeFromWishlist(product.id);
                                            toast.success(t('product', 'removedFromWishlist'));
                                        } else {
                                            addToWishlist({ ...product } as any);
                                            toast.success(t('product', 'addedToWishlist'));
                                        }
                                    }}
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                    <Heart
                                        className={`w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] ${isWishlisted ? 'fill-[#E27289] text-[#E27289]' : 'text-gray-400'}`}
                                        strokeWidth={isWishlisted ? 0 : 1.5}
                                    />
                                </motion.button>

                                {/* Quick View button - appears on hover */}

                            </div>

                            {/* Hover Add to Cart */}
                            <div className="absolute bottom-3 left-3 right-3 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        import('@/store/cartStore').then(({ useCartStore }) => {
                                            useCartStore.getState().addItem({
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                image: product.image || '',
                                                stockStatus: (product.stockStatus as any) || 'in-stock',
                                                category: product.category || '',
                                            });
                                            import('react-hot-toast').then(({ default: toast }) => toast.success('Сагсанд нэмлээ'));
                                        });
                                    }}
                                    className="w-full py-2.5 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm"
                                    style={{ backgroundColor: currentVibe.accent }}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Сагсанд хийх
                                </button>
                            </div>

                            {/* Image Slider */}
                            {hasMultiple ? (
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.1}
                                    onDragStart={() => { isDragging.current = true; }}
                                    onDragEnd={(_, info) => {
                                        if (Math.abs(info.offset.x) > 50) {
                                            if (info.offset.x < 0 && activeIdx < allImages.length - 1) setActiveIdx(p => p + 1);
                                            else if (info.offset.x > 0 && activeIdx > 0) setActiveIdx(p => p - 1);
                                        }
                                        setTimeout(() => { isDragging.current = false; }, 10);
                                    }}
                                    animate={{ x: `-${activeIdx * 100}%` }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="flex w-full h-full"
                                >
                                    {allImages.map((img, i) => (
                                        <div
                                            key={i}
                                            className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 shrink-0"
                                        >
                                            <Image
                                                src={img}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority={i === 0} // Optional: load first image faster
                                            />
                                            {/* Subtle inner overlay for depth */}
                                            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <Image
                                    src={allImages[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    priority
                                />

                            )}

                            {/* Dot Indicators */}
                            {hasMultiple && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
                                    {allImages.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIdx(i); }}
                                            className={`rounded-full transition-all duration-300 ${activeIdx === i ? 'w-4 h-1.5 bg-[#E27289]' : 'w-1.5 h-1.5 bg-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="flex flex-col flex-1 px-1">
                            <h3 className="text-[13px] sm:text-[14px] font-bold text-[#333] truncate mb-1">
                                {product.name}
                            </h3>

                            {/* Stars */}
                            <div className="flex items-center gap-0.5 mb-2">
                                {[1,2,3,4,5].map(star => (
                                    <svg key={star} className="w-3 h-3 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            <div className="mt-auto flex items-baseline gap-2">
                                <span className="text-[15px] sm:text-[16px] font-bold leading-none" style={{ color: currentVibe.accent }}>
                                    {formatPriceWithCurrency(product.price).replace(/[^\d.,]/g, '')}₮
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-[11px] sm:text-[12px] text-gray-400 line-through leading-none">
                                        {Math.round(product.originalPrice).toLocaleString()}₮
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Quick View Drawer */}
            <QuickViewDrawer
                product={quickViewOpen ? product : null}
                isOpen={quickViewOpen}
                onClose={() => setQuickViewOpen(false)}
            />
        </>
    );
}
