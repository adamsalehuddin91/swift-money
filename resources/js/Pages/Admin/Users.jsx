import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { ArrowLeft, Mail, CheckCircle, Users, Crown, Search, Send } from 'lucide-react';

function LastActiveBadge({ lastLoginAt }) {
    if (!lastLoginAt) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">—</span>;
    const days = Math.floor((Date.now() - new Date(lastLoginAt)) / 86400000);
    if (days <= 7)  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">🟢 {days === 0 ? 'Hari ini' : `${days}h`}</span>;
    if (days <= 30) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">🟡 {days}h</span>;
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">⚫ {days}h</span>;
}

export default function AdminUsers({ users }) {
    const { flash } = usePage().props;
    const [filter, setFilter]     = useState('all');
    const [search, setSearch]     = useState('');
    const [selected, setSelected] = useState(new Set());
    const [showCompose, setShowCompose] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        user_ids: [],
        subject:  '',
        body:     '',
    });

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchFilter = filter === 'all' || u.plan === filter;
            const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
            return matchFilter && matchSearch;
        });
    }, [users, filter, search]);

    const toggleUser = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => setSelected(new Set(filtered.map(u => u.id)));
    const clearAll  = () => setSelected(new Set());

    const openCompose = () => {
        if (selected.size === 0) return;
        setData('user_ids', [...selected]);
        setShowCompose(true);
    };

    const handleSend = (e) => {
        e.preventDefault();
        post(route('admin.bulk-email'), {
            onSuccess: () => {
                reset();
                setShowCompose(false);
                setSelected(new Set());
            },
        });
    };

    const filterTabs = [
        { key: 'all',  label: 'Semua',  count: users.length },
        { key: 'paid', label: '👑 Pro',  count: users.filter(u => u.plan === 'paid').length },
        { key: 'free', label: 'Free',   count: users.filter(u => u.plan === 'free').length },
    ];

    return (
        <>
            <Head title="Bulk Email — Admin" />

            <div className="min-h-screen bg-slate-50 max-w-lg mx-auto p-4 pb-20 space-y-4">

                {/* Header */}
                <div className="flex items-center gap-3 pt-6">
                    <button onClick={() => router.get(route('admin.index'))} className="p-2 rounded-xl hover:bg-slate-100">
                        <ArrowLeft size={18} className="text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Blast Email</h1>
                        <p className="text-xs text-slate-400">{users.length} pengguna berdaftar</p>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <p className="text-sm text-emerald-700 font-medium">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                        <p className="text-sm text-red-700 font-medium">⚠️ {flash.error}</p>
                    </div>
                )}

                {/* Search */}
                <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
                    <Search size={15} className="text-slate-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama atau email..."
                        className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-300"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2">
                    {filterTabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setFilter(t.key)}
                            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                                filter === t.key
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-500 border border-slate-100'
                            }`}
                        >
                            {t.label} ({t.count})
                        </button>
                    ))}
                </div>

                {/* Select controls */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button onClick={selectAll} className="text-xs font-bold text-indigo-600 hover:underline">
                            Pilih semua ({filtered.length})
                        </button>
                        {selected.size > 0 && (
                            <button onClick={clearAll} className="text-xs font-bold text-slate-400 hover:underline">
                                Kosongkan
                            </button>
                        )}
                    </div>
                    {selected.size > 0 && (
                        <p className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                            {selected.size} dipilih
                        </p>
                    )}
                </div>

                {/* User list */}
                <div className="space-y-2">
                    {filtered.map(u => (
                        <div
                            key={u.id}
                            onClick={() => toggleUser(u.id)}
                            className={`flex items-center gap-3 bg-white rounded-2xl p-3 border cursor-pointer transition-all active:scale-[0.98] ${
                                selected.has(u.id)
                                    ? 'border-indigo-300 bg-indigo-50/40'
                                    : 'border-slate-100'
                            }`}
                        >
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                selected.has(u.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                            }`}>
                                {selected.has(u.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-bold text-slate-700 truncate">{u.name}</p>
                                    {u.plan === 'paid' && <Crown size={10} className="text-amber-500 flex-shrink-0" />}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                                <p className="text-[10px] text-slate-300">{u.family_name}</p>
                            </div>

                            <LastActiveBadge lastLoginAt={u.last_login_at} />
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                            <Users size={28} className="text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">Tiada pengguna ditemui</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky send button */}
            {selected.size > 0 && !showCompose && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                    <button
                        onClick={openCompose}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-2xl shadow-indigo-300 active:scale-95 transition-all"
                    >
                        <Mail size={16} /> Tulis Email ({selected.size} penerima)
                    </button>
                </div>
            )}

            {/* Compose modal */}
            {showCompose && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompose(false)} />
                    <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 pb-10 sm:pb-6">

                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="font-black text-slate-800">Tulis Email</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Kepada: <span className="font-bold text-indigo-600">{selected.size} pengguna</span>
                                </p>
                            </div>
                            <button onClick={() => setShowCompose(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Subject</label>
                                <input
                                    type="text"
                                    value={data.subject}
                                    onChange={e => setData('subject', e.target.value)}
                                    placeholder="cth: Akaun Pro anda telah diaktifkan"
                                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    required
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Mesej</label>
                                <textarea
                                    value={data.body}
                                    onChange={e => setData('body', e.target.value)}
                                    placeholder="Tulis mesej anda di sini..."
                                    rows={6}
                                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                    required
                                />
                                {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl text-sm disabled:opacity-60"
                            >
                                <Send size={15} />
                                {processing ? 'Menghantar...' : `Hantar ke ${selected.size} pengguna`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
