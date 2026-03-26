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
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = useState(false);
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

    // 3D tilt handler
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setTilt({
            x: (y - 0.5) * -12, // rotateX
            y: (x - 0.5) * 12,  // rotateY
        });
        setGlare({ x: x * 100, y: y * 100 });
    }, []);

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        setTilt({ x: 0, y: 0 });
        setGlare({ x: 50, y: 50 });
    };

    return (
        <>
            <motion.div
                variants={itemVariants}
                className="group h-full touch-action-manipulation card-3d-container"
                style={{ touchAction: 'manipulation' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <div
                    ref={cardRef}
                    className="card-3d h-full"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        transform: isHovering
                            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
                            : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)',
                    }}
                >
                    <Link href={`/product/${product.id}`} className="block h-full" onClick={(e) => { if (isDragging.current) e.preventDefault(); }}>
                        <div className="card-classik overflow-hidden h-full flex flex-col relative group">
                            {/* 3D Glare overlay */}
                            <div
                                className="card-3d-glare rounded-[16px]"
                                style={{
                                    '--glare-x': `${glare.x}%`,
                                    '--glare-y': `${glare.y}%`,
                                    opacity: isHovering ? 1 : 0,
                                } as React.CSSProperties}
                            />

                            {/* Image Section with Slider */}
                            <div className="relative aspect-square overflow-hidden bg-[#FAF9F6] rounded-t-[16px]">
                                {/* Badges */}
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
                                    <ProductBadge
                                        sections={product.sections}
                                        isFeatured={product.featured}
                                        className="z-10"
                                    />
                                    {product.discountPercent && product.discountPercent > 0 && (
                                        <div className="px-2.5 py-1 bg-[#FF3B30] rounded-lg flex items-center shadow-lg shadow-red-500/20">
                                            <span className="text-[10px] sm:text-[11px] font-black text-white">
                                                -{product.discountPercent}%
                                            </span>
                                        </div>
                                    )}

                                    {(!product.sections || !product.sections.includes('Шинэ')) && !product.stockStatus && (
                                        <div className="px-2.5 py-1 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-full flex items-center shadow-sm">
                                            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-white uppercase">
                                                {product.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Wishlist + Quick-View Buttons */}
                                <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
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
                                        className="p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform"
                                    >
                                        <Heart
                                            className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                        />
                                    </motion.button>

                                    {/* Quick View button - appears on hover */}
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: isHovering ? 1 : 0, scale: isHovering ? 1 : 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        whileTap={{ scale: 0.8 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setQuickViewOpen(true);
                                        }}
                                        className="p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform"
                                    >
                                        <Eye className="w-4 h-4 text-[#D4AF37]" />
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
                                            <div key={i} className="w-full h-full shrink-0 relative">
                                                <Image
                                                    src={img}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-400 ease-in-out p-2"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <Image
                                        src={allImages[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-400 ease-in-out p-2"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                )}

                                {/* Dot Indicators */}
                                {hasMultiple && (
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                                        {allImages.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIdx(i); }}
                                                className={`rounded-full transition-all duration-300 ${activeIdx === i ? 'w-4 h-1.5 bg-[#E06B8B]' : 'w-1.5 h-1.5 bg-slate-300/80'}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Arrow Nav (Desktop hover only) */}
                                {hasMultiple && (
                                    <>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIdx(p => Math.max(0, p - 1)); }}
                                            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 text-slate-600 hover:text-[#E06B8B] disabled:opacity-0"
                                            disabled={activeIdx === 0}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIdx(p => Math.min(allImages.length - 1, p + 1)); }}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 text-slate-600 hover:text-[#E06B8B] disabled:opacity-0"
                                            disabled={activeIdx === allImages.length - 1}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-4 sm:p-5 flex flex-col flex-1">
                                <h3 className="text-sm sm:text-base font-bold text-[#333] leading-snug mb-3 line-clamp-2 tracking-tight group-hover:text-[#E06B8B] transition-colors">
                                    {product.name}
                                </h3>

                                <div className="mt-auto mb-4">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <div className="flex items-start">
                                            <span className="text-xs font-bold text-[#E06B8B] mr-0.5 mt-1">₮</span>
                                            <span className="text-xl sm:text-2xl font-black text-[#E06B8B] tracking-tight">
                                                {formatPriceWithCurrency(product.price).replace(/[^\d.,]/g, '')}
                                            </span>
                                        </div>

                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-xs font-medium text-[#AAA] line-through decoration-[#AAA]/50">
                                                {Math.round(product.originalPrice).toLocaleString()}₮
                                            </span>
                                        )}
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <ArrowRight className="w-3 h-3 text-[#AAA]" />
                                        )}
                                    </div>
                                </div>

                                <div className="w-full">
                                    <div className="relative w-full py-3 rounded-full bg-[#FCEEF2] text-[#E06B8B] font-bold text-xs uppercase tracking-[0.15em] group-hover:bg-[#E06B8B] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(224,107,139,0.3)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden">
                                        <span className="relative z-10">View Details</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
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
