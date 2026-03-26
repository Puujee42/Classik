'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, ArrowRight, Loader2, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import SocialAuthButtons from '@/components/SocialAuthButtons';

function SignInContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_url') || '/';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8 || !password) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Нэвтрэх мэдээлэл буруу байна');
      toast.success('Амжилттай нэвтэрлээ');
      if (data.user) login(data.user);
      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-16 w-56 h-56 rounded-full border border-[#D4AF37]/12 hidden lg:block" />
      <div className="absolute bottom-32 left-20 w-36 h-36 rounded-full border border-[#E06B8B]/10 hidden lg:block" />
      <div className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-[#FCEEF2]/40 blur-[80px] hidden lg:block" />
      <div className="absolute bottom-1/4 right-10 w-60 h-60 rounded-full bg-[#D4AF37]/5 blur-[60px] hidden lg:block" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(224,107,139,0.08)] border border-[#D4AF37]/10 p-8 sm:p-10 relative overflow-hidden">
          {/* Top decorative line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#E06B8B] to-transparent opacity-40" />

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#FCEEF2] to-[#E06B8B]/20 mb-6 border border-[#E06B8B]/15"
            >
              <Sparkles className="w-7 h-7 text-[#E06B8B]" />
            </motion.div>
            <h1 className="font-serif text-3xl text-[#333] mb-2">
              Тавтай морил
            </h1>
            <p className="text-[#888] text-sm font-light">
              {mode === 'password' ? 'Classik account-даа нэвтэрнэ үү' : 'Нэг удаагийн код авахын тулд утсаа оруулна уу'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 mb-8 bg-[#FCEEF2]/60 rounded-full p-1 border border-[#E06B8B]/8">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${mode === 'password'
                ? 'bg-white shadow-[0_4px_12px_rgba(224,107,139,0.1)] text-[#E06B8B]'
                : 'text-[#999]'
                }`}
            >
              Нууц үг
            </button>
            <button
              type="button"
              onClick={() => setMode('otp')}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${mode === 'otp'
                ? 'bg-white shadow-[0_4px_12px_rgba(224,107,139,0.1)] text-[#E06B8B]'
                : 'text-[#999]'
                }`}
            >
              Нэг удаагийн код
            </button>
          </div>

          {/* Password Mode */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] ml-1">
                    Утасны дугаар
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc] group-focus-within:text-[#E06B8B] transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="77181818"
                      className="w-full pl-11 pr-4 py-4 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl focus:ring-2 focus:ring-[#E06B8B]/15 focus:border-[#E06B8B]/40 outline-none transition-all text-[#333] placeholder:text-[#ccc] text-sm font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] ml-1">
                    Нууц үг
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc] group-focus-within:text-[#E06B8B] transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-4 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl focus:ring-2 focus:ring-[#E06B8B]/15 focus:border-[#E06B8B]/40 outline-none transition-all text-[#333] placeholder:text-[#ccc] text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ y: -3, boxShadow: '0 15px 35px rgba(224, 107, 139, 0.35)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#E06B8B] text-white rounded-full font-bold text-sm uppercase tracking-[0.15em] shadow-[0_8px_25px_rgba(224,107,139,0.3)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>
          )}

          {/* OTP Mode */}
          {mode === 'otp' && (
            <div>
              {otpStep === 'phone' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] ml-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="77181818"
                      className="w-full px-4 py-4 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl text-sm font-medium outline-none focus:border-[#E06B8B]/40 focus:ring-2 focus:ring-[#E06B8B]/15 text-[#333] placeholder:text-[#ccc]"
                    />
                  </div>
                  <motion.button
                    whileHover={{ y: -3, boxShadow: '0 15px 35px rgba(224, 107, 139, 0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    disabled={otpLoading}
                    onClick={async () => {
                      setOtpLoading(true);
                      try {
                        const res = await fetch('/api/auth/send-otp', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone }),
                        });
                        if (res.ok) { toast.success('OTP код илгээлээ'); setOtpStep('code'); }
                        else { const d = await res.json(); toast.error(d.error || 'Алдаа гарлаа'); }
                      } finally { setOtpLoading(false); }
                    }}
                    className="w-full py-4 bg-[#E06B8B] text-white font-bold rounded-full text-sm uppercase tracking-[0.15em] shadow-[0_8px_25px_rgba(224,107,139,0.3)] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP Code'}
                  </motion.button>
                </div>
              )}

              {otpStep === 'code' && (
                <div className="space-y-5">
                  <p className="text-sm text-[#888] text-center font-light">Code sent to +976 {phone}</p>
                  <input
                    type="number"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="000000"
                    className="w-full px-4 py-5 bg-[#FAF9F6] border border-[#D4AF37]/12 rounded-2xl text-2xl font-bold text-center tracking-[0.5em] outline-none focus:border-[#E06B8B]/40 text-[#333] placeholder:text-[#ddd]"
                  />
                  <motion.button
                    whileHover={{ y: -3, boxShadow: '0 15px 35px rgba(224, 107, 139, 0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    disabled={otpLoading || otpCode.length !== 6}
                    onClick={async () => {
                      setOtpLoading(true);
                      try {
                        const res = await fetch('/api/auth/verify-otp', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone, code: otpCode }),
                        });
                        const data = await res.json();
                        if (res.ok) { login(data.user); toast.success('Амжилттай нэвтэрлээ'); router.push(redirectTo); }
                        else { toast.error(data.error || 'Код буруу байна'); }
                      } finally { setOtpLoading(false); }
                    }}
                    className="w-full py-4 bg-[#E06B8B] text-white font-bold rounded-full text-sm uppercase tracking-[0.15em] shadow-[0_8px_25px_rgba(224,107,139,0.3)] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
                  </motion.button>
                  <button type="button" onClick={() => setOtpStep('phone')} className="w-full text-sm text-[#999] font-medium py-2 hover:text-[#E06B8B] transition-colors">
                    ← Өөр дугаар сонгох
                  </button>
                </div>
              )}
            </div>
          )}

          <SocialAuthButtons mode="signIn" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/15" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#ccc] font-bold">or</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/15" />
          </div>

          <p className="text-center text-sm text-[#999]">
            Бүртгэлгүй юу?{' '}
            <Link href="/sign-up" className="text-[#E06B8B] font-bold hover:underline underline-offset-4 transition-colors">
              Бүртгүүлэх
            </Link>
          </p>
        </div>

        {/* Bottom branding */}
        <p className="text-center mt-6 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/50 font-bold">
          ✦ Classik — Luxury Skincare ✦
        </p>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-3 border-[#E06B8B] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
