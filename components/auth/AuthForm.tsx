'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AuthForm() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ phone: '', password: '', name: '', age: '' });
    const [isCheckingUser, setIsCheckingUser] = useState(false);

    const checkUserExistence = async (phone: string) => {
        if (!phone || phone.length < 8 || isLogin) return;
        setIsCheckingUser(true);
        try {
            const res = await fetch('/api/auth/check-user', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.exists) {
                toast.error('Энэ дугаар бүртгэлтэй байна. Нэвтэрнэ үү.', { duration: 4000, icon: '⚠️' });
                setIsLogin(true);
            }
        } catch (error) { console.error('Failed to check user:', error); }
        finally { setIsCheckingUser(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        try {
            const res = await fetch(endpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || 'Something went wrong'); }
            else {
                if (isLogin) { toast.success('Тавтай морилно уу!'); router.push('/'); router.refresh(); }
                else { toast.success('Амжилттай бүртгэгдлээ! Нэвтэрнэ үү.'); setIsLogin(true); }
            }
        } catch { toast.error('Алдаа гарлаа'); }
        finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
        >
            <div className="relative bg-white border border-[#D4AF37]/10 p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(224,107,139,0.08)] overflow-hidden">
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#E06B8B] to-transparent opacity-40" />

                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.7 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#FCEEF2] to-[#E06B8B]/20 mb-6 border border-[#E06B8B]/15"
                    >
                        <Sparkles className="w-7 h-7 text-[#E06B8B]" />
                    </motion.div>
                    <h2 className="font-serif text-3xl text-[#333] mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-[#888] text-sm font-light">
                        {isLogin ? 'Sign in to your Classik account' : 'Join the Classik skincare community'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc] group-focus-within:text-[#E06B8B] transition-colors" />
                                <input
                                    type="tel" required value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    onBlur={(e) => checkUserExistence(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl focus:ring-2 focus:ring-[#E06B8B]/15 focus:border-[#E06B8B]/40 outline-none transition-all text-[#333] placeholder:text-[#ccc] text-sm font-medium"
                                    placeholder="9911..."
                                />
                            </div>
                        </div>

                        {/* Registration Fields */}
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] ml-1">Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc] group-focus-within:text-[#E06B8B] transition-colors" />
                                        <input
                                            type="text" required={!isLogin} value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl focus:ring-2 focus:ring-[#E06B8B]/15 focus:border-[#E06B8B]/40 outline-none transition-all text-[#333] placeholder:text-[#ccc] text-sm font-medium"
                                            placeholder="Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] ml-1">Age</label>
                                    <div className="relative group">
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc] group-focus-within:text-[#E06B8B] transition-colors" />
                                        <input
                                            type="number" required={!isLogin} min="1" max="120" value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl focus:ring-2 focus:ring-[#E06B8B]/15 focus:border-[#E06B8B]/40 outline-none transition-all text-[#333] placeholder:text-[#ccc] text-sm font-medium"
                                            placeholder="25"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc] group-focus-within:text-[#E06B8B] transition-colors" />
                                <input
                                    type="password" required value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-4 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl focus:ring-2 focus:ring-[#E06B8B]/15 focus:border-[#E06B8B]/40 outline-none transition-all text-[#333] placeholder:text-[#ccc] text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ y: -3, boxShadow: '0 15px 35px rgba(224, 107, 139, 0.35)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-[#E06B8B] text-white rounded-full font-bold text-sm uppercase tracking-[0.15em] shadow-[0_8px_25px_rgba(224,107,139,0.3)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                        )}
                    </motion.button>
                </form>

                {/* Toggle */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/15" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#ccc] font-bold">or</span>
                    <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/15" />
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[#999] text-sm font-light transition-colors"
                    >
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span className="text-[#E06B8B] font-bold hover:underline underline-offset-4">
                            {isLogin ? "Create one" : "Sign in"}
                        </span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
