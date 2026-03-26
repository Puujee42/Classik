'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
    Package, PlusCircle, Pencil, Trash2, Loader2, ArrowLeft,
    Search, Filter, Star, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { deleteProduct } from '@/app/actions/products';
import { useVibe } from '@/context/VibeContext';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
    const [editingStock, setEditingStock] = useState<{ id: string, value: string } | null>(null);
    const { currentVibe } = useVibe();

    const { data: productsData, mutate: mutateProducts } = useSWR('/api/products', fetcher);
    const { data: categoriesData } = useSWR('/api/categories', fetcher);

    const products = productsData?.products || [];
    const categories = categoriesData?.categories || [];
    const loading = !productsData;

    const searchParams = useSearchParams();
    const urlFilter = searchParams.get('filter'); // 'low-stock' | null

    const filteredProducts = products.filter((product: any) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesLowStock = urlFilter !== 'low-stock' || (product.inventory || 0) < 5;
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    const handleDelete = async (id: string) => {
        // Custom confirm dialog logic could be added here later
        if (!window.confirm('Энэ барааг устгах уу? Энэ үйлдэл буцаагдахгүй.')) return;

        try {
            const result = await deleteProduct(id);
            if (result.success) {
                toast.success('Бараа устгагдлаа');
                mutateProducts();
            } else {
                toast.error(result.error || 'Алдаа гарлаа');
            }
        } catch {
            toast.error('Сервертэй холбогдож чадсангүй');
        }
    };

    const handleToggleFeatured = async (product: any) => {
        const newValue = !product.featured;
        setTogglingFeatured(product._id);
        try {
            const res = await fetch(`/api/products/${product._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: newValue }),
            });
            if (res.ok) {
                mutateProducts((currentData: any) => {
                    if (!currentData || !currentData.products) return currentData;
                    return {
                        ...currentData,
                        products: currentData.products.map((p: any) => p._id === product._id ? { ...p, featured: newValue } : p)
                    };
                }, false);
                toast.success(newValue ? 'Онцгой болголоо ⭐' : 'Онцгой-оос хаслаа');
                // Note: нүүр хуудасны carousel дараагийн 60 секундын дараа автоматаар шинэчлэгдэнэ
                // (Cache-Control: s-maxage=60). Яаралтай шинэчлэх шаардлагагүй.
            } else {
                toast.error('Алдаа гарлаа');
            }
        } catch {
            toast.error('Сервертэй холбогдож чадсангүй');
        } finally {
            setTogglingFeatured(null);
        }
    };

    const handleStockUpdate = async (productId: string, newInventory: number) => {
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });
            if (res.ok) {
                mutateProducts();
                toast.success('Нөөц шинэчлэгдлээ');
            } else {
                toast.error('Алдаа гарлаа');
            }
        } catch {
            toast.error('Сервертэй холбогдож чадсангүй');
        } finally {
            setEditingStock(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30">
                <div className="px-6 sm:px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors hidden sm:block">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">Бүтээгдэхүүн <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs font-medium">{products.length}</span></h1>
                            <p className="text-xs text-slate-400 mt-1">Жагсаалт, хайлт, устгах зэрэг үйлдлүүд</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-colors font-bold shadow-lg text-sm"
                        style={{ backgroundColor: currentVibe.accent, boxShadow: `0 8px 20px ${currentVibe.glow}` }}
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Бараа нэмэх</span>
                        <span className="sm:hidden">Нэмэх</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            id="admin-search"
                            type="text"
                            placeholder="Бараа хайх... ( ' / ' дарж идэвхжүүлнэ )"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 text-sm transition-all"
                            style={{ '--tw-ring-color': `${currentVibe.accent}80`, borderColor: searchTerm ? `${currentVibe.accent}50` : undefined } as React.CSSProperties}
                        />
                    </div>

                    <div className="w-px h-6 bg-slate-800 hidden sm:block" />

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <Filter className="w-4 h-4 text-slate-500 hidden sm:block shrink-0" />
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors`}
                            style={filterCategory === 'all' ? { backgroundColor: currentVibe.accent, color: 'white' } : { backgroundColor: 'rgb(30 41 59)', color: '#94a3b8' }}
                        >
                            Ангилал бүгд
                        </button>
                        {categories.map((cat: any) => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors`}
                                style={filterCategory === cat.id ? { backgroundColor: currentVibe.accent, color: 'white' } : { backgroundColor: 'rgb(30 41 59)', color: '#94a3b8' }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}

                {/* MOBILE CARD LIST */}
                <div className="md:hidden space-y-3">
                  {loading ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: currentVibe.accent }} />
                    </div>
                  ) : filteredProducts.map((product: any) => (
                    <div key={product._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                          {product.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm leading-tight line-clamp-2">{product.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                          <p className="font-black text-sm mt-1" style={{ color: currentVibe.accent }}>{formatPrice(product.price)}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Link href={`/admin/products/${product._id}`}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(product._id)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${product.stockStatus === 'in-stock' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {product.stockStatus === 'in-stock' ? '● Бэлэн' : '○ Захиалга'}
                        </span>
                        <span className="text-xs text-slate-500">Үлд: {product.inventory ?? 0}ш</span>
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          disabled={togglingFeatured === product._id}
                          className={`ml-auto text-xs font-bold px-2 py-1 rounded-lg transition-colors`}
                          style={product.featured ? { backgroundColor: `${currentVibe.accent}30`, color: currentVibe.accent } : { backgroundColor: 'rgb(30 41 59)', color: '#64748b' }}
                        >
                          {togglingFeatured === product._id ? <Loader2 className="w-3 h-3 animate-spin" /> : product.featured ? '⭐ Онцгой' : 'Онцгой болгох'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-950/50 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                    <th className="px-6 py-4">Зураг</th>
                                    <th className="px-6 py-4">Нэр & Ангилал</th>
                                    <th className="px-6 py-4">Үнэ</th>
                                    <th className="px-6 py-4">Үлдэгдэл</th>
                                    <th className="px-6 py-4 text-center">Онцгой</th>
                                    <th className="px-6 py-4 text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: currentVibe.accent }} />
                                            <p className="text-slate-500 text-sm mt-4">Ачаалж байна...</p>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((p: any) => (
                                        <tr key={p._id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 ring-1 ring-slate-700">
                                                    {p.image ? (
                                                        <Image src={p.image} alt="" fill className="object-cover" sizes="48px" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-slate-600 absolute inset-0 m-auto" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/products/${p._id}`} className="text-sm font-bold text-white transition-colors" style={{ '--hover-color': currentVibe.accent } as React.CSSProperties}>
                                                    {p.name}
                                                </Link>
                                                <div className="text-xs text-slate-500 mt-1">{categories.find((c: any) => c.id === p.category)?.name || p.category}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-sm" style={{ color: currentVibe.accent }}>{formatPrice(p.price)}</span>
                                                {p.originalPrice && p.originalPrice > p.price && (
                                                    <span className="ml-2 text-xs text-slate-500 line-through">{formatPrice(p.originalPrice)}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {editingStock?.id === p._id ? (
                                                        <input
                                                            type="number"
                                                            value={editingStock!.value}
                                                            onChange={e => setEditingStock({ id: p._id, value: e.target.value })}
                                                            onBlur={() => handleStockUpdate(p._id, parseInt(editingStock!.value) || 0)}
                                                            onKeyDown={e => e.key === 'Enter' && handleStockUpdate(p._id, parseInt(editingStock!.value) || 0)}
                                                            className="w-16 bg-slate-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1"
                                                            style={{ '--tw-ring-color': `${currentVibe.accent}80` } as React.CSSProperties}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <>
                                                            <span
                                                                onClick={() => setEditingStock({ id: p._id, value: String(p.inventory || 0) })}
                                                                className={`cursor-pointer transition-colors text-sm font-bold ${(p.inventory || 0) < 5 ? 'text-red-400' : 'text-slate-300'}`}
                                                                style={{ '--hover-color': currentVibe.accent } as React.CSSProperties}
                                                            >
                                                                {p.inventory || 0}ш
                                                            </span>
                                                            {(p.inventory || 0) < 5 && (
                                                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleFeatured(p)}
                                                    disabled={togglingFeatured === p._id}
                                                    className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                                                    style={p.featured ? {
                                                        backgroundColor: `${currentVibe.accent}30`,
                                                        color: currentVibe.accent,
                                                    } : {
                                                        backgroundColor: 'rgb(30 41 59)',
                                                        color: '#64748b',
                                                    }}
                                                    title={p.featured ? 'Онцгой-оос хасах' : 'Онцгой болгох'}
                                                >
                                                    {togglingFeatured === p._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-all">
                                                    <Link
                                                        href={`/admin/products/${p._id}`}
                                                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all font-medium text-xs flex items-center gap-1"
                                                        title="Засах"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        <span className="hidden xl:inline">Засах</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(p._id)}
                                                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium text-xs flex items-center gap-1"
                                                        title="Устгах"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="hidden xl:inline">Устгах</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-6 h-6 text-slate-500" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">Бараа олдсонгүй</h3>
                                            <p className="text-slate-500 text-sm">Хайлтын утга эсвэл ангиллаа өөрчилж үзнэ үю.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
