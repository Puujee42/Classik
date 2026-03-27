'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock, Eye, BarChart2, Smartphone, Fingerprint, Activity, PauseCircle, Trash2 } from 'lucide-react';
import { useVibe } from '@/context/VibeContext';

export default function PrivacyPage() {
    const { currentVibe } = useVibe();
    const [dataUsage, setDataUsage] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    const [biometrics, setBiometrics] = useState(true);

    const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 shadow-inner"
            style={{ backgroundColor: enabled ? currentVibe.accent : '#E5E5E5' }}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    );

    return (
        <div className="min-h-screen font-sans pb-10" style={{ backgroundColor: currentVibe.bg }}>
            {/* Header */}
            <div className="glass-white h-[56px] flex items-center px-4 sticky top-0 z-50">
                <Link href="/profile" className="p-2 -ml-2 text-[#1A1A1A]">
                    <ChevronLeft className="w-6 h-6" strokeWidth={2} />
                </Link>
                <h1 className="flex-1 text-center text-[16px] font-bold text-[#1A1A1A] pr-8">
                    Нууцлал & Аюулгүй байдал
                </h1>
            </div>

            <div className="p-4 space-y-6 mt-2">

                {/* Нууцлал */}
                <div>
                    <h2 className="text-[11px] font-bold text-[#999999] uppercase tracking-widest ml-4 mb-2 flex items-center gap-1.5">
                        <span className="w-4 h-px rounded-full" style={{ backgroundColor: currentVibe.accent }} />
                        Нууцлал
                    </h2>
                    <div className="card-classik overflow-hidden">

                        <Link href="/settings/password" className="flex items-center justify-between px-4 h-[64px] active:bg-gray-50 transition-colors border-b border-gray-100 group">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentVibe.accent}12` }}>
                                    <Lock className="w-5 h-5" style={{ color: currentVibe.accent }} strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-[#1A1A1A]">Нууц үг солих</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#888] group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
                        </Link>

                        <Link href="/settings/visibility" className="flex items-center justify-between px-4 h-[64px] active:bg-gray-50 transition-colors border-b border-gray-100 group">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentVibe.accent}12` }}>
                                    <Eye className="w-5 h-5" style={{ color: currentVibe.accent }} strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-[#1A1A1A]">Профайл харагдах байдал</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#888] group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
                        </Link>

                        <div className="flex items-center justify-between px-4 h-[64px]">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center" style={{ backgroundColor: dataUsage ? `${currentVibe.accent}12` : '#F5F5F5' }}>
                                    <BarChart2 className="w-5 h-5" style={{ color: dataUsage ? currentVibe.accent : '#999999' }} strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-[#1A1A1A]">Мэдээлэл ашиглалт</span>
                            </div>
                            <Toggle enabled={dataUsage} onToggle={() => setDataUsage(!dataUsage)} />
                        </div>

                    </div>
                </div>

                {/* Аюулгүй байдал */}
                <div>
                    <h2 className="text-[11px] font-bold text-[#999999] uppercase tracking-widest ml-4 mb-2 flex items-center gap-1.5">
                        <span className="w-4 h-px rounded-full" style={{ backgroundColor: currentVibe.accent }} />
                        Аюулгүй байдал
                    </h2>
                    <div className="card-classik overflow-hidden">

                        <div className="flex items-center justify-between px-4 h-[64px] border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center" style={{ backgroundColor: twoFactor ? `${currentVibe.accent}12` : '#F5F5F5' }}>
                                    <Smartphone className="w-5 h-5" style={{ color: twoFactor ? currentVibe.accent : '#999999' }} strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-[#1A1A1A]">2 шатлалт баталгаажуулалт</span>
                            </div>
                            <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
                        </div>

                        <div className="flex items-center justify-between px-4 h-[64px] border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center" style={{ backgroundColor: biometrics ? `${currentVibe.accent}12` : '#F5F5F5' }}>
                                    <Fingerprint className="w-5 h-5" style={{ color: biometrics ? currentVibe.accent : '#999999' }} strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-[#1A1A1A]">Биометр нэвтрэлт</span>
                            </div>
                            <Toggle enabled={biometrics} onToggle={() => setBiometrics(!biometrics)} />
                        </div>

                        <Link href="/settings/sessions" className="flex items-center justify-between px-4 h-[64px] active:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentVibe.accent}12` }}>
                                    <Activity className="w-5 h-5" style={{ color: currentVibe.accent }} strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-[#1A1A1A]">Идэвхтэй сесс харах</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#888] group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
                        </Link>

                    </div>
                </div>

                {/* Дансны удирдлага */}
                <div>
                    <h2 className="text-[11px] font-bold text-[#999999] uppercase tracking-widest ml-4 mb-2 flex items-center gap-1.5">
                        <span className="w-4 h-px rounded-full bg-red-300" />
                        Дансны удирдлага
                    </h2>
                    <div className="card-classik overflow-hidden">

                        <button className="w-full flex items-center justify-between px-4 h-[64px] active:bg-gray-50 transition-colors text-left border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl bg-amber-50 flex items-center justify-center">
                                    <PauseCircle className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-amber-600">Данс түр зогсоох</span>
                            </div>
                        </button>

                        <button className="w-full flex items-center justify-between px-4 h-[64px] active:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-[40px] h-[40px] rounded-xl bg-red-50 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                                </div>
                                <span className="text-[15px] font-bold text-red-500">Данс устгах</span>
                            </div>
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}
