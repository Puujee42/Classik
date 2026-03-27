'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import ProductBadge from '@/components/ProductBadge';
import QuickViewDrawer from '@/components/QuickViewDrawer';

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
                    <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 h-full flex flex-col relative overflow-hidden group">

                        {/* Image Section */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F8]">
                            {/* Badges */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
                                <ProductBadge
                                    sections={product.sections}
                                    isFeatured={product.featured}
                                    className="z-10"
                                />
                                {product.discountPercent && product.discountPercent > 0 && (
                                    <div className="px-2.5 py-1 bg-[#FF3B30] rounded-lg shadow-lg shadow-red-500/20">
                                        <span className="text-[11px] font-black text-white">
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
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setQuickViewOpen(true);
                                    }}
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300"
                                >
                                    <Eye className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-gray-400" strokeWidth={1.5} />
                                </motion.button>
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
                        <div className="p-4 sm:p-5 flex flex-col flex-1">
                            <h3 className="text-[11px] font-bold text-[#E27289] uppercase tracking-wider truncate mb-1 opacity-90 hover:opacity-100 transition-opacity">
                                {product.name}
                            </h3>

                            <div className="mt-2 flex items-baseline gap-1">
                                {product.originalPrice && product.originalPrice > product.price ? (
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-gray-400 line-through leading-none mb-1">
                                            {Math.round(product.originalPrice).toLocaleString()}₮
                                        </span>
                                        <div className="flex items-baseline">
                                            <span className="text-[12px] font-bold text-[#E27289] mr-0.5">₮</span>
                                            <span className="text-[22px] font-bold tracking-tight text-[#E27289] leading-none">
                                                {formatPriceWithCurrency(product.price).replace(/[^\d.,]/g, '')}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline">
                                        <span className="text-[12px] font-bold text-[#E27289] mr-0.5">₮</span>
                                        <span className="text-[22px] font-bold tracking-tight text-[#E27289] leading-none">
                                            {formatPriceWithCurrency(product.price).replace(/[^\d.,]/g, '')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="w-full mt-5">
                                <div className="w-full py-[10px] rounded-full bg-[#FFF4F6] text-[#E27289] text-[11px] uppercase tracking-[0.15em] font-bold flex items-center justify-center transition-colors hover:bg-[#FFE5EB]">
                                    VIEW DETAILS
                                </div>
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
