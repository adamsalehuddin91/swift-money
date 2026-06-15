import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, X, Camera, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function fmt(v) {
    return `RM ${Number(v || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TYPE_LABEL = {
    cash: 'Tunai / Bank', investment: 'Pelaburan', property: 'Hartanah',
    epf: 'KWSP / EPF', gold: 'Emas', vehicle: 'Kenderaan', other: 'Lain-lain',
};
const TYPE_EMOJI = { cash: '💵', investment: '📈', property: '🏠', epf: '🏦', gold: '🪙', vehicle: '🚗', other: '📦' };

export default function NetWorth({ summary, assets, snapshots, debts, types }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const up = summary.change === null || summary.change >= 0;

    return (
        <div className="luxe-screen pb-10">
            <Head title="Nilai Bersih" />

            {/* Header */}
            <div className="px-5 pt-6 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => router.get(route('dashboard'))} className="flex items-center gap-1.5 text-slate-400 text-sm font-bold">
                        <ArrowLeft size={16} /> Balik
                    </button>
                    <h1 className="font-display text-lg font-semibold text-white tracking-wide">Nilai Bersih</h1>
                    <button onClick={() => router.post(route('networth.capture'))} className="flex items-center gap-1.5 luxe-chip px-3 py-1.5 text-xs font-bold" title="Simpan snapshot bulan ini">
                        <Camera size={14} className="text-gold" /> Snapshot
                    </button>
                </div>
                <div className="text-center">
                    <p className="luxe-label">Nilai bersih semasa</p>
                    <p className={`text-5xl luxe-figure mt-1 ${summary.net_worth < 0 ? 'text-red-400' : 'text-white'}`}>{fmt(summary.net_worth)}</p>
                    {summary.change !== null && (
                        <p className={`text-xs font-bold mt-2 flex items-center justify-center gap-1 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                            {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {up ? '+' : ''}{fmt(summary.change)} dari snapshot lepas
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="luxe-card p-3">
                        <p className="luxe-label">Aset</p>
                        <p className="text-lg luxe-figure text-emerald-400">{fmt(summary.total_assets)}</p>
                    </div>
                    <div className="luxe-card p-3">
                        <p className="luxe-label">Hutang</p>
                        <p className="text-lg luxe-figure text-red-400">{fmt(summary.total_liabilities)}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 mt-4 space-y-4">
                {/* Trend graph */}
                {snapshots.length >= 2 ? (
                    <div className="luxe-card p-4">
                        <p className="luxe-label mb-3">Trend Nilai Bersih</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={snapshots} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A44" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#111A2E', border: '1px solid #1E2A44', borderRadius: 12, color: '#e2e8f0' }} />
                                <Line type="monotone" dataKey="net_worth" stroke="#C8A24B" strokeWidth={3} dot={{ r: 3, fill: '#C8A24B' }} name="Nilai bersih" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="luxe-card p-4 text-center">
                        <p className="text-sm text-slate-200 font-bold">Tekan <Camera size={13} className="inline text-gold" /> Snapshot setiap bulan</p>
                        <p className="text-xs text-slate-500 mt-1">Lepas 2 bulan, graf trend akan muncul di sini.</p>
                    </div>
                )}

                {/* Assets */}
                <div className="luxe-card p-4">
                    <div className="flex justify-between items-center mb-3">
                        <p className="luxe-label">Aset ({assets.length})</p>
                        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1 luxe-btn-gold text-xs px-3 py-1.5">
                            <Plus size={14} /> Tambah
                        </button>
                    </div>
                    {assets.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm py-6">Tambah aset — ASB, KWSP, rumah, tunai, emas…</p>
                    ) : (
                        <div className="divide-y divide-white/[0.06]">
                            {assets.map((a) => (
                                <div key={a.id} className="flex items-center justify-between py-2.5">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-200 truncate">{TYPE_EMOJI[a.type]} {a.name}</p>
                                        <p className="text-[11px] text-slate-500">{TYPE_LABEL[a.type]}{a.note ? ` • ${a.note}` : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className="font-bold text-sm text-emerald-400">{fmt(a.value)}</span>
                                        <button onClick={() => { setEditing(a); setShowForm(true); }} className="text-gold p-1"><Pencil size={15} /></button>
                                        <button onClick={() => router.delete(route('networth.assets.destroy', a.id), { preserveScroll: true })} className="text-red-400 p-1"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Liabilities (from debts) */}
                <div className="luxe-card p-4">
                    <p className="luxe-label mb-3">Hutang (dari modul Hutang)</p>
                    {debts.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm py-4">Tiada hutang aktif. 🎉</p>
                    ) : (
                        <div className="divide-y divide-white/[0.06]">
                            {debts.map((d) => (
                                <div key={d.id} className="flex items-center justify-between py-2.5">
                                    <p className="font-semibold text-sm text-slate-200">{d.title}</p>
                                    <span className="font-bold text-sm text-red-400">{fmt(d.remaining)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showForm && <AssetForm types={types} asset={editing} onClose={() => setShowForm(false)} />}
        </div>
    );
}

function AssetForm({ types, asset, onClose }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: asset?.name || '',
        type: asset?.type || 'cash',
        value: asset?.value || '',
        note: asset?.note || '',
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        if (asset) put(route('networth.assets.update', asset.id), opts);
        else post(route('networth.assets.store'), opts);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-ink-soft border border-white/10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="font-display font-semibold text-white">{asset ? 'Edit Aset' : 'Tambah Aset'}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400"><X size={20} /></button>
                </div>

                <Field label="Nama aset" error={errors.name}>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="cth. ASB, KWSP" className="luxe-input" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Jenis" error={errors.type}>
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="luxe-input">
                            {types.map((t) => <option key={t} value={t} className="text-slate-800">{TYPE_LABEL[t]}</option>)}
                        </select>
                    </Field>
                    <Field label="Nilai (RM)" error={errors.value}>
                        <input type="number" step="0.01" value={data.value} onChange={(e) => setData('value', e.target.value)} placeholder="0.00" className="luxe-input" />
                    </Field>
                </div>
                <Field label="Nota (pilihan)" error={errors.note}>
                    <input type="text" value={data.note} onChange={(e) => setData('note', e.target.value)} className="luxe-input" />
                </Field>

                <button type="submit" disabled={processing} className="w-full luxe-btn-gold py-3 disabled:opacity-50">
                    {processing ? 'Menyimpan…' : asset ? 'Kemaskini' : 'Simpan'}
                </button>
            </form>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block luxe-label mb-1">{label}</label>
            {children}
            {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
        </div>
    );
}
