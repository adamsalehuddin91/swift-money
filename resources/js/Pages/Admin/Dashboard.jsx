import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Users, Crown, Lock, CheckCircle, ChevronDown, Trash2, Mail, PauseCircle, PlayCircle, RefreshCw, Send } from 'lucide-react';

function StatCard({ label, value, color, filterKey, activeFilter }) {
    const isActive = activeFilter === filterKey;
    return (
        <button
            onClick={() => router.get(route('admin.index'), filterKey ? { filter: isActive ? '' : filterKey } : {}, { preserveState: false })}
            className={`rounded-2xl p-4 shadow-sm border text-center w-full transition-all active:scale-95 ${
                isActive
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white border-slate-100 hover:border-indigo-200'
            }`}
        >
            <p className={`text-2xl font-black ${isActive ? 'text-white' : color}`}>{value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{label}</p>
        </button>
    );
}

function LastActiveBadge({ lastLoginAt }) {
    if (!lastLoginAt) {
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">Tak pernah login</span>;
    }

    const days = Math.floor((Date.now() - new Date(lastLoginAt)) / 86400000);

    if (days <= 7) {
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">🟢 Aktif ({days === 0 ? 'Hari ini' : `${days}h lalu`})</span>;
    }
    if (days <= 30) {
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">🟡 {days}h lalu</span>;
    }
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">⚫ {days}h lalu</span>;
}

function EmailModal({ show, family, onClose }) {
    const { data, setData, post, processing, reset, errors } = useForm({ subject: '', body: '' });

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.families.email', family.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-800">Hantar Email</h3>
                    <p className="text-xs text-slate-400">{family.name}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Subject</label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={e => setData('subject', e.target.value)}
                            placeholder="e.g. Akaun anda telah diaktifkan"
                            className="w-full bg-slate-50 border-none rounded-2xl p-3 mt-1 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                        />
                        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mesej</label>
                        <textarea
                            value={data.body}
                            onChange={e => setData('body', e.target.value)}
                            placeholder="Tulis mesej anda di sini..."
                            rows={5}
                            className="w-full bg-slate-50 border-none rounded-2xl p-3 mt-1 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                        />
                        {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body}</p>}
                    </div>
                    <p className="text-[10px] text-slate-400">
                        Email akan dihantar ke {family.users.length} ahli: {family.users.map(u => u.email).join(', ')}
                    </p>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl active:scale-95 transition-all">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-2xl active:scale-95 transition-all disabled:opacity-50">
                            {processing ? 'Menghantar...' : 'Hantar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirm({ show, family, onClose }) {
    const [confirmed, setConfirmed] = useState(false);

    if (!show) return null;

    const handleDelete = () => {
        router.delete(route('admin.families.delete', family.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl space-y-4 text-center">
                <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                    <h3 className="text-base font-black text-slate-800">Padam Akaun</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Akaun <span className="font-bold text-slate-700">{family.name}</span> dan semua data akan dipadam kekal.
                    </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer justify-center">
                    <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="rounded" />
                    Saya faham tindakan ini tidak boleh diundur
                </label>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl active:scale-95 transition-all">
                        Batal
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!confirmed}
                        className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-2xl active:scale-95 transition-all disabled:opacity-40"
                    >
                        Padam
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExtendModal({ show, family, onClose }) {
    const { data, setData, post, processing } = useForm({ months: 1 });

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.families.extend', family.id), {
            onSuccess: () => onClose(),
        });
    };

    const currentExpiry = family.plan_expires_at
        ? `Expire sekarang: ${family.plan_expires_at}`
        : 'Belum ada expiry';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl space-y-4">
                <div>
                    <h3 className="text-base font-black text-slate-800">Lanjut Tempoh</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{family.name} · {currentExpiry}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <select
                        value={data.months}
                        onChange={e => setData('months', parseInt(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-2xl p-3 text-sm font-medium"
                    >
                        {[1,2,3,6,12].map(m => (
                            <option key={m} value={m}>+{m} bulan</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl active:scale-95 transition-all">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-500 rounded-2xl active:scale-95 transition-all disabled:opacity-50">
                            {processing ? '...' : 'Lanjut'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FamilyCard({ family }) {
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const { data, setData, post, processing } = useForm({ months: 1 });

    const handleUpgrade = (e) => {
        e.preventDefault();
        post(route('admin.families.upgrade', family.id), {
            onSuccess: () => setShowUpgrade(false),
        });
    };

    const handleSuspend = () => {
        router.post(route('admin.families.suspend', family.id), {}, { preserveScroll: true });
    };

    return (
        <>
            <EmailModal show={showEmail} family={family} onClose={() => setShowEmail(false)} />
            <DeleteConfirm show={showDelete} family={family} onClose={() => setShowDelete(false)} />
            <ExtendModal show={showExtend} family={family} onClose={() => setShowExtend(false)} />

            <div className={`bg-white rounded-2xl p-4 shadow-sm border space-y-3 ${family.is_suspended ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-800 text-sm">{family.name}</p>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${family.is_paid ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                {family.is_paid ? '👑 PRO' : 'FREE'}
                            </span>
                            {family.is_suspended && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                    🚫 SUSPENDED
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">ID: {family.id}</p>
                    </div>
                    <div className="text-right">
                        {family.is_paid && family.plan_expires_at && (
                            <p className="text-[10px] text-slate-400">Expire: {family.plan_expires_at}</p>
                        )}
                        {family.subscribed_at && (
                            <p className="text-[10px] text-slate-300">Since: {family.subscribed_at}</p>
                        )}
                    </div>
                </div>

                {/* Members + Last Active */}
                <div className="space-y-1.5">
                    {family.users.map(u => (
                        <div key={u.id} className="flex items-center justify-between text-xs gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                                    {u.role}
                                </span>
                                <span className="text-slate-700 truncate">{u.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <LastActiveBadge lastLoginAt={u.last_login_at} />
                            </div>
                            <span className="text-slate-300 font-mono text-[10px] w-full truncate">{u.email}</span>
                        </div>
                    ))}
                </div>

                {/* Actions Row 1 */}
                <div className="flex gap-2 pt-1 border-t border-slate-50">
                    {!family.is_paid ? (
                        <button
                            onClick={() => setShowUpgrade(!showUpgrade)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 py-2 rounded-xl active:scale-95 transition-all"
                        >
                            <Crown size={11}/> Upgrade <ChevronDown size={11}/>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowExtend(true)}
                                className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 py-2 rounded-xl active:scale-95 transition-all"
                            >
                                <RefreshCw size={11}/> Lanjut
                            </button>
                            <button
                                onClick={() => router.post(route('admin.families.downgrade', family.id))}
                                className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 py-2 rounded-xl active:scale-95 transition-all"
                            >
                                <Lock size={11}/> Free
                            </button>
                        </>
                    )}
                </div>

                {/* Actions Row 2 */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEmail(true)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 py-2 rounded-xl active:scale-95 transition-all"
                    >
                        <Mail size={11}/> Email
                    </button>
                    <button
                        onClick={handleSuspend}
                        className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-xl active:scale-95 transition-all ${
                            family.is_suspended
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-orange-600 bg-orange-50'
                        }`}
                    >
                        {family.is_suspended ? <><PlayCircle size={11}/> Aktif</> : <><PauseCircle size={11}/> Suspend</>}
                    </button>
                    <button
                        onClick={() => setShowDelete(true)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-red-600 bg-red-50 py-2 rounded-xl active:scale-95 transition-all"
                    >
                        <Trash2 size={11}/> Padam
                    </button>
                </div>

                {/* Upgrade form */}
                {showUpgrade && (
                    <form onSubmit={handleUpgrade} className="flex gap-2 items-center bg-amber-50 p-3 rounded-xl">
                        <select
                            value={data.months}
                            onChange={e => setData('months', parseInt(e.target.value))}
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
        </>
    );
}

export default function AdminDashboard({ stats, families, query, filter }) {
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
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-2">
                        <span className="text-base">⚠️</span>
                        <p className="text-sm text-red-700 font-medium">{flash.error}</p>
                    </div>
                )}

                {/* Bulk Email shortcut */}
                <button
                    onClick={() => router.get(route('admin.users.index'))}
                    className="w-full flex items-center gap-3 bg-indigo-600 text-white rounded-2xl p-4 active:scale-95 transition-all"
                >
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Send size={16} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-sm">Blast Email</p>
                        <p className="text-indigo-200 text-xs">Pilih & hantar email ke pengguna terpilih</p>
                    </div>
                </button>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total Family" value={stats.total_families} color="text-indigo-600" filterKey="all" activeFilter={filter} />
                    <StatCard label="Pro" value={stats.paid_families} color="text-amber-600" filterKey="paid" activeFilter={filter} />
                    <StatCard label="Free" value={stats.free_families} color="text-slate-600" filterKey="free" activeFilter={filter} />
                    <StatCard label="Total Users" value={stats.total_users} color="text-emerald-600" />
                    <StatCard label="Suspended" value={stats.suspended_families} color="text-red-500" filterKey="suspended" activeFilter={filter} />
                </div>
                {filter && (
                    <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest -mt-1">
                        Menunjukkan: {filter === 'paid' ? '👑 Pro' : filter === 'free' ? 'Free' : filter === 'suspended' ? '🚫 Suspended' : 'Semua'} — {families.length} keluarga
                    </p>
                )}

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
                        {families.map(f => (
                            <FamilyCard key={f.id} family={f} />
                        ))}
                    </div>
                )}

                {(query || filter) && families.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                        <p className="text-slate-400 text-sm">Tiada hasil ditemui.</p>
                    </div>
                )}

                {!query && !filter && (
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 space-y-2">
                        <Users size={32} className="text-slate-300 mx-auto"/>
                        <p className="text-slate-400 text-sm">Klik kad stat di atas atau cari nama / email.</p>
                    </div>
                )}

                <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                    SwiftMoney Admin Panel
                </p>
            </div>
        </>
    );
}
