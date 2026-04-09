import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Users, Crown, Unlock, Lock, CheckCircle, ChevronDown } from 'lucide-react';

function StatCard({ label, value, color }) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{label}</p>
        </div>
    );
}

function FamilyCard({ family, onUpgrade, onDowngrade }) {
    const [showUpgrade, setShowUpgrade] = useState(false);
    const { data, setData, post, processing } = useForm({ months: 1 });

    const handleUpgrade = (e) => {
        e.preventDefault();
        post(route('admin.families.upgrade', family.id), {
            onSuccess: () => setShowUpgrade(false),
        });
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-sm">{family.name}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${family.is_paid ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                            {family.is_paid ? '👑 PRO' : 'FREE'}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">ID: {family.id}</p>
                </div>
                <div className="text-right">
                    {family.is_paid && family.plan_expires_at && (
                        <p className="text-[10px] text-slate-400">Expire: {family.plan_expires_at}</p>
                    )}
                </div>
            </div>

            {/* Members */}
            <div className="space-y-1">
                {family.users.map(u => (
                    <div key={u.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{u.name}</span>
                        <span className="text-slate-400 font-mono">{u.email}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                            {u.role}
                        </span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-50">
                {family.is_paid ? (
                    <button
                        onClick={() => router.post(route('admin.families.downgrade', family.id))}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 py-2 rounded-xl active:scale-95 transition-all"
                    >
                        <Lock size={12}/> Turun ke Free
                    </button>
                ) : (
                    <button
                        onClick={() => setShowUpgrade(!showUpgrade)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 py-2 rounded-xl active:scale-95 transition-all"
                    >
                        <Crown size={12}/> Upgrade Pro <ChevronDown size={12}/>
                    </button>
                )}
            </div>

            {/* Upgrade form */}
            {showUpgrade && (
                <form onSubmit={handleUpgrade} className="flex gap-2 items-center bg-amber-50 p-3 rounded-xl">
                    <select
                        value={data.months}
                        onChange={e => setData('months', e.target.value)}
                        className="flex-1 text-xs bg-white border border-amber-200 rounded-lg px-2 py-1.5 font-medium"
                    >
                        {[1,2,3,6,12].map(m => (
                            <option key={m} value={m}>{m} bulan</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={processing}
                        className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                        {processing ? '...' : 'Confirm'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function AdminDashboard({ stats, families, query }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(query || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.search'), { q: search }, { preserveState: true });
    };

    return (
        <>
            <Head title="Admin — SwiftMoney" />
            <div className="min-h-screen bg-slate-50 max-w-lg mx-auto p-4 pb-10 space-y-5">

                {/* Header */}
                <div className="pt-6">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">SwiftMoney Admin</h1>
                    <p className="text-slate-400 text-xs mt-1">Urus users & subscription</p>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-500"/>
                        <p className="text-sm text-emerald-700 font-medium">{flash.success}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Total Keluarga" value={stats.total_families} color="text-indigo-600" />
                    <StatCard label="Pro Users" value={stats.paid_families} color="text-amber-600" />
                    <StatCard label="Free Users" value={stats.free_families} color="text-slate-600" />
                    <StatCard label="Total Pengguna" value={stats.total_users} color="text-emerald-600" />
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
                        <Search size={16} className="text-slate-400 flex-shrink-0"/>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari email atau nama..."
                            className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white font-bold px-4 rounded-2xl text-sm active:scale-95 transition-all"
                    >
                        Cari
                    </button>
                </form>

                {/* Results */}
                {families.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {families.length} keputusan
                        </p>
                        {families.map(f => (
                            <FamilyCard key={f.id} family={f} />
                        ))}
                    </div>
                )}

                {query && families.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                        <p className="text-slate-400 text-sm">Tiada hasil untuk "<span className="font-bold">{query}</span>"</p>
                    </div>
                )}

                {!query && (
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 space-y-2">
                        <Users size={32} className="text-slate-300 mx-auto"/>
                        <p className="text-slate-400 text-sm">Cari email atau nama pengguna di atas.</p>
                    </div>
                )}

                <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                    SwiftMoney Admin Panel
                </p>
            </div>
        </>
    );
}
