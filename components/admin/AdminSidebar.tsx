'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    BarChart3, Package, Layers, ShoppingCart, MessageCircle,
    ArrowLeft, Menu, X, Building2, LogOut, Image as ImageIcon, TrendingUp, Users
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useVibe } from '@/context/VibeContext';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { currentVibe } = useVibe();

    // Fetch pending orders
    const { data: pendingData } = useSWR(
        '/api/admin/orders?status=pending',
        fetcher,
        { refreshInterval: 30000 }
    );
    const pendingCount = pendingData?.orders?.length || 0;

    const navItems = [
        { href: '/admin', icon: BarChart3, label: 'Хяналтын самбар', shortcut: null },
        { href: '/admin/analytics', icon: TrendingUp, label: 'Орлогын тайлан', shortcut: null },
        { href: '/admin/users', icon: Users, label: 'Хэрэглэгчид', shortcut: null },
        { href: '/admin/products', icon: Package, label: 'Бүтээгдэхүүн', shortcut: 'G + P' },
        { href: '/admin/banners', icon: ImageIcon, label: 'Беннер удирдлага', shortcut: 'G + B' },
        { href: '/admin/orders', icon: ShoppingCart, label: 'Захиалгууд', badge: pendingCount, badgeColor: 'bg-red-500', shortcut: 'G + O' },
        { href: '/admin/categories', icon: Layers, label: 'Ангилал', shortcut: null },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname === href || pathname.startsWith(href + '/');
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/sign-in');
        } catch {
            toast.error('Гарахад алдаа гарлаа');
        }
    };

    const SidebarContent = () => (
        <div className="h-full flex flex-col p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500"
                    style={{ background: `linear-gradient(135deg, ${currentVibe.accent}, ${currentVibe.accent}cc)`, boxShadow: `0 8px 20px ${currentVibe.glow}` }}>
                    <span className="text-white font-black text-xl">C</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-none">Classik</h2>
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</p>
                    </div>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide">
                {navItems.map(({ href, icon: Icon, label, badge, badgeColor, shortcut }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active
                                ? 'border-l-2'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                                }`}
                            style={active ? { 
                                borderColor: currentVibe.accent, 
                                backgroundColor: `${currentVibe.accent}15`, 
                                color: currentVibe.accent 
                            } : {}}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? '' : 'text-slate-400 group-hover:text-white'}`} 
                                      style={active ? { color: currentVibe.accent } : {}} />
                                <span className={`font-medium ${active ? '' : 'group-hover:text-white transition-colors'}`}>{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {shortcut && (
                                    <span className="text-[9px] font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                                        {shortcut}
                                    </span>
                                )}
                                {!!badge && badge > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${badgeColor}`}>
                                        {badge > 99 ? '99+' : badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom - Profile & Back link */}
            <div className="pt-6 border-t border-white/5 mt-4 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Сайт руу буцах</span>
                </Link>

                {/* Admin Profile Details */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <span className="font-bold text-sm transition-colors duration-500" style={{ color: currentVibe.accent }}>
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.name || 'Админ'}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Администратор</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Системээс гарах"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-30 p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors lg:hidden shadow-lg"
                aria-label="Open sidebar"
            >
                <Menu className="w-5 h-5" />
            </button>

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
