'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package, Heart, MapPin, Bell, ShieldCheck,
  ChevronRight, LogOut, Camera, KeyRound, Eye,
  EyeOff, CheckCircle, Clock, XCircle,
  TrendingUp, Lock, Link2, Loader2,
  Sparkles, Crown, Star
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { useVibe } from '@/context/VibeContext';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'orders' | 'password';

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items?: any[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { currentVibe } = useVibe();
  const wishlistCount = useWishlistStore(state => state.getTotalItems());
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Stats
  const [orders, setOrders] = useState<Order[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/user/addresses').then(r => r.json()),
    ]).then(([ordersData, addressData]) => {
      setOrders(ordersData.orders || []);
      setAddressCount(addressData.addresses?.length || 0);
    }).catch(() => { }).finally(() => setDataLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Амжилттай гарлаа');
    } catch {
      toast.error('Гарахад алдаа гарлаа');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Шинэ нууц үг таарахгүй байна');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success(data.message || 'Нууц үг амжилттай солигдлоо');
        setTimeout(() => setPwSuccess(false), 5000);
      } else {
        toast.error(data.error || 'Алдаа гарлаа');
      }
    } catch {
      toast.error('Сервертэй холбогдож чадсангүй');
    } finally {
      setPwLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Хүлээгдэж байна',
      processing: 'Боловсруулж байна',
      shipped: 'Илгээгдсэн',
      completed: 'Хүргэгдсэн',
      cancelled: 'Цуцлагдсан',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: currentVibe?.bg || '#FAF9F6' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent" style={{ borderTopColor: currentVibe?.accent || '#E06B8B', borderRightColor: currentVibe?.accent || '#E06B8B' }} />
          <span className="text-[13px] text-[#999] font-medium">Уншиж байна...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.phone || '?')[0];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Хянах самбар', icon: TrendingUp },
    { id: 'orders', label: 'Захиалгууд', icon: Package },
    { id: 'password', label: 'Нууц үг', icon: KeyRound },
  ];

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="min-h-screen pb-[120px] font-sans" style={{ backgroundColor: currentVibe.bg }}>

      {/* ─── HEADER with decorative elements ─── */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${currentVibe.accent} 0%, ${currentVibe.accent}cc 50%, ${currentVibe.accent}99 100%)`
        }} />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-10 bg-white" />
        <div className="absolute top-10 -left-10 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full opacity-5 bg-white" />

        {/* Shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Content */}
        <div className="relative pt-12 pb-[80px] px-4 flex flex-col items-center">

          {/* Avatar */}
          <div className="relative mb-4">
            {/* Glow ring behind avatar */}
            <div className="absolute inset-[-6px] rounded-full animate-pulse opacity-30" style={{
              background: `radial-gradient(circle, white 30%, transparent 70%)`
            }} />
            <div className="relative w-[100px] h-[100px] rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden ring-[3px] ring-white/50">
              {user.imageUrl ? (
                <Image src={user.imageUrl} alt={user.name || 'User'} width={100} height={100} className="object-cover w-full h-full" />
              ) : (
                <span className="text-[38px] font-extrabold gradient-text-rose">{initials}</span>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-white hover:scale-110 active:scale-95 transition-transform">
              <Camera className="w-4.5 h-4.5" style={{ color: currentVibe.accent }} strokeWidth={2.5} />
            </button>
          </div>

          <h1 className="text-[24px] font-extrabold text-white tracking-tight leading-none mb-1 drop-shadow-sm">{user.name || 'Хэрэглэгч'}</h1>
          <p className="text-[14px] text-white/70 font-medium tracking-wide">{user.phone || user.email || ''}</p>

          {user.role === 'admin' && (
            <div className="mt-3 flex items-center gap-1.5 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-white tracking-widest">АДМИН</span>
            </div>
          )}
        </div>

        {/* Elegant curve */}
        <div className="absolute -bottom-1 left-0 right-0 h-8" style={{
          background: currentVibe.bg,
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%'
        }} />
      </div>

      {/* ─── STATS ROW ─── */}
      <div className="relative z-20 px-4 -mt-12 mb-6">
        <div className="card-classik bg-white p-1 overflow-hidden">
          {/* Subtle gold accent line at top */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full" style={{
            background: `linear-gradient(90deg, transparent, ${currentVibe.accent}40, #D4AF3740, ${currentVibe.accent}40, transparent)`
          }} />

          <div className="grid grid-cols-3 py-3">
            <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-100">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: `${currentVibe.accent}10` }}>
                <Package className="w-4 h-4" style={{ color: currentVibe.accent }} strokeWidth={2} />
              </div>
              <span className="text-[22px] font-extrabold" style={{ color: currentVibe.accent }}>{dataLoading ? '—' : orders.length}</span>
              <span className="text-[10px] text-[#999] font-bold tracking-wider uppercase">Захиалга</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-100">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: `${currentVibe.accent}10` }}>
                <Heart className="w-4 h-4" style={{ color: currentVibe.accent }} strokeWidth={2} />
              </div>
              <span className="text-[22px] font-extrabold" style={{ color: currentVibe.accent }}>{wishlistCount}</span>
              <span className="text-[10px] text-[#999] font-bold tracking-wider uppercase">Хадгалсан</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: `${currentVibe.accent}10` }}>
                <MapPin className="w-4 h-4" style={{ color: currentVibe.accent }} strokeWidth={2} />
              </div>
              <span className="text-[22px] font-extrabold" style={{ color: currentVibe.accent }}>{dataLoading ? '—' : addressCount}</span>
              <span className="text-[10px] text-[#999] font-bold tracking-wider uppercase">Хаяг</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TAB BAR ─── */}
      <div className="px-4 mb-5">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-1.5 flex gap-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-white/80">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                  active
                    ? 'text-white shadow-md'
                    : 'text-[#999] hover:text-[#555] hover:bg-white/60'
                }`}
                style={active ? {
                  backgroundColor: currentVibe.accent,
                  boxShadow: `0 4px 16px ${currentVibe.glow}`
                } : {}}
              >
                <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div className="px-4 space-y-5">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">

            {/* Welcome card */}
            <div className="card-classik overflow-hidden">
              <div className="relative px-5 py-5" style={{
                background: `linear-gradient(135deg, ${currentVibe.accent}08, ${currentVibe.accent}04, transparent)`
              }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{
                    background: `linear-gradient(135deg, ${currentVibe.accent}20, ${currentVibe.accent}08)`
                  }}>
                    <Sparkles className="w-6 h-6" style={{ color: currentVibe.accent }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[#1A1A1A] mb-0.5">
                      Сайн байна уу, {user.name?.split(' ')[0] || 'Хэрэглэгч'}! ✨
                    </p>
                    <p className="text-[12px] text-[#888] font-medium leading-relaxed">
                      Таны Classik профайл дашбоард
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Package, label: 'Нийт захиалга', value: dataLoading ? '—' : orders.length, gradient: 'from-blue-50 to-indigo-50/50' },
                { icon: Heart, label: 'Хадгалсан бараа', value: wishlistCount, gradient: 'from-pink-50 to-rose-50/50' },
                { icon: CheckCircle, label: 'Хүргэгдсэн', value: dataLoading ? '—' : completedOrders, gradient: 'from-emerald-50 to-green-50/50' },
                { icon: Star, label: 'Нийт зарцуулсан', value: dataLoading ? '—' : formatPrice(totalSpent), gradient: 'from-amber-50 to-yellow-50/50', isPrice: true },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className={`card-classik p-4 group cursor-default transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br ${item.gradient}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm ring-1 ring-gray-100 transition-transform duration-300 group-hover:scale-110" >
                      <Icon className="w-5 h-5" style={{ color: currentVibe.accent }} strokeWidth={1.8} />
                    </div>
                    <p className={`${item.isPrice ? 'text-[18px]' : 'text-[26px]'} font-extrabold text-[#1A1A1A] leading-none`}>{item.value}</p>
                    <p className="text-[11px] text-[#888] font-bold tracking-wide mt-1.5 uppercase">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recent orders preview */}
            {orders.length > 0 && (
              <div className="card-classik overflow-hidden">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-extrabold text-[#1A1A1A] tracking-tight">Сүүлийн захиалгууд</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-[12px] font-bold flex items-center gap-1 transition-all hover:gap-2"
                    style={{ color: currentVibe.accent }}
                  >
                    Бүгдийг харах
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-gray-100/80">
                  {orders.slice(0, 3).map(order => (
                    <div key={order._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center shadow-sm ring-1 ring-gray-100">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#1A1A1A]">#{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-[11px] text-[#AAA] font-medium">{new Date(order.createdAt).toLocaleDateString('mn-MN')}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-[14px] font-bold text-[#1A1A1A]">{formatPrice(order.totalPrice)}</p>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu links */}
            <div>
              <h2 className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-2 mb-3 flex items-center gap-1.5">
                <span className="w-4 h-px rounded-full" style={{ backgroundColor: currentVibe.accent }} />
                Холбоосууд
              </h2>
              <div className="card-classik overflow-hidden">
                <MenuLink icon={Package} iconBg={`${currentVibe.accent}12`} iconColor={currentVibe.accent} label="Миний захиалга" href="/orders" subtitle={`${orders.length} захиалга`} />
                <MenuDiv />
                <MenuLink icon={Heart} iconBg={`${currentVibe.accent}12`} iconColor={currentVibe.accent} label="Хадгалсан бараа" href="/wishlist" />
                <MenuDiv />
                <MenuLink icon={MapPin} iconBg={`${currentVibe.accent}12`} iconColor={currentVibe.accent} label="Миний хаягууд" href="/addresses" subtitle={`${addressCount} хаяг`} />
                <MenuDiv />
                <MenuLink icon={Bell} iconBg={`${currentVibe.accent}12`} iconColor={currentVibe.accent} label="Мэдэгдэл" href="/settings/notifications" />
                <MenuDiv />
                <MenuLink icon={ShieldCheck} iconBg={`${currentVibe.accent}12`} iconColor={currentVibe.accent} label="Нууцлал & Аюулгүй байдал" href="/settings/security" />
              </div>
            </div>

            {/* Connected Social Accounts */}
            <ConnectedAccounts />

            {/* Logout */}
            <div className="card-classik overflow-hidden group">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 h-[60px] active:bg-[#fff5f5] transition-all">
                <LogOut className="w-5 h-5 text-[#E06B8B] group-hover:rotate-[-12deg] transition-transform duration-300" strokeWidth={2} />
                <span className="text-[15px] font-bold text-[#E06B8B]">Системээс гарах</span>
              </button>
            </div>

            {/* Footer brand */}
            <div className="flex flex-col items-center gap-1.5 pt-3 pb-6">
              <div className="flex items-center gap-1 text-[11px] text-[#CCC] font-bold tracking-widest">
                <Sparkles className="w-3 h-3" />
                CLASSIK
              </div>
              <p className="text-[11px] text-[#DDD] font-medium">v1.0.0</p>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {dataLoading ? (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent" style={{ borderTopColor: currentVibe.accent, borderRightColor: currentVibe.accent }} />
                  <span className="text-[12px] text-[#999] font-medium">Уншиж байна...</span>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="card-classik py-16 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, ${currentVibe.accent}15, ${currentVibe.accent}08)`
                }}>
                  <Package className="w-10 h-10" style={{ color: currentVibe.accent }} strokeWidth={1.2} />
                </div>
                <div className="text-center">
                  <p className="text-[17px] font-bold text-[#1A1A1A]">Захиалга байхгүй байна</p>
                  <p className="text-[13px] text-[#888] font-medium mt-1">Шинэ дүр төрхөө олж нээгээрэй</p>
                </div>
                <Link href="/" className="btn-rose mt-2 px-8 py-3 text-[13px] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Дэлгүүр үзэх
                </Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="card-classik overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                  <div className="px-5 py-4 border-b border-gray-100/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center group-hover:bg-[#FFF5F5] transition-colors">
                        {getStatusIcon(order.status)}
                      </div>
                      <span className="text-[14px] font-bold text-[#1A1A1A]">#{order._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between bg-gray-50/30 group-hover:bg-white transition-colors">
                    <p className="text-[13px] text-[#888] font-medium">
                      {new Date(order.createdAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-[16px] font-extrabold tracking-tight" style={{ color: currentVibe.accent }}>{formatPrice(order.totalPrice)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PASSWORD */}
        {activeTab === 'password' && (
          <div className="space-y-5">
            {/* Info card */}
            <div className="card-classik px-5 py-5 flex items-center gap-4 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03]" style={{ backgroundColor: currentVibe.accent, transform: 'translate(30%, -30%)' }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm" style={{
                background: `linear-gradient(135deg, ${currentVibe.accent}20, ${currentVibe.accent}08)`
              }}>
                <Lock className="w-5 h-5" style={{ color: currentVibe.accent }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1A1A1A]">Нууцлалаа хамгаалаарай</p>
                <p className="text-[12px] text-[#888] font-medium mt-1">Хамгийн багадаа 6 тэмдэгт оруулна уу</p>
              </div>
            </div>

            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={2} />
                <p className="text-[13px] text-emerald-700 font-bold">Нууц үг амжилттай солигдлоо!</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">

              {/* Current password */}
              <PasswordField
                label="Одоогийн нууц үг"
                placeholder="Одоогийн нууц үгээ оруулна уу"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggleShow={() => setShowCurrent(!showCurrent)}
                accent={currentVibe.accent}
              />

              {/* New password */}
              <div>
                <PasswordField
                  label="Шинэ нууц үг"
                  placeholder="Шинэ нууц үг"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  onToggleShow={() => setShowNew(!showNew)}
                  accent={currentVibe.accent}
                />
                {newPassword && newPassword.length < 6 && (
                  <p className="text-[12px] text-red-500 ml-2 mt-1.5 font-medium">Хамгийн багадаа 6 тэмдэгт байх ёстой</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <PasswordField
                  label="Нууц үг давтах"
                  placeholder="Шинэ нууц үгээ дахин оруулна уу"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  onToggleShow={() => setShowConfirm(!showConfirm)}
                  accent={currentVibe.accent}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[12px] text-red-500 ml-2 mt-1.5 font-medium">Нууц үг таарахгүй байна</p>
                )}
                {confirmPassword && confirmPassword === newPassword && newPassword.length >= 6 && (
                  <p className="text-[12px] text-emerald-500 ml-2 mt-1.5 font-bold">✓ Нууц үг таарч байна</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="btn-rose w-full h-[54px] text-white font-bold text-[15px] rounded-xl flex items-center justify-center gap-2"
                >
                  {pwLoading
                    ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : 'Нууц үг солих'
                  }
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Password Field Component ────────────────────────────────────────────────
function PasswordField({
  label, placeholder, value, onChange, show, onToggleShow, accent
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggleShow: () => void; accent: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1 mb-2 block">{label}</label>
      <div className="card-classik px-4 h-[56px] flex items-center gap-3 focus-within:ring-2 focus-within:border-transparent transition-all" style={{ '--tw-ring-color': `${accent}40` } as React.CSSProperties}>
        <Lock className="w-4 h-4 text-[#CCC] shrink-0" strokeWidth={2} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="flex-1 text-[15px] text-[#1A1A1A] placeholder-[#CCC] bg-transparent outline-none font-medium"
        />
        <button type="button" onClick={onToggleShow} className="text-[#CCC] hover:text-[#888] p-1 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Google Icon ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z" fill="#EA4335" />
    </svg>
  );
}

// ─── Connected Accounts ─────────────────────────────────────────────────────
interface LinkedAccounts {
  google: { linked: boolean; email?: string };
  facebook: { linked: boolean; email?: string };
}

function ConnectedAccounts() {
  const { user } = useAuth();
  const { currentVibe } = useVibe();
  const [linked, setLinked] = useState<LinkedAccounts | null>(null);
  const [busy, setBusy] = useState<'google' | 'facebook' | null>(null);
  const [confirmUnlink, setConfirmUnlink] = useState<'google' | 'facebook' | null>(null);

  useEffect(() => {
    fetch('/api/user/link-social')
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setLinked(data))
      .catch(() => { });
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('/api/user/link-social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'google', access_token: tokenResponse.access_token }),
        });

        const data = await res.json();
        if (res.ok) {
          setLinked(prev => prev ? { ...prev, google: { linked: true, email: data.email } } : null);
          toast.success('Амжилттай холбогдлоо!');
        } else {
          toast.error(data.error || 'Холбоход алдаа гарлаа');
        }
      } catch {
        toast.error('Сервертэй холбогдож чадсангүй');
      } finally {
        setBusy(null);
      }
    },
    onError: () => {
      toast.error('Google-ээр холбоход алдаа гарлаа');
      setBusy(null);
    },
  });

  const handleConnect = async (provider: 'google' | 'facebook') => {
    setBusy(provider);
    if (provider === 'google') {
      googleLogin();
    } else {
      toast.error('Удахгүй нэмэгдэх болно');
      setBusy(null);
    }
  };

  const handleDisconnect = async (provider: 'google' | 'facebook') => {
    setConfirmUnlink(null);
    setBusy(provider);
    try {
      const res = await fetch('/api/user/link-social', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinked(prev => prev ? {
          ...prev,
          [provider]: { linked: false },
        } : null);
        toast.success(data.message || 'Холболт салгагдлаа');
      } else {
        toast.error(data.error || 'Алдаа гарлаа');
      }
    } catch {
      toast.error('Сервертэй холбогдож чадсангүй');
    } finally {
      setBusy(null);
    }
  };

  const providers: { key: 'google' | 'facebook'; label: string; icon: React.ReactNode }[] = [
    { key: 'google', label: 'Google', icon: <GoogleIcon /> },
  ];

  return (
    <div>
      <h2 className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-2 mb-3 flex items-center gap-1.5">
        <span className="w-4 h-px rounded-full" style={{ backgroundColor: currentVibe.accent }} />
        Холбогдсон данс
      </h2>
      <div className="card-classik overflow-hidden">

        {/* Confirm unlink overlay */}
        {confirmUnlink && (
          <div className="px-5 py-5 bg-gradient-to-r from-[#FFF5F5] to-[#FFF0F0] border-b border-red-100 flex flex-col gap-3">
            <p className="text-[14px] font-bold text-red-600">
              {confirmUnlink === 'google' ? 'Google' : 'Facebook'} холболтыг салгах уу?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => handleDisconnect(confirmUnlink)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold rounded-xl active:scale-[0.98] transition-all shadow-sm"
              >
                Тийм, салгах
              </button>
              <button
                onClick={() => setConfirmUnlink(null)}
                className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-[#333] text-[13px] font-bold rounded-xl active:scale-[0.98] transition-all shadow-sm"
              >
                Болих
              </button>
            </div>
          </div>
        )}

        {providers.map((p, i) => {
          const isLinked = linked?.[p.key]?.linked;
          const email = linked?.[p.key]?.email;
          const isBusy = busy === p.key;
          return (
            <div
              key={p.key}
              className={`flex items-center justify-between px-5 h-[76px] hover:bg-gray-50/30 transition-colors ${i < providers.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {/* Left: icon + label + status */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center shrink-0">
                  {p.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-[#1A1A1A] tracking-tight">{p.label}</p>
                  {/* BUG FIX: Show correct status for Google-signup users */}
                  {isLinked ? (
                    <p className="text-[12px] text-[#888] font-medium mt-0.5 truncate max-w-[170px]">
                      {email || 'Холбогдсон'}
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#BBB] font-medium mt-0.5">Холбоогүй байна</p>
                  )}
                </div>
              </div>

              {/* Right: action button */}
              {isBusy ? (
                <Loader2 className="w-5 h-5 text-[#999] animate-spin shrink-0" />
              ) : isLinked ? (
                <button
                  onClick={() => setConfirmUnlink(p.key)}
                  disabled={!!busy}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFF5F5] hover:bg-[#FFEBEB] border border-[#FFEBEB] rounded-xl text-[12px] font-bold text-[#E06B8B] transition-all active:scale-[0.98] disabled:opacity-60 shrink-0 shadow-sm"
                >
                  <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Салгах
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(p.key)}
                  disabled={!!busy}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold text-[#333] transition-all active:scale-[0.98] disabled:opacity-60 shrink-0 shadow-sm"
                >
                  <Link2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Холбох
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MenuLink & MenuDiv ─────────────────────────────────────────────────────
function MenuLink({
  icon: Icon, iconBg, iconColor, label, href, subtitle
}: {
  icon: any; iconBg: string; iconColor: string; label: string; href: string; subtitle?: string;
}) {
  return (
    <Link href={href} className="flex items-center justify-between px-5 h-[68px] hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm" style={{ backgroundColor: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
        </div>
        <div className="flex flex-col min-w-0 justify-center">
          <span className="text-[15px] font-bold text-[#1A1A1A] tracking-tight truncate">{label}</span>
          {subtitle && <span className="text-[12px] text-[#888] font-medium mt-0.5">{subtitle}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#CCC] shrink-0 ml-2 transition-all duration-300 group-hover:text-[#888] group-hover:translate-x-1" strokeWidth={2} />
    </Link>
  );
}

function MenuDiv() {
  return <div className="ml-[76px] h-[1px] bg-gray-100/80" />;
}
