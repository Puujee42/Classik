'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, User, Heart, ShoppingBag, Menu, X,
  Globe, ArrowRight, Sparkles, Tag, TrendingUp, Truck, Zap,
  Package, LogOut, LayoutDashboard, MessageCircle, LayoutGrid,
  ChevronRight, Stars, Gift, Diamond, Flame
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useVibe } from '@/context/VibeContext';
import LanguageCurrencySelector from './LanguageCurrencySelector';
import SearchDropdown from './SearchDropdown';
import NotificationBell from './NotificationBell';
import { Suspense } from 'react';

function SearchParamsHandler({ setSearchQuery, pathname }: { setSearchQuery: (q: string) => void, pathname: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === '/search') {
      const q = searchParams.get('q');
      setSearchQuery(q ?? '');
    }
  }, [pathname, searchParams, setSearchQuery]);

  return null;
}

export default function LuxuryNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide navbar entirely on auth pages so the mobile bottom nav doesn't cover form buttons
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  if (isAuthPage) return null;
  const { user, isAuthenticated: isLoggedIn, isAdmin, logout } = useAuth();
  const { vibe, currentVibe } = useVibe();

  const userEmail = user?.email || user?.phone || '';
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; price: number; images?: string[]; image?: string | null; category?: string }[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wishlistBump, setWishlistBump] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const wishlistItemsCount = useWishlistStore((state) => state.getTotalItems());

  useEffect(() => {
    if (wishlistItemsCount > 0) {
      setWishlistBump(true);
      const timer = setTimeout(() => setWishlistBump(false), 300);
      return () => clearTimeout(timer);
    }
  }, [wishlistItemsCount]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  useEffect(() => {
    const q = debouncedSearchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setIsLoadingSearch(true);
    fetch(`/api/products?q=${encodeURIComponent(q)}&limit=8`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSearchResults(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSearch(false);
      });
    return () => { cancelled = true; };
  }, [debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const categories = [
    { name: t('nav', 'home'), href: '/', icon: Sparkles },
    { name: t('nav', 'newArrivals'), href: '/new-arrivals', icon: Stars },
    { name: t('nav', 'readyToShip'), href: '/ready-to-ship', icon: Gift },
    { name: t('nav', 'deals'), href: '/deals', icon: Diamond },
    { name: t('nav', 'sale'), href: '/sale', icon: Flame },
  ];

  const mobileNavItems = [
    { name: t('nav', 'home'), href: '/', icon: Sparkles },
    { name: t('nav', 'categories') || 'Категори', href: '/categories', icon: LayoutGrid },
    { name: t('nav', 'search'), href: '/search', icon: Search },
    { name: t('nav', 'cart'), href: '/cart', icon: ShoppingBag, count: cartItemsCount },
    { name: t('nav', 'profile'), href: isLoggedIn ? '/profile' : '/sign-in', icon: User },
  ];

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler setSearchQuery={setSearchQuery} pathname={pathname} />
      </Suspense>

      {/* ── DESKTOP HEADER ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/82 backdrop-blur-[24px] saturate-[180%] border-b border-[#D4AF37]/10 shadow-[0_4px_30px_rgba(224,107,139,0.06)]'
          : 'bg-white/82 backdrop-blur-[24px] saturate-[180%] border-b border-[#D4AF37]/5'
          }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className={`relative z-50 flex items-center justify-between transition-all duration-200 ${scrolled ? 'h-16' : 'h-24'
              }`}>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <motion.div className="relative flex flex-col items-start">
                  <motion.h1
                    className="font-serif text-2xl font-bold leading-none transition-colors duration-500"
                    style={{ color: currentVibe.accent }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    Classik
                  </motion.h1>
                  <motion.span
                    className="text-[9px] font-sans tracking-[0.25em] text-[#D4AF37] uppercase leading-none ml-0.5 mt-1 font-bold"
                    whileHover={{ color: currentVibe.accent }}
                  >
                    Арьс Арчилгаа
                  </motion.span>
                </motion.div>
              </Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-[600px] mx-8">
                <form onSubmit={handleSearch} className="relative w-full">
                  <motion.div
                    className={`relative w-full group rounded-full transition-all duration-300 ${searchFocused
                      ? 'bg-white border-2 shadow-[0_0_0_4px]'
                      : 'bg-[#FAF9F6] border-2 border-transparent hover:bg-[#FCEEF2]/60'
                      }`}
                    style={searchFocused ? {
                      borderColor: currentVibe.accent,
                      boxShadow: `0 0 0 4px rgba(var(--vibe-accent-rgb), 0.08)`,
                    } : {}}
                    animate={{ scale: searchFocused ? 1.02 : 1, y: searchFocused ? -2 : 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="relative flex items-center rounded-2xl h-full w-full overflow-hidden">
                      <motion.div
                        animate={{ scale: searchFocused ? 1.2 : 1, rotate: searchFocused ? 15 : 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        className="pl-4"
                      >
                        <Search
                          className={`w-6 h-6 transition-colors duration-300`}
                          style={{ color: searchFocused ? currentVibe.accent : '#999' }}
                          strokeWidth={1.5}
                        />
                      </motion.div>
                      <input
                        type="text"
                        placeholder="Хайх утгаа оруулна уу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                        className="flex-1 px-4 py-3 bg-transparent text-sm font-medium text-gray-900 placeholder-gray-500 tracking-wide focus:outline-none transition-all"
                        autoComplete="off"
                      />
                      <AnimatePresence>
                        {searchQuery && (
                          <motion.button
                            type="button"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => setSearchQuery('')}
                            className="p-1.5 mr-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" strokeWidth={1.5} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          const trimmed = searchQuery.trim();
                          if (trimmed) {
                            e.preventDefault();
                            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
                          }
                        }}
                        className={`mr-1.5 p-2 rounded-full transition-all duration-300`}
                        style={{
                          backgroundColor: (searchFocused || searchQuery) ? currentVibe.accent : currentVibe.bg,
                          color: (searchFocused || searchQuery) ? 'white' : '#999',
                          boxShadow: (searchFocused || searchQuery) ? `0 4px 12px ${currentVibe.glow}` : 'none',
                        }}
                      >
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </motion.div>
                </form>
                <SearchDropdown
                  results={searchResults}
                  isVisible={searchFocused && searchQuery.trim().length > 0}
                  onClose={() => setSearchFocused(false)}
                  onMouseDown={() => { }}
                  isLoading={isLoadingSearch}
                />
              </div>

              {/* Right Icons */}
              <motion.div
                animate={{ scale: scrolled ? 0.9 : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 flex-shrink-0"
              >


                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  {isLoggedIn ? (
                    <>
                      <motion.button
                        type="button"
                        onClick={() => setUserMenuOpen((o) => !o)}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-gray-200"
                      >
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-xl object-cover border border-gray-100" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: currentVibe.bg }}>
                            <span className="font-bold text-xs" style={{ color: currentVibe.accent }}>
                              {(user?.name?.[0] || user?.phone?.[0] || 'U').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="hidden sm:inline text-sm font-semibold text-gray-700 max-w-[120px] truncate" style={{ '--hover-color': currentVibe.accent } as React.CSSProperties}>
                          {user?.name || user?.phone || t('nav', 'profile')}
                        </span>
                      </motion.button>
                      <AnimatePresence>
                        {userMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.18 }}
                            className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden z-[100]"
                          >
                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{t('nav', 'email')}</p>
                              <p className="text-sm text-gray-900 truncate mt-0.5">{userEmail || '—'}</p>
                              {isAdmin && (
                                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: currentVibe.bg, color: '#D4AF37' }}>
                                  {t('nav', 'admin')}
                                </span>
                              )}
                            </div>
                            <div className="py-1">
                              <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-[var(--vibe-accent)] transition-colors border-b border-gray-50" style={{ '--hover-bg': currentVibe.bg } as React.CSSProperties}>
                                <User className="w-4 h-4 text-gray-500" strokeWidth={1.2} />
                                Миний профайл
                              </Link>
                              <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-[var(--vibe-accent)] transition-colors">
                                <Package className="w-4 h-4 text-gray-500" strokeWidth={1.2} />
                                {t('nav', 'myOrders')}
                              </Link>
                              {isAdmin && (
                                <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-[#D4AF37] transition-colors">
                                  <LayoutDashboard className="w-4 h-4 text-gray-500" strokeWidth={1.2} />
                                  {t('nav', 'adminPanel')}
                                </Link>
                              )}
                              <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                                <LogOut className="w-4 h-4 text-gray-500" strokeWidth={1.2} />
                                {t('nav', 'signOut')}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href="/sign-in" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                      <User className="w-6 h-6 text-gray-600" style={{ '--hover-color': currentVibe.accent } as React.CSSProperties} strokeWidth={1.5} />
                      <span className="text-sm font-medium text-gray-600">{t('nav', 'signIn')}</span>
                    </Link>
                  )}
                </div>

                <NotificationBell />

                <Link href="/wishlist">
                  <motion.div
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={wishlistBump ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="relative p-2 hover:bg-gray-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <Heart
                      className="w-6 h-6 transition-colors"
                      style={{ color: mounted && wishlistItemsCount > 0 ? currentVibe.accent : '#4b5563' }}
                      strokeWidth={1.5}
                    />
                    {mounted && wishlistItemsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: currentVibe.accent }}
                      />
                    )}
                  </motion.div>
                </Link>

                <Link href="/cart">
                  <motion.div
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-2 hover:bg-gray-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <ShoppingBag
                      className="w-6 h-6 transition-colors"
                      style={{ color: mounted && cartItemsCount > 0 ? currentVibe.accent : '#4b5563' }}
                      strokeWidth={1.5}
                    />
                    {mounted && cartItemsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                        style={{ backgroundColor: currentVibe.accent }}
                      >
                        {cartItemsCount}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>


              </motion.div>
            </div>
          </div>
        </div>

        {/* Desktop Category Nav Row */}
        <div className="border-t border-[#D4AF37]/8">
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-center gap-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = pathname === category.href;
                return (
                  <Link key={category.href} href={category.href}>
                    <motion.div
                      className="relative px-4 py-4 group cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <div className={`flex items-center gap-2 transition-all duration-300`}
                        style={{ color: isActive ? currentVibe.accent : '#666' }}>
                        <Icon
                          className="w-4 h-4 transition-colors duration-300"
                          style={{ color: isActive ? currentVibe.accent : undefined }}
                          strokeWidth={1.2}
                        />
                        <span className="text-xs font-bold uppercase tracking-[0.15em]">{category.name}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full"
                          style={{ background: `linear-gradient(90deg, ${currentVibe.accent}, #D4AF37)` }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* ── MOBILE HEADER ─────────────────────────────────────────────────── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/88 backdrop-blur-[24px] saturate-[180%] border-b border-[#D4AF37]/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex flex-col items-start select-none">
            <span className="font-serif text-xl font-bold leading-none transition-colors duration-500" style={{ color: currentVibe.accent }}>Classik</span>
            <span className="text-[7px] font-sans tracking-[0.25em] text-[#D4AF37] uppercase leading-none mt-0.5 font-bold">Арьс Арчилгаа</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link href="/search" className="p-2 text-slate-500 active:scale-90 transition-transform">
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </Link>
            <Link href="/wishlist">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="p-2 text-slate-500 relative"
              >
                <Heart className="w-6 h-6" strokeWidth={1.5} />
                {mounted && wishlistItemsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: currentVibe.accent }} />
                )}
              </motion.div>
            </Link>
            <NotificationBell />
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 active:scale-90 transition-transform">
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* ── SPACER ─────────────────────────────────────────────────────────── */}
      <div
        className={`transition-all duration-300 ${scrolled ? 'h-14 lg:h-[124px]' : 'h-14 lg:h-[180px]'}`}
        style={{
          marginTop: 'env(safe-area-inset-top)',
        }}
      />

      {/* ── MOBILE SLIDE MENU ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[101] w-[280px] bg-white shadow-2xl lg:hidden flex flex-col"
              style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <span className="font-bold text-slate-900">{t('nav', 'menu')}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-slate-500" strokeWidth={1.8} />
                </button>
              </div>

              <div className="px-5 py-6">
                {isLoggedIn ? (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 active:border-opacity-20 transition-colors"
                    style={{ '--active-bg': currentVibe.bg, '--active-border': currentVibe.accent } as React.CSSProperties}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${currentVibe.accent}15`, borderColor: `${currentVibe.accent}30` }}>
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="font-bold text-lg" style={{ color: currentVibe.accent }}>{(user?.name?.[0] || user?.phone?.[0] || 'U').toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{user?.name || 'Хэрэглэгч'}</p>
                      <p className="text-sm font-medium text-slate-500 truncate">{user?.phone || user?.email || '—'}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: currentVibe.accent }}>Профайл харах →</p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full py-4 rounded-2xl text-white font-bold text-sm active:scale-[0.98] transition-all"
                    style={{ backgroundColor: currentVibe.accent, boxShadow: `0 8px 20px ${currentVibe.glow}` }}
                  >
                    {t('nav', 'signIn')}
                  </Link>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5">
                <div className="flex flex-col">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = pathname === cat.href;
                    return (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 py-4 border-b border-slate-50 transition-colors active:bg-slate-50`}
                      >
                        <Icon className="w-5 h-5 shrink-0" style={{ color: isActive ? currentVibe.accent : '#94a3b8' }} strokeWidth={isActive ? 2 : 1.5} />
                        <span className="font-semibold text-[15px] flex-1" style={{ color: isActive ? currentVibe.accent : '#1e293b' }}>
                          {cat.name}
                        </span>
                        <ChevronRight className="w-4 h-4" style={{ color: isActive ? currentVibe.accent : '#cbd5e1' }} strokeWidth={2} />
                      </Link>
                    );
                  })}
                </div>

                {isLoggedIn && (
                  <div className="mt-4 pb-10">
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 py-4 border-b border-slate-50 text-slate-800">
                      <Package className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                      <span className="font-semibold text-[15px]">{t('nav', 'myOrders')}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="flex w-full items-center gap-4 py-4 text-red-500"
                    >
                      <LogOut className="w-5 h-5 opacity-70" strokeWidth={1.5} />
                      <span className="font-semibold text-[15px]">{t('nav', 'signOut')}</span>
                    </button>
                  </div>
                )}
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM NAV — Signature Tab Bar ──────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pointer-events-none"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div
          className="pointer-events-auto border-t border-[#D4AF37]/10"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: `0 -4px 30px ${currentVibe.glow.replace('0.3', '0.06')}`,
          }}
        >
          <div className="flex items-stretch h-16">
            {mobileNavItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center group active:scale-90 transition-transform relative">
                  {/* Active indicator - signature vibe-colored dot */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="absolute -top-[1px] w-8 h-[3px] rounded-full"
                      style={{ background: `linear-gradient(90deg, ${currentVibe.accent}, #D4AF37)` }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="relative">
                    <motion.div
                      animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <Icon
                        className="w-[22px] h-[22px] transition-colors duration-200"
                        style={{ color: isActive ? currentVibe.accent : '#AAAAAA' }}
                        strokeWidth={isActive ? 2.4 : 1.6}
                      />
                    </motion.div>
                    {mounted && item.count !== undefined && item.count > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${currentVibe.accent}, ${currentVibe.accent}cc)` }}
                      >
                        {item.count > 9 ? '9+' : item.count}
                      </motion.span>
                    )}
                  </div>
                  <motion.span
                    animate={isActive ? { y: -1 } : { y: 0 }}
                    className="text-[10px] font-bold mt-1 tracking-wide transition-colors duration-200"
                    style={{ color: isActive ? currentVibe.accent : '#AAAAAA' }}
                  >
                    {item.name}
                  </motion.span>
                  {/* Active glow behind icon */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileTabGlow"
                      className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
                      style={{ background: `radial-gradient(circle, ${currentVibe.glow.replace('0.3', '0.1')} 0%, transparent 70%)` }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
