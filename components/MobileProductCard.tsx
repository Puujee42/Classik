'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { type Product } from '@/models/Product';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import ProductBadge from '@/components/ProductBadge';
import QuickViewDrawer from '@/components/QuickViewDrawer';
import confetti from 'canvas-confetti';

interface MobileProductCardProps {
    product: Product;
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
    const { convertPrice, currency } = useLanguage();
    const addItem = useCartStore((state) => state.addItem);
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const price = convertPrice(product.price);
    const [activeIdx, setActiveIdx] = useState(0);
    const isDragging = useRef(false);
    const [showActions, setShowActions] = useState(false);
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const cartBtnRef = useRef<HTMLButtonElement>(null);

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

    const formattedPrice = currency === 'USD'
        ? `$${price.toLocaleString()}`
        : `${formatCurrency(price)}`;

    // Long press for quick view
    const handleTouchStart = useCallback(() => {
        longPressTimer.current = setTimeout(() => {
            setQuickViewOpen(true);
            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(30);
        }, 500);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    // Add to cart with confetti micro-interaction
    const handleAddToCart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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

        // Mini confetti burst from the button
        if (cartBtnRef.current) {
            const rect = cartBtnRef.current.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 15,
                spread: 50,
                startVelocity: 15,
                origin: { x, y },
                colors: ['#E06B8B', '#D4AF37', '#FCEEF2', '#FFD700'],
                ticks: 80,
                gravity: 0.8,
                scalar: 0.7,
                shapes: ['circle'],
                disableForReducedMotion: true,
            });
        }

        // Haptic feedback
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
    }, [addItem, product]);

    return (
        <>
            <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(224,107,139,0.08)] border border-[#D4AF37]/8 will-change-transform"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                <Link href={`/product/${product.id}`} className="block" onClick={(e) => { if (isDragging.current || quickViewOpen) e.preventDefault(); }}>
                    <div className="relative aspect-square overflow-hidden bg-[#FAF9F6] rounded-t-2xl">
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
                                            sizes="(max-width: 768px) 50vw"
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <Image
                                src={allImages[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 50vw"
                                className="object-cover"
                            />
                        )}

                        {/* Signature rose gradient overlay on bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none" />

                        {/* Dot Indicators */}
                        {hasMultiple && (
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                                {allImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIdx(i); }}
                                        className={`rounded-full transition-all duration-300 ${activeIdx === i ? 'w-4 h-1.5 bg-[#E06B8B]' : 'w-1.5 h-1.5 bg-white/70'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 items-start">
                            <ProductBadge
                                sections={product.sections}
                                isFeatured={product.featured}
                                className="z-10 scale-90 origin-top-left"
                            />
                            {product.discountPercent && product.discountPercent > 0 && (
                                <div className="px-2 py-1 bg-[#FF3B30] rounded-lg shadow-lg shadow-red-500/20">
                                    <span className="text-[10px] font-black text-white">-{product.discountPercent}%</span>
                                </div>
                            )}
                        </div>

                        {/* Wishlist button */}
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (navigator.vibrate) navigator.vibrate(15);
                                if (isWishlisted) {
                                    removeFromWishlist(product.id);
                                    toast.success('Хүслийн жагсаалтаас хаслаа', { duration: 1200 });
                                } else {
                                    addToWishlist({ ...product } as any);
                                    toast.success('Хүслийн жагсаалтад нэмлээ!', { icon: '💖', duration: 1200 });
                                }
                            }}
                            className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md"
                        >
                            <Heart
                                className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400'}`}
                            />
                        </motion.button>

                        {/* Quick View button */}
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewOpen(true);
                                if (navigator.vibrate) navigator.vibrate(20);
                            }}
                            className="absolute bottom-8 right-2 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-[#D4AF37]/15"
                        >
                            <Eye className="w-4 h-4 text-[#D4AF37]" />
                        </motion.button>
                    </div>

                    <div className="p-3 flex flex-col gap-1">
                        <h3 className="text-[13px] font-semibold text-[#333] line-clamp-2 leading-snug min-h-[36px] tracking-tight">
                            {product.name}
                        </h3>

                        <div className="flex flex-col gap-0.5 mt-1">
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] font-medium text-[#AAA] line-through">
                                    {Math.round(product.originalPrice).toLocaleString()}₮
                                </span>
                            )}
                            <div className="flex items-end justify-between">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-lg font-black text-[#E06B8B] tracking-tight">
                                        {formattedPrice}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#E06B8B]/70 mb-0.5">₮</span>
                                </div>

                                {/* Add to Cart with confetti */}
                                <motion.button
                                    ref={cartBtnRef}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={handleAddToCart}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl shadow-[0_4px_15px_rgba(224,107,139,0.25)] active:shadow-[0_2px_6px_rgba(224,107,139,0.2)] transition-all overflow-hidden relative"
                                    style={{
                                        background: 'linear-gradient(135deg, #E06B8B, #C55B7A)',
                                    }}
                                >
                                    <ShoppingCart className="w-[18px] h-[18px] text-white relative z-10" strokeWidth={1.5} />
                                    {/* Shimmer glide */}
                                    <motion.div
                                        className="absolute inset-0"
                                        style={{
                                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                                            backgroundSize: '200% 100%',
                                        }}
                                        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Quick View Drawer (bottom sheet on mobile) */}
            <QuickViewDrawer
                product={quickViewOpen ? (product as any) : null}
                isOpen={quickViewOpen}
                onClose={() => setQuickViewOpen(false)}
            />
        </>
    );
}
