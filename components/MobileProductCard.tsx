'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { type Product } from '@/models/Product';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import ProductBadge from '@/components/ProductBadge';

interface MobileProductCardProps {
    product: Product;
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
    const { convertPrice, currency } = useLanguage();
    const addItem = useCartStore((state) => state.addItem);
    const price = convertPrice(product.price);
    const [activeIdx, setActiveIdx] = useState(0);
    const isDragging = useRef(false);

    // Build images array: combine main image + additional images, deduplicate
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

    // Format price
    const formattedPrice = currency === 'USD'
        ? `$${price.toLocaleString()}`
        : `${formatCurrency(price)}`;

    return (
        <motion.div
            whileTap={{ scale: 0.97 }} 
            transition={{ type: 'spring', stiffness: 400, damping: 30 }} 
            className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/50 will-change-transform"
        >
            <Link href={`/product/${product.id}`} className="block" onClick={(e) => { if (isDragging.current) e.preventDefault(); }}>
                <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-2xl">
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

                    {/* Dot Indicators */}
                    {hasMultiple && (
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIdx(i); }}
                                    className={`rounded-full transition-all duration-300 ${activeIdx === i ? 'w-4 h-1.5 bg-[#FF5000]' : 'w-1.5 h-1.5 bg-white/70'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Premium Status & Discount Badges */}
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
                        {product.stockStatus === 'in-stock' && (
                            <div className="px-2 py-1 bg-white/60 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">БЭЛЭН</span>
                            </div>
                        )}
                        {product.stockStatus === 'pre-order' && (
                            <div className="px-2 py-1 bg-white/60 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">ЗАХИАЛГА</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3 flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed min-h-[44px]">
                        {product.name}
                    </h3>

                    <div className="flex flex-col gap-0.5 mt-1">
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] font-medium text-[#AAA] line-through">
                                {Math.round(product.originalPrice).toLocaleString()}₮
                            </span>
                        )}
                        <div className="flex items-end justify-between">
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-[#FF6B00]">
                                    {formattedPrice}
                                </span>
                                <span className="text-xs font-bold text-[#FF6B00] mb-0.5"> ₮</span>
                            </div>

                            {/* Minimalist Cart Button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
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
                                    toast.success('Сагсанд нэмлээ', {
                                        style: { borderRadius: '14px', background: '#FF5000', color: '#fff' },
                                        duration: 1500,
                                    });
                                }}
                                className="w-10 h-10 flex items-center justify-center bg-[#FF5000] text-white rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                            >
                                <ShoppingCart className="w-5 h-5" strokeWidth={1.2} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

