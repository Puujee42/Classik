'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Edit3, Trash2, Plus, Loader2 } from 'lucide-react';
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
        <div className="min-h-screen bg-[#F5F5F5] font-sans pb-[100px]">
            {/* Header */}
            <div className="bg-white h-[56px] flex items-center px-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sticky top-0 z-50">
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
                        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="py-20 flex flex-col items-center text-center px-4">
                        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <MapPin className="w-10 h-10 text-[#FF6B00]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-2">Хаяг бүртгэлгүй байна</h3>
                        <p className="text-[14px] text-[#999999]">Хүргэлтийн хаягаа нэмнэ үү</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr._id} className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 relative">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <MapPin className="w-5 h-5 text-[#FF6B00]" strokeWidth={2} />
                                </div>
                                <div className="flex-1 pr-12">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[15px] font-bold text-[#1A1A1A]">{addr.name}</h3>
                                        {addr.isDefault && (
                                            <span className="bg-[#E6F4EA] text-[#137333] px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">
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
                                <button className="text-[#999999] hover:text-[#FF6B00] transition-colors p-1" aria-label="Засах">
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
            <div className="fixed left-0 right-0 p-4 bg-white border-t border-gray-100 z-40" style={{ bottom: '56px' }}>
                <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white text-[15px] font-bold rounded-xl shadow-[0_4px_12px_rgba(255,107,0,0.3)] active:opacity-90 transition-opacity">
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Хаяг нэмэх
                </button>
            </div>
        </div>
    );
}
