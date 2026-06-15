import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, FileText, Plus, Trash2, Pencil, Paperclip, Eye, X, Info, Users, User,
} from 'lucide-react';

function fmt(v) {
    return `RM ${Number(v || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Cukai({ ya, scope, available_yas, summary, items }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const reload = (params) => router.get(route('tax.index'), { ya, scope, ...params }, { preserveScroll: true });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Head title="Cukai / LHDN" />

            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-5 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => router.get(route('dashboard'))} className="flex items-center gap-1.5 text-indigo-200 text-sm font-bold">
                        <ArrowLeft size={16} /> Balik
                    </button>
                    <h1 className="font-black tracking-wide">Cukai / LHDN</h1>
                    <button onClick={() => router.get(route('tax.summary'), { ya, scope })} className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10">
                        <FileText size={14} /> e-Filing
                    </button>
                </div>

                {/* YA + scope */}
                <div className="flex gap-2 mb-4">
                    <select value={ya} onChange={(e) => reload({ ya: e.target.value })}
                        className="bg-white/10 border border-white/15 rounded-xl text-xs font-bold px-3 py-1.5 text-white focus:ring-0">
                        {available_yas.map((y) => <option key={y} value={y} className="text-slate-800">YA {y}</option>)}
                    </select>
                    <div className="flex bg-white/10 rounded-xl p-0.5 border border-white/15">
                        <button onClick={() => reload({ scope: 'me' })} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${scope === 'me' ? 'bg-white text-indigo-700' : 'text-indigo-200'}`}>
                            <User size={12} /> Saya
                        </button>
                        <button onClick={() => reload({ scope: 'family' })} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${scope === 'family' ? 'bg-white text-indigo-700' : 'text-indigo-200'}`}>
                            <Users size={12} /> Keluarga
                        </button>
                    </div>
                </div>

                {/* Estimate cards */}
                <div className="grid grid-cols-2 gap-3">
                    <Stat label="Pendapatan setahun" value={fmt(summary.income)} />
                    <Stat label="Jumlah pelepasan" value={fmt(summary.relief_total)} accent="text-emerald-300" />
                    <Stat label="Pendapatan bercukai" value={fmt(summary.chargeable)} />
                    <Stat label="Anggaran cukai" value={fmt(summary.tax_after_rebate)} accent="text-amber-300"
                        sub={summary.rebate_total > 0 ? `selepas rebat zakat ${fmt(summary.rebate_total)}` : null} />
                </div>
            </div>

            <div className="max-w-xl mx-auto p-4 -mt-4 space-y-4">
                {/* Disclaimer */}
                <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-800">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                        <b>Anggaran sahaja.</b> Kadar & had pelepasan berubah setiap Belanjawan — sahkan dengan LHDN / borang rasmi sebelum e-Filing.
                    </p>
                </div>

                {/* Category caps */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Pelepasan vs Had ({ya})</p>
                    <div className="space-y-3">
                        {summary.categories.map((c) => (
                            <div key={c.id}>
                                <div className="flex justify-between items-baseline text-sm mb-1">
                                    <span className="font-bold text-slate-700">
                                        {c.name}
                                        {c.type === 'rebate' && <span className="ml-1 text-[9px] font-black bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full uppercase">Rebat</span>}
                                    </span>
                                    <span className={`font-bold ${c.over ? 'text-red-500' : 'text-slate-600'}`}>
                                        {fmt(c.claimed)}{c.cap !== null && <span className="text-slate-400 font-medium"> / {fmt(c.cap)}</span>}
                                    </span>
                                </div>
                                {c.cap !== null && (
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${c.over ? 'bg-red-500' : c.pct >= 90 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${c.pct}%` }} />
                                    </div>
                                )}
                                {c.over && <p className="text-[10px] text-red-500 font-bold mt-0.5">Melebihi had — hanya {fmt(c.counted)} dikira</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Pelepasan ({items.length})</p>
                        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                            <Plus size={14} /> Tambah
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-6">Belum ada item. Tambah perbelanjaan yang layak pelepasan cukai.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {items.map((it) => (
                                <ItemRow key={it.id} item={it} onEdit={() => { setEditing(it); setShowForm(true); }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <ItemForm
                    ya={ya}
                    categories={summary.categories}
                    item={editing}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
}

function Stat({ label, value, accent = 'text-white', sub }) {
    return (
        <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wide">{label}</p>
            <p className={`text-lg font-black ${accent}`}>{value}</p>
            {sub && <p className="text-[9px] text-indigo-300">{sub}</p>}
        </div>
    );
}

function ItemRow({ item, onEdit }) {
    const upload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        router.post(route('tax.receipt.upload', item.id), { receipt: file, _method: 'post' }, { preserveScroll: true, forceFormData: true });
    };

    return (
        <div className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
                <p className="font-bold text-sm text-slate-700 truncate">{item.title}</p>
                <p className="text-[11px] text-slate-400">
                    {item.category}{item.date ? ` • ${item.date}` : ''}{item.by ? ` • ${item.by}` : ''}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="font-black text-sm text-slate-700">{fmt(item.amount)}</span>
                {item.has_receipt ? (
                    <a href={route('tax.receipt.view', item.id)} target="_blank" rel="noreferrer" className="text-emerald-500 p-1" title="Lihat resit"><Eye size={16} /></a>
                ) : (
                    <label className="text-slate-400 p-1 cursor-pointer" title="Muat naik resit">
                        <Paperclip size={16} />
                        <input type="file" accept="image/*" className="hidden" onChange={upload} />
                    </label>
                )}
                <button onClick={onEdit} className="text-indigo-500 p-1"><Pencil size={15} /></button>
                <button onClick={() => router.delete(route('tax.items.destroy', item.id), { preserveScroll: true })} className="text-red-400 p-1"><Trash2 size={15} /></button>
            </div>
        </div>
    );
}

function ItemForm({ ya, categories, item, onClose }) {
    const { data, setData, post, put, processing, errors } = useForm({
        ya,
        tax_relief_category_id: item?.category_id || categories[0]?.id || '',
        title: item?.title || '',
        amount: item?.amount || '',
        date: item?.date || '',
        note: item?.note || '',
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        if (item) put(route('tax.items.update', item.id), opts);
        else post(route('tax.items.store'), opts);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="font-black text-slate-800">{item ? 'Edit Item' : 'Tambah Item Pelepasan'}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400"><X size={20} /></button>
                </div>

                <Field label="Kategori pelepasan" error={errors.tax_relief_category_id}>
                    <select value={data.tax_relief_category_id} onChange={(e) => setData('tax_relief_category_id', e.target.value)} className="input">
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </Field>

                <Field label="Tajuk / keterangan" error={errors.title}>
                    <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="cth. Beli laptop" className="input" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Jumlah (RM)" error={errors.amount}>
                        <input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} placeholder="0.00" className="input" />
                    </Field>
                    <Field label="Tarikh" error={errors.date}>
                        <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className="input" />
                    </Field>
                </div>

                <Field label="Nota (pilihan)" error={errors.note}>
                    <input type="text" value={data.note} onChange={(e) => setData('note', e.target.value)} className="input" />
                </Field>

                <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white font-black py-3 rounded-2xl disabled:opacity-50">
                    {processing ? 'Menyimpan…' : item ? 'Kemaskini' : 'Simpan'}
                </button>

                <style>{`.input{width:100%;border:1px solid #e2e8f0;border-radius:0.9rem;padding:0.6rem 0.8rem;font-size:0.875rem;font-weight:600;color:#334155;}.input:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 1px #6366f1;}`}</style>
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
