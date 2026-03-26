'use client';

import { motion } from 'framer-motion';
import {
  Phone, MapPin, Facebook, Instagram, MessageCircle,
  ShieldCheck, Truck, Headphones, CreditCard,
  Smartphone, Mail, ArrowRight, Globe, ChevronDown,
  QrCode, Apple, Play
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useVibe } from '@/context/VibeContext';
import { useState } from 'react';

export default function Footer() {
  const { language, setLanguage, currency } = useLanguage();
  const { t } = useTranslation();
  const { currentVibe } = useVibe();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic
    setEmail('');
  };

  const trustBadges = [
    { icon: ShieldCheck, title: t('footer', 'securePayment'), desc: t('footer', 'securePaymentDesc') },
    { icon: Truck, title: t('footer', 'fastDelivery'), desc: t('footer', 'fastDeliveryDesc') },
    { icon: Headphones, title: t('footer', 'support247'), desc: t('footer', 'support247Desc') },
    { icon: CreditCard, title: t('footer', 'moneyBack'), desc: t('footer', 'moneyBackDesc') },
  ];

  return (
    <footer className="relative font-sans pt-12 overflow-hidden" style={{ backgroundColor: currentVibe.bg }}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${currentVibe.accent}05)` }} />

      {/* Trust Strip - Premium Style */}
      <div className="relative border-y border-[#D4AF37]/10 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:-translate-y-1 transition-all duration-300 border border-[#D4AF37]/10" style={{ boxShadow: `0 4px 14px ${currentVibe.glow}` }}>
                  <badge.icon className="w-6 h-6 transition-colors" style={{ color: currentVibe.accent }} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-[#333] text-sm group-hover:opacity-80 transition-opacity" style={{ color: currentVibe.accent }}>{badge.title}</h4>
                  <p className="text-xs text-[#666] mt-0.5">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Column 1: Brand & App (Large) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <Link href="/" className="inline-block flex-shrink-0">
                <div className="flex flex-col items-start leading-none group">
                  <span className="font-serif text-3xl font-bold transition-colors duration-500" style={{ color: currentVibe.accent }}>Classik</span>
                  <span className="text-[9px] font-sans tracking-[0.25em] text-[#D4AF37] uppercase font-bold mt-1">Арьс Арчилгаа</span>
                </div>
              </Link>
              <p className="text-sm text-[#666] leading-relaxed max-w-xs pt-2">
                {t('footer', 'description')}
              </p>
            </div>

            {/* App Download Section - Premium Aesthetic */}
            <div className="p-5 bg-white rounded-2xl border border-[#D4AF37]/10 shadow-[0_8px_30px_rgba(224,107,139,0.06)] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 transition-all duration-500 group-hover:scale-150" style={{ background: `radial-gradient(circle, ${currentVibe.accent}, transparent)` }} />
              <h4 className="text-sm font-bold text-[#333] mb-4 flex items-center gap-2 relative z-10">
                <Smartphone className="w-4 h-4" style={{ color: currentVibe.accent }} />
                {t('footer', 'downloadApp')}
              </h4>
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#D4AF37]/20">
                  <QrCode className="w-[52px] h-[52px]" style={{ color: currentVibe.accent }} />
                </div>
                <div className="space-y-2.5 flex-1">
                  <button className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-[#FAF9F6] rounded-xl transition-all w-full border border-[#D4AF37]/15 hover:border-[#D4AF37]/30 shadow-sm" style={{ '--hover-ring': `${currentVibe.accent}33` } as React.CSSProperties}>
                    <Apple className="w-5 h-5 text-[#333]" fill="currentColor" />
                    <div className="text-left">
                      <div className="text-[9px] text-[#999] leading-none uppercase font-bold tracking-wider">{t('footer', 'downloadOn')}</div>
                      <div className="text-xs font-bold text-[#333]">{t('footer', 'appStore')}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-[#FAF9F6] rounded-xl transition-all w-full border border-[#D4AF37]/15 hover:border-[#D4AF37]/30 shadow-sm">
                    <Play className="w-5 h-5 text-[#333] fill-current" />
                    <div className="text-left">
                      <div className="text-[9px] text-[#999] leading-none uppercase font-bold tracking-wider">{t('footer', 'getItOn')}</div>
                      <div className="text-xs font-bold text-[#333]">{t('footer', 'googlePlay')}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: About */}
          <div className="lg:col-span-2 space-y-6 lg:pl-4">
            <h3 className="text-xs font-bold text-[#333] uppercase tracking-[0.15em]">{t('footer', 'about')}</h3>
            <ul className="space-y-3.5">
              {[
                { label: t('footer', 'aboutUs'), href: '#' },
                { label: t('footer', 'careers'), href: '#' },
                { label: t('footer', 'news'), href: '#' },
                { label: t('footer', 'privacyPolicy'), href: '#' },
                { label: t('footer', 'termsOfService'), href: '#' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-[#666] hover:text-[#333] transition-colors inline-block relative group">
                    <span>{item.label}</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4AF37] transition-all group-hover:w-full" style={{ backgroundColor: currentVibe.accent }} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-bold text-[#333] uppercase tracking-[0.15em]">{t('footer', 'help')}</h3>
            <ul className="space-y-3.5">
              {[
                { label: t('footer', 'helpCenter'), href: '#' },
                { label: t('footer', 'trackOrder'), href: '#' },
                { label: t('footer', 'returns'), href: '#' },
                { label: t('footer', 'shippingInfo'), href: '#' },
                { label: t('footer', 'contactUs'), href: '#' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-[#666] hover:text-[#333] transition-colors inline-block relative group">
                    <span>{item.label}</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4AF37] transition-all group-hover:w-full" style={{ backgroundColor: currentVibe.accent }} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#333] uppercase tracking-[0.15em]">{t('footer', 'stayConnected')}</h3>
              <p className="text-sm text-[#666]">
                {t('footer', 'newsletterDesc')}
              </p>
              <form onSubmit={handleSubscribe} className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer', 'emailPlaceholder')}
                  className="w-full pl-5 pr-14 py-3.5 bg-white/60 backdrop-blur-sm border border-[#D4AF37]/20 rounded-full text-sm text-[#333] placeholder-[#999] focus:outline-none focus:bg-white transition-all shadow-sm"
                  style={{ '--tw-ring-color': `${currentVibe.accent}30` } as React.CSSProperties}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 text-white rounded-full transition-all flex items-center justify-center hover:shadow-md hover:-translate-y-0.5"
                  style={{ backgroundColor: currentVibe.accent }}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="space-y-5">
              <h3 className="text-xs font-bold text-[#333] uppercase tracking-[0.15em]">{t('footer', 'followUs')}</h3>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, href: 'https://www.facebook.com/1ClassicShop', hoverColor: '#1877F2' },
                  { icon: Instagram, href: 'https://www.instagram.com/blxkroom/', hoverColor: '#E4405F' },
                  { icon: MessageCircle, href: 'https://whatsapp.com', hoverColor: '#25D366' },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-white border border-[#D4AF37]/15 rounded-full text-[#666] transition-all duration-300 shadow-sm hover:-translate-y-1 hover:border-transparent group"
                  >
                    <social.icon className="w-4 h-4 transition-colors group-hover:text-white" style={{ '--tw-text-opacity': 1, ':hover': { color: social.hoverColor } } as any} />
                    {/* The hover style fix is needed since inline pseudo-classes don't work directly, so we use a simpler approach */}
                    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" style={{ backgroundColor: social.hoverColor }} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#D4AF37]/10 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            {/* Copyright */}
            <p className="text-xs text-[#888] text-center md:text-left font-medium">
              {t('footer', 'copyright').replace('Soyol Video Shop', 'Classik Store')} ✦ Бүх эрх хуулиар хамгаалагдсан.
            </p>

            {/* Language & Currency Selectors */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#666] hover:text-[#333] transition-colors uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" style={{ color: currentVibe.accent }} />
                  <span>{language === 'MN' ? 'Монгол' : 'English'}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </div>

              <div className="h-3 w-px bg-[#D4AF37]/20" />

              <div className="relative group">
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#666] hover:text-[#333] transition-colors uppercase tracking-wider">
                  <span>{currency}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </div>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all duration-500">
              {['visa', 'mastercard', 'amex', 'paypal'].map((card) => (
                <div key={card} className="h-6 w-11 bg-white rounded-md flex items-center justify-center border border-[#D4AF37]/15 shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-[#666]">{card}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
