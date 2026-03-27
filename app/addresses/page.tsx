'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Edit3, Trash2, Plus, Loader2 } from 'lucide-react';
import { useVibe } from '@/context/VibeContext';
import toast from 'react-hot-toast';

type Address = {
    _id: string;
    name: string;
    fullName: string;
    phone: string;
    address: string;
    isDefault: boolean;
};

export default function AddressPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentVibe } = useVibe();

    useEffect(() => {
        fetch('/api/user/addresses')
            .then(res => res.json())
            .then(data => setAddresses(data.addresses || []))
            .catch(() => toast.error('Хаяг татахад алдаа гарлаа'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setAddresses(prev => prev.filter(a => a._id !== id));
            toast.success('Хаяг устгагдлаа');
        } catch {
            toast.error('Устгахад алдаа гарлаа');
        }
    };

    return (
        <div className="min-h-screen font-sans pb-[100px]" style={{ backgroundColor: currentVibe.bg }}>
            {/* Header */}
            <div className="glass-white h-[56px] flex items-center px-4 sticky top-0 z-50">
                <Link href="/profile" className="p-2 -ml-2 text-[#1A1A1A]">
                    <ChevronLeft className="w-6 h-6" strokeWidth={2} />
                </Link>
                <h1 className="flex-1 text-center text-[16px] font-bold text-[#1A1A1A] pr-8">
                    Хаягийн бүртгэл
                </h1>
            </div>

            <div className="p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: currentVibe.accent }} />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="py-20 flex flex-col items-center text-center px-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${currentVibe.accent}15` }}>
                            <MapPin className="w-10 h-10" style={{ color: currentVibe.accent }} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-2">Хаяг бүртгэлгүй байна</h3>
                        <p className="text-[14px] text-[#999999]">Хүргэлтийн хаягаа нэмнэ үү</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr._id} className="card-classik p-4 relative">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <MapPin className="w-5 h-5" style={{ color: currentVibe.accent }} strokeWidth={2} />
                                </div>
                                <div className="flex-1 pr-12">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[15px] font-bold text-[#1A1A1A]">{addr.name}</h3>
                                        {addr.isDefault && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border" style={{
                                                backgroundColor: `${currentVibe.accent}10`,
                                                color: currentVibe.accent,
                                                borderColor: `${currentVibe.accent}30`
                                            }}>
                                                Үндсэн хаяг
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[13px] text-[#444444] font-medium mb-1">
                                        {addr.fullName} <span className="text-[#999999] mx-1">|</span> {addr.phone}
                                    </div>
                                    <p className="text-[13px] text-[#666666] leading-relaxed">{addr.address}</p>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 flex flex-col gap-3">
                                <button className="text-[#999999] transition-colors p-1" style={{ ['--hover-color' as string]: currentVibe.accent }} onMouseEnter={e => (e.currentTarget.style.color = currentVibe.accent)} onMouseLeave={e => (e.currentTarget.style.color = '#999999')} aria-label="Засах">
                                    <Edit3 className="w-4 h-4" strokeWidth={2} />
                                </button>
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    className="text-[#999999] hover:text-red-500 transition-colors p-1"
                                    aria-label="Устгах"
                                >
                                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-40" style={{ bottom: '56px' }}>
                <button
                    className="btn-rose w-full flex items-center justify-center gap-2 py-3.5 text-white text-[15px] font-bold rounded-xl"
                    style={{ backgroundColor: currentVibe.accent, boxShadow: `0 4px 14px ${currentVibe.glow}` }}
                >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Хаяг нэмэх
                </button>
            </div>
        </div>
    );
}
