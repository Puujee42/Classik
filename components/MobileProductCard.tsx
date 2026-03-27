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
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const cartBtnRef = useRef<HTMLButtonElement>(null);

    const isWishlisted = isInWishlist(product.id);

    const allImages = product.images?.length ? product.images : (product.image ? [product.image] : ['/placeholder.png']);
    const hasMultiple = allImages.length > 1;

    const formattedPrice = currency === 'USD'
        ? `$${price.toLocaleString()}`
        : `${formatCurrency(price)}`;

    const handleTouchStart = useCallback(() => {
        longPressTimer.current = setTimeout(() => {
            setQuickViewOpen(true);
            if (navigator.vibrate) navigator.vibrate(30);
        }, 500);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

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
        });

        if (cartBtnRef.current) {
            const rect = cartBtnRef.current.getBoundingClientRect();
            confetti({
                particleCount: 15,
                spread: 45,
                startVelocity: 12,
                origin: {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                },
                colors: ['#E27289', '#FFF4F6', '#D4AF37'],
                ticks: 60,
                gravity: 0.8,
                scalar: 0.5,
                shapes: ['circle'],
                disableForReducedMotion: true,
            });
        }

        if (navigator.vibrate) navigator.vibrate(20);
        toast.success('Сагсанд нэмлээ', {
            style: {
                borderRadius: '12px',
                background: '#E27289',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
            },
            icon: '🛍️',
            duration: 1500,
        });
    }, [addItem, product]);

    return (
        <>
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="group h-full flex flex-col relative transition-all duration-300"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                <Link href={`/product/${product.id}`} className="block h-full" onClick={(e) => { if (isDragging.current || quickViewOpen) e.preventDefault(); }}>
                    <div className="relative aspect-square overflow-hidden bg-[#F5F5F5] rounded-xl mb-2.5">
                        
                        {/* Discount Badge */}
                        {product.discountPercent && product.discountPercent > 0 && (
                            <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#E27289' }}>
                                <span className="text-[9px] font-bold text-white flex items-center gap-0.5">
                                    -{product.discountPercent}%
                                </span>
                            </div>
                        )}
                        {/* Image Slider */}
                        {hasMultiple ? (
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.1}
                                onDragStart={() => { isDragging.current = true; }}
                                onDragEnd={(_, info) => {
                                    if (Math.abs(info.offset.x) > 40) {
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
                                        <Image src={img} alt={product.name} fill sizes="50vw" className="object-cover" />
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <Image src={allImages[0]} alt={product.name} fill sizes="50vw" className="object-cover" />
                        )}

                        {hasMultiple && (
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                                {allImages.map((_, i) => (
                                    <div key={i} className={`rounded-full transition-all duration-300 ${activeIdx === i ? 'w-3 h-1 bg-[#E27289]' : 'w-1 h-1 bg-gray-300/80'}`} />
                                ))}
                            </div>
                        )}

                        {/* Top-Right Stacked Icons (Wishlist + Quick View) */}
                        {/* Single, clean absolute wrapper */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                            {/* Wishlist Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (navigator.vibrate) navigator.vibrate(15);
                                    if (isWishlisted) removeFromWishlist(product.id);
                                    else addToWishlist({ ...product } as any);
                                }}
                                // FORCED SIZING: p-0, flex-none, and exact pixel brackets
                                className="group/btn p-0 flex-none w-[28px] h-[28px] min-w-[28px] min-h-[28px] rounded-full bg-white/95 shadow-sm flex items-center justify-center border border-black/5 transition-all hover:bg-white active:scale-90"
                            >
                                <Heart
                                    className={`w-[14px] h-[14px] transition-colors duration-300 ${isWishlisted ? 'fill-[#E27289] text-[#E27289]' : 'text-slate-500 group-hover/btn:text-black'
                                        }`}
                                    strokeWidth={isWishlisted ? 0 : 1.5}
                                />
                            </button>

                            {/* Quick View Button */}

                        </div>
                    </div>

                    <div className="flex flex-col flex-1 px-0.5">
                        <h3 className="text-[12px] font-bold text-[#333] truncate mb-1 leading-tight">
                            {product.name}
                        </h3>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-2.5 h-2.5 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[14px] font-bold leading-none text-[#E27289]">
                                    {formattedPrice.replace(/[^\d.,]/g, '')}₮
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-[10px] text-gray-400 line-through leading-none">
                                        {Math.round(product.originalPrice).toLocaleString()}₮
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            <QuickViewDrawer
                product={quickViewOpen ? (product as any) : null}
                isOpen={quickViewOpen}
                onClose={() => setQuickViewOpen(false)}
            />
        </>
    );
}
