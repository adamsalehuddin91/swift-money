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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Head title="Nilai Bersih" />

            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white p-5 pb-10">
                <div className="flex items-center justify-between mb-5">
                    <button onClick={() => router.get(route('dashboard'))} className="flex items-center gap-1.5 text-slate-300 text-sm font-bold">
                        <ArrowLeft size={16} /> Balik
                    </button>
                    <h1 className="font-black tracking-wide">Nilai Bersih</h1>
                    <button onClick={() => router.post(route('networth.capture'))} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10" title="Simpan snapshot bulan ini">
                        <Camera size={14} /> Snapshot
                    </button>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nilai bersih semasa</p>
                    <p className="text-4xl font-black">{fmt(summary.net_worth)}</p>
                    {summary.change !== null && (
                        <p className={`text-xs font-bold mt-1 flex items-center justify-center gap-1 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                            {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {up ? '+' : ''}{fmt(summary.change)} dari snapshot lepas
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Aset</p>
                        <p className="text-lg font-black text-emerald-400">{fmt(summary.total_assets)}</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Hutang</p>
                        <p className="text-lg font-black text-red-400">{fmt(summary.total_liabilities)}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto p-4 -mt-5 space-y-4">
                {/* Trend graph */}
                {snapshots.length >= 2 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Trend Nilai Bersih</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={snapshots} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v) => fmt(v)} />
                                <Line type="monotone" dataKey="net_worth" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} name="Nilai bersih" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
                        <p className="text-sm text-indigo-700 font-bold">Tekan <Camera size={13} className="inline" /> Snapshot setiap bulan</p>
                        <p className="text-xs text-indigo-400 mt-1">Lepas 2 bulan, graf trend akan muncul di sini.</p>
                    </div>
                )}

                {/* Assets */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aset ({assets.length})</p>
                        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                            <Plus size={14} /> Tambah
                        </button>
                    </div>
                    {assets.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-6">Tambah aset — ASB, KWSP, rumah, tunai, emas…</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {assets.map((a) => (
                                <div key={a.id} className="flex items-center justify-between py-2.5">
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-700 truncate">{TYPE_EMOJI[a.type]} {a.name}</p>
                                        <p className="text-[11px] text-slate-400">{TYPE_LABEL[a.type]}{a.note ? ` • ${a.note}` : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className="font-black text-sm text-emerald-600">{fmt(a.value)}</span>
                                        <button onClick={() => { setEditing(a); setShowForm(true); }} className="text-indigo-500 p-1"><Pencil size={15} /></button>
                                        <button onClick={() => router.delete(route('networth.assets.destroy', a.id), { preserveScroll: true })} className="text-red-400 p-1"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Liabilities (from debts) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Hutang (dari modul Hutang)</p>
                    {debts.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-4">Tiada hutang aktif. 🎉</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {debts.map((d) => (
                                <div key={d.id} className="flex items-center justify-between py-2.5">
                                    <p className="font-bold text-sm text-slate-700">{d.title}</p>
                                    <span className="font-black text-sm text-red-500">{fmt(d.remaining)}</span>
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
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="font-black text-slate-800">{asset ? 'Edit Aset' : 'Tambah Aset'}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400"><X size={20} /></button>
                </div>

                <Field label="Nama aset" error={errors.name}>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="cth. ASB, KWSP" className="nw-input" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Jenis" error={errors.type}>
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="nw-input">
                            {types.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                        </select>
                    </Field>
                    <Field label="Nilai (RM)" error={errors.value}>
                        <input type="number" step="0.01" value={data.value} onChange={(e) => setData('value', e.target.value)} placeholder="0.00" className="nw-input" />
                    </Field>
                </div>
                <Field label="Nota (pilihan)" error={errors.note}>
                    <input type="text" value={data.note} onChange={(e) => setData('note', e.target.value)} className="nw-input" />
                </Field>

                <button type="submit" disabled={processing} className="w-full bg-slate-800 text-white font-black py-3 rounded-2xl disabled:opacity-50">
                    {processing ? 'Menyimpan…' : asset ? 'Kemaskini' : 'Simpan'}
                </button>

                <style>{`.nw-input{width:100%;border:1px solid #e2e8f0;border-radius:0.9rem;padding:0.6rem 0.8rem;font-size:0.875rem;font-weight:600;color:#334155;}.nw-input:focus{outline:none;border-color:#475569;box-shadow:0 0 0 1px #475569;}`}</style>
            </form>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
            {children}
            {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>
    );
}
