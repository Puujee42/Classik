'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Image from 'next/image';
import { X, Heart, ShoppingBag, Minus, Plus, BadgeCheck, Truck, ShieldCheck, RotateCcw, ArrowRight, Star, ArrowLeft, Package, Lock, FileText, List, CheckCircle2, ChevronLeft, ChevronRight, Share2, Clock } from 'lucide-react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/models/Product';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import RelatedProducts from './RelatedProducts';
import ProductReviews from './ProductReviews';

export type ProductDetailData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountPercent?: number;
  image: string | null;
  images?: string[];
  category: string;
  stockStatus: string;
  inventory?: number;
  shippingOrigin?: string;
  shippingDestination?: string;
  dispatchTime?: string;
  sizeGuideUrl?: string;
  brand?: string;
  model?: string;
  delivery?: string;
  paymentMethods?: string;
  createdAt?: string;
  updatedAt?: string;
  sections?: string[];
  featured?: boolean;
  relatedProducts?: Product[];
  attributes?: Record<string, any>;
  reviews?: any[]; // Add reviews to the product type
  options?: any[];
  variants?: any[];
  subcategory?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// ANTIGRAVITY PHYSICS HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useAntigravity<T extends HTMLElement = HTMLDivElement>(
  maxX = 12, maxY = 8, lerpAmt = 0.04, decay = 0.72
) {
  const ref = useRef<T>(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);
  const rafId = useRef<number>();
  const isEnabled = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isCoarse || prefersReducedMotion) {
        isEnabled.current = false;
      }
    }
  }, []);

  const update = useCallback(() => {
    if (!isEnabled.current) return;
    if (!isHovered.current) {
      target.current.x *= decay;
      target.current.y *= decay;
    }
    position.current.x += (target.current.x - position.current.x) * lerpAmt;
    position.current.y += (target.current.y - position.current.y) * lerpAmt;
    if (ref.current) {
      ref.current.style.transform = `translate3d(${position.current.x}px,${position.current.y}px,0)`;
    }
    if (!isHovered.current && Math.abs(position.current.x) < 0.01 && Math.abs(position.current.y) < 0.01) {
      position.current.x = 0; position.current.y = 0;
      if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)';
      return;
    }
    rafId.current = requestAnimationFrame(update);
  }, [decay, lerpAmt]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEnabled.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
    target.current.x = dx * maxX;
    target.current.y = dy * maxY;
  };

  const handleMouseEnter = () => {
    if (!isEnabled.current) return;
    isHovered.current = true;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(update);
  };

  const handleMouseLeave = () => {
    if (!isEnabled.current) return;
    isHovered.current = false;
    target.current.x = 0; target.current.y = 0;
  };

  useEffect(() => () => { if (rafId.current) cancelAnimationFrame(rafId.current); }, []);
  return { ref, handleMouseMove, handleMouseEnter, handleMouseLeave };
}

function useMagnetic(radius = 80, lerpAmt = 0.12, decay = 0.72) {
  const ref = useRef<HTMLButtonElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);
  const rafId = useRef<number>();
  const isEnabled = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isCoarse || prefersReducedMotion) {
        isEnabled.current = false;
      }
    }
  }, []);

  const update = useCallback(() => {
    if (!isEnabled.current) return;
    if (!isHovered.current) { target.current.x *= decay; target.current.y *= decay; }
    position.current.x += (target.current.x - position.current.x) * lerpAmt;
    position.current.y += (target.current.y - position.current.y) * lerpAmt;
    if (ref.current) ref.current.style.transform = `translate3d(${position.current.x}px,${position.current.y}px,0)`;
    if (!isHovered.current && Math.abs(position.current.x) < 0.01 && Math.abs(position.current.y) < 0.01) {
      position.current.x = 0; position.current.y = 0;
      if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)';
      return;
    }
    rafId.current = requestAnimationFrame(update);
  }, [decay, lerpAmt]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isEnabled.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      if (dist < radius) {
        if (!isHovered.current) { isHovered.current = true; if (rafId.current) cancelAnimationFrame(rafId.current); rafId.current = requestAnimationFrame(update); }
        const s = 1 - dist / radius;
        target.current.x = (e.clientX - cx) * 0.4 * s;
        target.current.y = (e.clientY - cy) * 0.4 * s;
      } else if (isHovered.current) {
        isHovered.current = false; target.current.x = 0; target.current.y = 0;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [radius, update]);

  return { ref };
}

function useParallaxTilt(maxRotate = 4, perspective = 800, lerpAmt = 0.1, decay = 0.8) {
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef({ rx: 0, ry: 0 });
  const target = useRef({ rx: 0, ry: 0 });
  const isHovered = useRef(false);
  const rafId = useRef<number>();
  const isEnabled = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isCoarse || prefersReducedMotion) {
        isEnabled.current = false;
      }
    }
  }, []);

  const update = useCallback(() => {
    if (!isEnabled.current) return;
    if (!isHovered.current) { target.current.rx *= decay; target.current.ry *= decay; }
    position.current.rx += (target.current.rx - position.current.rx) * lerpAmt;
    position.current.ry += (target.current.ry - position.current.ry) * lerpAmt;
    if (ref.current) ref.current.style.transform = `perspective(${perspective}px) rotateX(${position.current.rx}deg) rotateY(${position.current.ry}deg)`;
    if (!isHovered.current && Math.abs(position.current.rx) < 0.01 && Math.abs(position.current.ry) < 0.01) {
      position.current.rx = 0; position.current.ry = 0;
      if (ref.current) ref.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
      return;
    }
    rafId.current = requestAnimationFrame(update);
  }, [perspective, lerpAmt, decay]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEnabled.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
    target.current.rx = dy * -maxRotate;
    target.current.ry = dx * maxRotate;
  };

  const handleMouseEnter = () => {
    if (!isEnabled.current) return;
    isHovered.current = true;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(update);
  };

  const handleMouseLeave = () => {
    if (!isEnabled.current) return;
    isHovered.current = false; target.current.rx = 0; target.current.ry = 0;
  };

  useEffect(() => () => { if (rafId.current) cancelAnimationFrame(rafId.current); }, []);
  return { ref, handleMouseMove, handleMouseEnter, handleMouseLeave };
}

function useFloatingOrb(lerpAmt = 0.035) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>();
  const isEnabled = useRef(true);
  const isActive = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isCoarse || prefersReducedMotion) {
        isEnabled.current = false;
      }
    }
  }, []);

  const update = useCallback(() => {
    if (!isEnabled.current) return;

    // Smoothly return to center when not active
    if (!isActive.current) {
      target.current.x *= 0.9;
      target.current.y *= 0.9;
    }

    position.current.x += (target.current.x - position.current.x) * lerpAmt;
    position.current.y += (target.current.y - position.current.y) * lerpAmt;

    if (ref.current) {
      ref.current.style.transform = `translate3d(${position.current.x}px,${position.current.y}px,0)`;
    }

    if (!isActive.current && Math.abs(position.current.x) < 0.5 && Math.abs(position.current.y) < 0.5) {
      if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)';
      return;
    }

    rafId.current = requestAnimationFrame(update);
  }, [lerpAmt]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isEnabled.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Check if mouse is near or inside container
      if (e.clientX >= rect.left - 200 && e.clientX <= rect.right + 200 &&
        e.clientY >= rect.top - 200 && e.clientY <= rect.bottom + 200) {
        if (!isActive.current) {
          isActive.current = true;
          if (rafId.current) cancelAnimationFrame(rafId.current);
          rafId.current = requestAnimationFrame(update);
        }
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const maxX = rect.width / 2 - 90, maxY = rect.height / 2 - 90;
        target.current.x = Math.max(-maxX, Math.min(maxX, e.clientX - cx));
        target.current.y = Math.max(-maxY, Math.min(maxY, e.clientY - cy));
      } else if (isActive.current) {
        isActive.current = false;
        target.current.x = 0;
        target.current.y = 0;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [update]);

  return { ref, containerRef };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductDetailClient({ product, initialReviews }: { product: ProductDetailData, initialReviews: any[] }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const { data: categoriesData } = useSWR('/api/categories', (url) => fetch(url).then(r => r.json()));
  const categories = categoriesData?.categories || [];

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Auto-select option if there is only 1 value
  useEffect(() => {
    if (product.options?.length) {
      const initial: Record<string, string> = {};
      product.options.forEach((opt: any) => {
        if (opt.values.length === 1) {
          initial[opt.name] = opt.values[0];
        }
      });
      if (Object.keys(initial).length > 0) {
        setSelectedOptions(prev => ({ ...prev, ...initial }));
      }
    }
  }, [product.options]);

  const selectedVariant = useMemo(() => {
    if (!product.variants?.length) return null;
    return product.variants.find((v: any) =>
      product.options?.every((opt: any) => v.options[opt.name] === selectedOptions[opt.name])
    ) || null;
  }, [selectedOptions, product.variants, product.options]);

  const displayPrice = selectedVariant?.price || product.price;
  const displayInventory = selectedVariant ? selectedVariant.inventory : (product.inventory ?? 0);
  const isOutOfStock = product.options?.length ? (!selectedVariant || displayInventory <= 0) : (displayInventory <= 0);

  const canAddToCart = !isOutOfStock && (!product.options?.length || (
    product.options.every((o: any) => selectedOptions[o.name]) &&
    selectedVariant && selectedVariant.inventory > 0
  ));

  const { addItem, toggleAllSelection } = useCartStore();
  const { t } = useTranslation();

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on('change', (y) => setIsScrolled(y > 300));
    return () => unsub();
  }, [scrollY]);


  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`/api/user/wishlist?productId=${product.id}`)
      .then(r => r.json())
      .then(data => setIsWishlisted(!!data.isWishlisted))
      .catch(() => null);
  }, [product.id, isAuthenticated]);

  const images: string[] = (() => {
    const combined: string[] = [];
    if (product.image) combined.push(product.image);
    if (product.images?.length) {
      product.images.forEach(img => {
        if (!combined.includes(img)) combined.push(img);
      });
    }
    return combined.length > 0 ? combined : ['/placeholder-product.png'];
  })();

  const discount = product.originalPrice && product.originalPrice > displayPrice
    ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)
    : 0;

  const savings = product.originalPrice && product.originalPrice > displayPrice
    ? product.originalPrice - displayPrice
    : 0;

  const categoryObj = categories.find((c: any) => c.id === product.category);
  const categoryName = categoryObj ? categoryObj.name : product.category;

  let subcategoryName = null;
  if (product.subcategory && categoryObj?.subcategories) {
    const subObj = categoryObj.subcategories.find((s: any) => s.id === product.subcategory);
    if (subObj) subcategoryName = subObj.name;
  }

  // ── Handlers ───────────────────────────────────────────────
  const handleWishlist = async () => {
    if (!isAuthenticated) return toast.error('Нэвтрэх шаардлагатай', { style: { borderRadius: '16px' } });
    const next = !isWishlisted;
    setIsWishlisted(next); // optimistic
    try {
      await fetch('/api/user/wishlist', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      toast.success(next ? 'Хүсэлд нэмсэн' : 'Хүслээс хассан');
    } catch {
      setIsWishlisted(!next); // rollback
      toast.error('Алдаа гарлаа');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url: window.location.href }); } catch { }
    } else {
      toast.success('Link copied to clipboard');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddToCart = () => {
    if (product.options?.length && !product.options.every(o => selectedOptions[o.name])) {
      toast.error('Сонголтуудаа гүйцэд сонгоно үю', { style: { borderRadius: '16px' } });
      return;
    }
    if (isOutOfStock) {
      toast.error('Агуулахад үлдэгдэл хүрэлцэхгүй байна', { style: { borderRadius: '16px' } });
      return;
    }

    addItem({
      ...product,
      image: product.image || '',
      stockStatus: product.stockStatus as any,
      description: product.description || undefined,
      price: displayPrice,
      variantId: selectedVariant?.id,
      selectedOptions: product.options?.length ? selectedOptions : undefined,
    }, quantity, false);

    toast.custom((tInst) => (
      <div className={`${tInst.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4`}>
        <div className="flex items-start">
          <CheckCircle2 className="h-8 w-8 text-[#E06B8B]" />
          <div className="ml-3">
            <p className="font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>Сагсанд орлоо</p>
            <p className="mt-1 text-sm text-slate-500">{product.name}</p>
          </div>
        </div>
      </div>
    ));
  };

  const handleBuyNow = async () => {
    if (product.options?.length && !product.options.every((o: any) => selectedOptions[o.name])) {
      toast.error('Сонголтуудаа гүйцэд сонгоно үю', { style: { borderRadius: '16px' } });
      return;
    }
    if (isOutOfStock) {
      toast.error('Агуулахад үлдэгдэл хүрэлцэхгүй байна', { style: { borderRadius: '16px' } });
      return;
    }

    toggleAllSelection(false);
    await addItem({
      ...product,
      image: product.image || '',
      stockStatus: product.stockStatus as any,
      description: product.description || undefined,
      price: displayPrice,
      variantId: selectedVariant?.id,
      selectedOptions: product.options?.length ? selectedOptions : undefined,
    }, quantity, true);
    router.push('/checkout');
  };

  // ── Physics hooks ──────────────────────────────────────────────────────────
  const mainImgPhysics = useAntigravity<HTMLDivElement>(12, 8, 0.04, 0.72);
  const minusPhysics = useAntigravity<HTMLButtonElement>(8, 8, 0.06, 0.7);
  const plusPhysics = useAntigravity<HTMLButtonElement>(8, 8, 0.06, 0.7);
  const magneticBuy = useMagnetic(80, 0.12, 0.72);
  const tilt = useParallaxTilt(4, 800);
  const orb = useFloatingOrb(0.035);

  return (
    <>
      {/* ── Font injection ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
        .font-dm  { font-family: 'DM Sans', sans-serif; }
        .font-editorial { font-family: 'Cormorant Garamond', serif; }
        body { background-color: #FAFAF9; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}} />

      <div className="min-h-screen pb-[140px] md:pb-20 font-dm bg-[#FAFAF9] text-slate-600 overflow-hidden">

        {/* Mobile back button */}
        <div
          className="lg:hidden fixed top-0 left-0 z-[110] p-3"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md border border-slate-100/80"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* ── Sticky header — Skincare Pill Style ─────────────────────────── */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ y: -64, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -64, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 left-0 right-0 z-[100] hidden md:block"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(224,107,139,0.08)', boxShadow: '0 2px 20px rgba(224,107,139,0.06)' }}
            >
              <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-rose-100/50 bg-[#FFF5F8] shrink-0 relative">
                    <Image src={product.image || '/placeholder-product.png'} alt={product.name} fill className="object-contain p-1.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-1 max-w-xs">{product.name}</p>
                    <p className="font-sora font-bold text-[#E06B8B] text-sm leading-none mt-0.5">{formatPrice(displayPrice * quantity)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart}
                    className="px-5 py-2.5 rounded-full bg-[#FFF0F4] text-[#E06B8B] font-bold text-sm hover:bg-[#FFE0EA] transition-colors border border-rose-200/50">
                    Сагсанд нэмэх
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleBuyNow}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E06B8B] to-[#D55A7B] text-white font-bold text-sm shadow-lg shadow-[#E06B8B]/25 hover:shadow-xl transition-all">
                    Шууд авах
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-0 pb-6 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            {/* ── LEFT: GALLERY ───────────────────────────────────────────── */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">

              {/* Main image — Skincare Hero */}
              <div
                className="group relative w-full skincare-hero-gradient overflow-hidden md:rounded-[2rem] md:border md:border-rose-100/60 md:shadow-sm md:aspect-square"
                style={{ aspectRatio: '1/1' }}
                onMouseMove={mainImgPhysics.handleMouseMove}
                onMouseEnter={mainImgPhysics.handleMouseEnter}
                onMouseLeave={mainImgPhysics.handleMouseLeave}
              >
                {/* Decorative blobs */}
                <div className="absolute top-10 left-10 w-40 h-40 bg-[#FDDCE5] skincare-hero-blob skincare-blob-pulse" />
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FDE8D8] skincare-hero-blob skincare-blob-pulse" style={{ animationDelay: '2s' }} />

                {/* Desktop fade image */}
                <div className="hidden md:block w-full h-full" onClick={() => setShowLightbox(true)}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="w-full h-full cursor-zoom-in absolute inset-0 flex items-center justify-center p-8"
                    >
                      <div ref={mainImgPhysics.ref} className="w-full h-full relative origin-center">
                        <Image src={images[activeImageIndex]} alt={product.name} fill className="object-contain pointer-events-none drop-shadow-lg" priority />
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Desktop arrow nav */}
                  {images.length > 1 && (<>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveImageIndex(p => Math.max(0, p - 1)); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-rose-100/50 text-slate-500 hover:text-[#E06B8B] disabled:opacity-30"
                      disabled={activeImageIndex === 0}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveImageIndex(p => Math.min(images.length - 1, p + 1)); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-rose-100/50 text-slate-500 hover:text-[#E06B8B] disabled:opacity-30"
                      disabled={activeImageIndex === images.length - 1}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>)}
                </div>

                {/* Mobile swipe carousel */}
                <div className="md:hidden w-full h-full relative overflow-hidden" onClick={() => setShowLightbox(true)}>
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -80 && activeImageIndex < images.length - 1) setActiveImageIndex(p => p + 1);
                      else if (info.offset.x > 80 && activeImageIndex > 0) setActiveImageIndex(p => p - 1);
                    }}
                    animate={{ x: `-${activeImageIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex w-full h-full"
                  >
                    {images.map((img, i) => (
                      <div key={i} className="w-full h-full shrink-0 relative p-3 md:p-6">
                        <Image src={img} alt="" fill className="object-contain pointer-events-none" priority={i === 0} />
                      </div>
                    ))}
                  </motion.div>
                  {/* Dots */}
                  <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
                    {images.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === i ? 'w-6 bg-[#E06B8B]' : 'w-2 bg-slate-300'}`} />
                    ))}
                  </div>
                  {/* Count badge */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {activeImageIndex + 1}/{images.length}
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-5 left-5 flex flex-col gap-2 z-10 select-none">
                  {discount > 0 && (
                    <div className="px-3.5 py-1.5 bg-gradient-to-r from-[#E06B8B] to-[#F2A0B5] text-white rounded-full shadow-lg shadow-[#E06B8B]/20 w-fit">
                      <span className="text-[10px] font-black uppercase tracking-widest">-{discount}%</span>
                    </div>
                  )}
                </div>

                {/* FABs */}
                <div className="absolute top-5 right-5 flex flex-col gap-2.5 z-10">
                  <motion.button whileTap={{ scale: 0.88 }} onClick={e => { e.stopPropagation(); handleWishlist(); }}
                    className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-rose-100/50 text-slate-400 hover:text-red-500 transition-colors">
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={2} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }} onClick={e => { e.stopPropagation(); handleShare(); }}
                    className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-rose-100/50 text-slate-400 hover:text-blue-500 transition-colors">
                    <Share2 className="w-5 h-5" strokeWidth={2} />
                  </motion.button>
                </div>
              </div>

              {/* Thumbnail strip — pill style */}
              {images.length > 1 && (
                <div className="hidden md:flex gap-3 overflow-x-auto hide-scrollbar py-2 px-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setActiveImageIndex(i)}
                      onClick={() => setActiveImageIndex(i)}
                      className="relative shrink-0"
                    >
                      <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 transition-all duration-200 ${activeImageIndex === i
                        ? 'border-[#E06B8B] shadow-[0_0_0_4px_rgba(224,107,139,0.1)]'
                        : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-200'
                        }`}>
                        <div className="w-full h-full relative p-1.5">
                          <Image src={img} alt="" fill className="object-contain" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Skincare Benefit Strip — Dynamic from product data */}
              <SkincarebenefitStrip product={product} />
            </div>

            {/* ── RIGHT: INFO PANEL — SKINCARE BEAUTY STORY ────────────────────────────────── */}
            <div ref={orb.containerRef} className="lg:col-span-6 xl:col-span-5 relative md:mt-0 -mt-6">

              {/* Floating orb */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-[3rem] hidden md:block" style={{ margin: '-2rem' }}>
                <div
                  ref={orb.ref}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl rounded-full"
                  style={{ width: 180, height: 180, background: 'radial-gradient(circle, rgba(224,107,139,0.12) 0%, transparent 70%)' }}
                />
              </div>

              <div className="relative z-10 flex flex-col bg-white md:bg-transparent px-5 md:px-0 pt-6 md:pt-0">
                
                {/* Brand Tag */}
                {product.brand && (
                  <span className="skincare-brand-tag mb-2">{product.brand}</span>
                )}

                {/* Product Title — Editorial */}
                <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-snug mb-2 tracking-tight">
                  {product.name}
                </h1>

                {/* Short tagline/description teaser */}
                {product.description && (
                  <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Price — Clean Editorial Block */}
                <div className="bg-gradient-to-r from-[#FFF5F8] to-[#FFFAF5] p-5 rounded-2xl mb-5 border border-rose-100/40">
                  <div className="flex items-end gap-3">
                    <span className="text-[32px] md:text-[38px] font-extrabold text-[#E06B8B] leading-none tracking-tight font-sora">
                      {formatPrice(displayPrice * quantity)}
                    </span>
                    {product.originalPrice && product.originalPrice > displayPrice && (
                      <span className="text-base text-slate-400 line-through font-medium pb-1">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 bg-[#E06B8B] text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                        {discount}% хямдралтай
                      </span>
                      {savings > 0 && (
                        <span className="text-xs text-emerald-600 font-bold">
                          {formatPrice(savings)} хэмнэлт
                        </span>
                      )}
                    </div>
                  )}
                  {quantity > 1 && (
                    <span className="text-xs text-slate-400 font-medium mt-2 block">
                      Нэгж үнэ: {formatPrice(displayPrice)}
                    </span>
                  )}
                </div>

                {/* Options — Pill style */}
                <div className="flex flex-col gap-5 text-sm mb-6">
                  {product.options && product.options.length > 0 && (
                    product.options.map((option: any) => (
                      <div key={option.id}>
                        <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-2.5 block">{option.name}</span>
                        <div className="flex flex-wrap gap-2">
                          {option.values.map((val: any) => {
                            const isSelected = selectedOptions[option.name] === val;
                            let valImage = '';
                            if (product.variants) {
                              const matchingVariant = product.variants.find((v: any) => v.options[option.name] === val && v.image);
                              if (matchingVariant) valImage = matchingVariant.image;
                            }
                            const hasImage = !!valImage;

                            return (
                              <button
                                key={val}
                                onClick={() => setSelectedOptions(p => ({ ...p, [option.name]: val }))}
                                className={`pill-option ${isSelected ? 'selected' : ''} ${hasImage ? 'flex items-center gap-2' : ''}`}
                              >
                                {hasImage && (
                                  <div className="w-5 h-5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                    <Image src={valImage} width={20} height={20} alt="" className="object-cover w-full h-full" />
                                  </div>
                                )}
                                <span>{val}</span>
                              </button>
                            );
                          })}
                        </div>
                        {option.name.includes('Хэмжээ') && product.sizeGuideUrl && (
                          <a href={product.sizeGuideUrl} target="_blank" rel="noopener noreferrer" className="text-[#E06B8B] text-xs hover:underline mt-2 inline-block font-medium">
                            Хэмжээний заавар →
                          </a>
                        )}
                      </div>
                    ))
                  )}

                  {/* Quantity — Modern rounded */}
                  <div>
                    <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-2.5 block">Тоо ширхэг</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-full overflow-hidden h-11">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-11 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-[#E06B8B] active:bg-rose-100 transition-colors h-full"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setQuantity(Math.max(1, Math.min(displayInventory, val)));
                          }}
                          className="w-12 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setQuantity(Math.min(displayInventory, quantity + 1))}
                          className="w-11 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-[#E06B8B] active:bg-rose-100 transition-colors h-full"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                      <span className="text-slate-400 text-xs font-medium">
                        {displayInventory} ширхэг бэлэн
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons — Pill shaped, gradient */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleBuyNow}
                    disabled={!canAddToCart}
                    className="flex-1 bg-[#FFF0F4] text-[#E06B8B] py-4 rounded-full font-bold text-[15px] hover:bg-[#FFE0EA] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200/50"
                  >
                    Шууд авах
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="flex-1 bg-gradient-to-r from-[#E06B8B] to-[#D55A7B] text-white py-4 rounded-full font-bold text-[15px] hover:shadow-xl hover:shadow-[#E06B8B]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E06B8B]/20"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Сагсанд нэмэх
                  </button>
                </div>

                {/* Trust Badges — Dynamic from product data */}
                <DynamicTrustBadges product={product} />

              </div>
            </div>
          </div>

          {/* ── SECTIONS ──────────────────────────────────────────────────────── */}
          <div className="mt-16 md:mt-24">
            <ProductInfoSections product={product} />
          </div>

          {/* ── RELATED — Skincare Recommendations ───────────────────────── */}
          <div className="mt-8 md:mt-24 px-4 md:px-0">
            <div className="flex items-center gap-3 mb-5 md:mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF0F4] to-[#FFE0EA] flex items-center justify-center">
                <span className="text-base">✨</span>
              </div>
              <h2 className="font-sora font-bold text-xl md:text-2xl text-slate-900">
                Танд тохирох бүтээгдэхүүн
              </h2>
            </div>
            <RelatedProducts products={product.relatedProducts || []} />
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
            className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="relative w-full max-w-5xl aspect-square md:aspect-video rounded-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <Image src={images[activeImageIndex]} alt="" fill className="object-contain" priority />
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImageIndex(p => Math.max(0, p - 1)); }}
                    disabled={activeImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-20"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImageIndex(p => Math.min(images.length - 1, p + 1)); }}
                    disabled={activeImageIndex === images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-20"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={e => { e.stopPropagation(); setActiveImageIndex(i); }}
                        className={`h-1.5 rounded-full transition-all ${i === activeImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom CTA — Skincare Pill Style ─────────────────────── */}
      <div
        className="fixed left-0 right-0 z-[60] md:hidden"
        style={{ bottom: '56px', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(224,107,139,0.08)', boxShadow: '0 -4px 20px rgba(224,107,139,0.06)' }}
      >
        <div className="flex items-center gap-2.5 px-4 pt-3 pb-4">
          {/* Price */}
          <div className="flex flex-col justify-center min-w-0 mr-auto">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Нийт үнэ
            </span>
            <span className="font-sora font-extrabold text-[18px] text-[#E06B8B] leading-none truncate">
              {formatPrice(displayPrice * quantity)}
            </span>
            {quantity > 1 && (
              <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                {quantity}ш × {formatPrice(displayPrice)}
              </span>
            )}
          </div>

          {/* Сагсанд */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-[#FFF0F4] text-[#E06B8B] font-bold text-sm active:bg-[#FFE0EA] transition-colors shrink-0 border border-rose-200/50"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            Сагс
          </motion.button>

          {/* Худалдан авах */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-gradient-to-r from-[#E06B8B] to-[#D55A7B] text-white font-bold text-sm shadow-lg shadow-[#E06B8B]/30 active:bg-[#C9597A] transition-colors shrink-0"
          >
            Авах
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS COMPONENT — SKINCARE PRODUCT STORY
// ─────────────────────────────────────────────────────────────────────────────

function ProductInfoSections({ product }: { product: any }) {
  return (
    <div className="flex flex-col gap-8 md:gap-12 px-4 md:px-0">
      {/* Product Story / Description */}
      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-rose-100/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFF0F4] to-[#FFE0EA] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#E06B8B]" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">Бүтээгдэхүй тухай</h3>
        </div>
        <div className="skincare-editorial-text leading-relaxed whitespace-pre-line">
          {product.description || 'Дэлгэрэнгүй мэдээлэл ороогүй байна.'}
        </div>
      </div>

      {/* Ingredients / Attributes — Visual Grid */}
      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-rose-100/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] flex items-center justify-center">
            <List className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">Орц найрлага & Үзүүлэлт</h3>
        </div>
        {product.attributes && Object.keys(product.attributes).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(product.attributes).map(([k, v]) => (
              <div key={k} className="ingredient-card flex flex-col items-start text-left gap-1">
                <span className="text-xs font-bold text-[#E06B8B] uppercase tracking-wider">{k}</span>
                <span className="text-sm font-semibold text-slate-800">{String(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 font-medium italic text-center py-6">Үзүүлэлтийн мэдээлэл байхгүй байна.</p>
        )}
      </div>

      {/* How to Use — Step Cards */}
      {product.sections && product.sections.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-rose-100/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">Хэрхэн хэрэглэх</h3>
          </div>
          <div className="flex flex-col gap-4">
            {product.sections.map((section: string, i: number) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#FFFBFE] to-white border border-rose-50">
                <div className="step-number">{i + 1}</div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1.5">{section}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-rose-100/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">
            Үнэлгээ {product.reviewCount ? `(${product.reviewCount})` : ''}
          </h3>
        </div>
        <div className="py-2">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC BENEFIT STRIP — Derives benefits from product data
// ─────────────────────────────────────────────────────────────────────────────

const SKINCARE_BENEFIT_KEYWORDS: { keywords: string[]; icon: string; label: string; sub: string }[] = [
  { keywords: ['чийг', 'hydrat', 'moisture', 'чийгшүүл'], icon: '💧', label: 'Чийгшүүлэгч', sub: 'Гүнзгий чийгшүүлнэ' },
  { keywords: ['байгал', 'organic', 'natural', 'натур'], icon: '🌿', label: 'Байгалийн орц', sub: 'Органик найрлага' },
  { keywords: ['дерматолог', 'dermat', 'эмнэлзүй', 'clinical'], icon: '🧬', label: 'Дерматолог батласан', sub: 'Эмнэлзүйн судалгаатай' },
  { keywords: ['гялалз', 'glow', 'bright', 'vitamin c', 'витамин'], icon: '✨', label: 'Гялалзуулагч', sub: 'Арьсыг гялалзуулна' },
  { keywords: ['хамгаал', 'spf', 'sunscreen', 'нарны', 'protect'], icon: '☀️', label: 'Нарнаас хамгаална', sub: 'UV хамгаалалт' },
  { keywords: ['үрчлээ', 'anti-aging', 'wrinkle', 'retinol', 'ретинол'], icon: '🔬', label: 'Анти-эйж', sub: 'Үрчлээсний эсрэг' },
  { keywords: ['тайвшруул', 'calm', 'soothe', 'sensitive', 'мэдрэг'], icon: '🧴', label: 'Тайвшруулагч', sub: 'Мэдрэг арьсанд' },
  { keywords: ['цэвэрл', 'clean', 'cleanse', 'wash', 'угаал'], icon: '🫧', label: 'Цэвэрлэгч', sub: 'Гүнзгий цэвэрлэнэ' },
  { keywords: ['нүд', 'eye', 'dark circle'], icon: '👁️', label: 'Нүдний арьс', sub: 'Нүдний хүрээний арчилгаа' },
  { keywords: ['сэргээ', 'repair', 'recover', 'restore'], icon: '💎', label: 'Сэргээгч', sub: 'Арьсыг сэргээнэ' },
];

function deriveBenefits(product: any): { icon: string; label: string; sub: string }[] {
  const searchText = [
    product.name || '',
    product.description || '',
    product.category || '',
    product.subcategory || '',
    ...(product.sections || []),
    ...Object.keys(product.attributes || {}),
    ...Object.values(product.attributes || {}).map(v => String(v)),
  ].join(' ').toLowerCase();

  const matched = SKINCARE_BENEFIT_KEYWORDS.filter(b =>
    b.keywords.some(kw => searchText.includes(kw))
  );

  // Always show at least 3 benefit cards
  if (matched.length >= 3) return matched.slice(0, 3);

  // Fill with defaults if not enough matches
  const defaults = [
    { icon: '🛡️', label: '100% Оригинал', sub: 'Баталгаажсан чанар' },
    { icon: '🌸', label: 'Арьс арчилгаа', sub: 'Мэргэжлийн бүтээгдэхүүн' },
    { icon: '✅', label: 'Чанарын баталгаа', sub: 'Шалгагдсан найрлага' },
  ];
  const remaining = defaults.filter(d => !matched.some(m => m.label === d.label));
  return [...matched, ...remaining].slice(0, 3);
}

function SkincarebenefitStrip({ product }: { product: any }) {
  const benefits = useMemo(() => deriveBenefits(product), [product]);
  return (
    <div className="hidden md:grid grid-cols-3 gap-3 mt-2">
      {benefits.map(({ icon, label, sub }) => (
        <div key={label} className="benefit-strip-card">
          <span className="text-2xl">{icon}</span>
          <span className="font-bold text-slate-800 text-[13px] leading-tight">{label}</span>
          <span className="text-[11px] text-slate-400 leading-tight">{sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC TRUST BADGES — Derives from product delivery/payment data
// ─────────────────────────────────────────────────────────────────────────────

function DynamicTrustBadges({ product }: { product: any }) {
  const badges = useMemo(() => {
    const list: { icon: string; label: string }[] = [];

    // Always show guarantee
    list.push({ icon: '🛡️', label: 'Баталгаат бүтээгдэхүүн' });

    // Delivery — dynamic from product data
    if (product.dispatchTime) {
      list.push({ icon: '🚚', label: `Хүргэлт ${product.dispatchTime}` });
    } else if (product.delivery) {
      list.push({ icon: '🚚', label: product.delivery });
    } else {
      list.push({ icon: '🚚', label: 'Хүргэлт 1-3 хоног' });
    }

    // Shipping info
    if (product.shippingDestination) {
      list.push({ icon: '📦', label: product.shippingDestination });
    } else {
      list.push({ icon: '🔄', label: '7 хоногт буцаах' });
    }

    // Payment
    if (product.paymentMethods) {
      list.push({ icon: '💳', label: product.paymentMethods });
    } else {
      list.push({ icon: '💳', label: 'QPay / SocialPay' });
    }

    return list;
  }, [product]);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {badges.map(({ icon, label }) => (
        <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">{icon}</span>
          {label}
        </span>
      ))}
    </div>
  );
}