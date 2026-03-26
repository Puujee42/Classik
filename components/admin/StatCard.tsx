'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';
import { useVibe } from '@/context/VibeContext';

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: { value: number; label: string }; // e.g. { value: 12, label: 'өнгөрсөн долоо хоногоос' }
    color: 'accent' | 'emerald' | 'blue' | 'red';
    href?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, color, href }: StatCardProps) {
    const isNumber = typeof value === 'number';
    const { currentVibe } = useVibe();

    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { stiffness: 60, damping: 15 });
    const displayValue = useTransform(springValue, (v) => Math.round(v).toLocaleString('mn-MN'));

    useEffect(() => {
        if (isNumber) {
            motionValue.set(value as number);
        }
    }, [value, isNumber, motionValue]);

    const colorConfig = {
        accent: {
            bg: `rgba(var(--vibe-accent-rgb), 0.1)`,
            iconBg: `rgba(var(--vibe-accent-rgb), 0.2)`,
            text: currentVibe.accent,
            border: `rgba(var(--vibe-accent-rgb), 0.2)`
        },
        emerald: {
            bg: 'rgba(16, 185, 129, 0.1)',
            iconBg: 'rgba(16, 185, 129, 0.2)',
            text: '#10b981',
            border: 'rgba(16, 185, 129, 0.2)'
        },
        blue: {
            bg: 'rgba(59, 130, 246, 0.1)',
            iconBg: 'rgba(59, 130, 246, 0.2)',
            text: '#3b82f6',
            border: 'rgba(59, 130, 246, 0.2)'
        },
        red: {
            bg: 'rgba(239, 68, 68, 0.1)',
            iconBg: 'rgba(239, 68, 68, 0.2)',
            text: '#ef4444',
            border: 'rgba(239, 68, 68, 0.2)'
        }
    };

    const config = colorConfig[color];

    const Content = () => (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between h-full transition-all duration-300 hover:border-slate-700 hover:shadow-2xl relative overflow-hidden group">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: config.bg }} />

            <div className="flex items-start justify-between relative z-10 mb-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-slate-400">{title}</h3>
                    <div className="text-3xl font-bold tracking-tight text-white flex items-end gap-1">
                        {isNumber ? <motion.span>{displayValue}</motion.span> : <span>{value}</span>}
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: config.iconBg, borderColor: config.border }}>
                    <Icon className="w-6 h-6" style={{ color: config.text }} strokeWidth={2} />
                </div>
            </div>

            {trend && (
                <div className="flex items-center gap-2 relative z-10 mt-auto pt-4 border-t border-slate-800">
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend.value >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                    <span className="text-xs text-slate-500">{trend.label}</span>
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block w-full h-full">
                <motion.div whileHover={{ y: -4 }} className="h-full">
                    <Content />
                </motion.div>
            </Link>
        );
    }

    return (
        <motion.div whileHover={{ y: -4 }} className="h-full">
            <Content />
        </motion.div>
    );
}
