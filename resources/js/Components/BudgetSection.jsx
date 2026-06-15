import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Target, Plus, Trash2, X } from 'lucide-react';

// Budget per category vs actual spending (from expenses) for the month.
export default function BudgetSection({ budgets = [], categories = [] }) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        category: categories[0] || 'Lain2',
        monthly_limit: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('budgets.store'), { preserveScroll: true, onSuccess: () => { reset('monthly_limit'); setShowForm(false); } });
    };

    const remove = (id) => {
        if (confirm('Padam bajet ni?')) router.delete(route('budgets.destroy', id), { preserveScroll: true });
    };

    const barColor = (b) => b.over ? 'bg-red-500' : b.pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                    <Target size={14} className="text-indigo-500" /> Bajet Kategori
                </h2>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg active:scale-95 transition-all"
                >
                    {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? 'Tutup' : 'Set Bajet'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-white rounded-2xl p-3 shadow-sm mb-3 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <select
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="number" step="0.01" min="0" required
                            value={data.monthly_limit}
                            onChange={e => setData('monthly_limit', e.target.value)}
                            placeholder="Had RM"
                            className="w-28 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        />
                    </div>
                    <button disabled={processing} className="bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl active:scale-95 transition-all disabled:opacity-50">
                        {processing ? 'Menyimpan…' : 'Simpan Bajet'}
                    </button>
                </form>
            )}

            {budgets.length === 0 ? (
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center text-xs text-slate-400">
                    Belum set bajet. Tetapkan had perbelanjaan ikut kategori untuk pantau spending.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {budgets.map(b => (
                        <div key={b.id} className="bg-white rounded-2xl p-3 shadow-sm">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-bold text-slate-700">{b.category}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold ${b.over ? 'text-red-500' : 'text-slate-500'}`}>
                                        RM {b.spent.toFixed(2)} / {b.limit.toFixed(2)}
                                    </span>
                                    <button onClick={() => remove(b.id)} className="text-slate-300 hover:text-red-400"><Trash2 size={13} /></button>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${barColor(b)} rounded-full transition-all`} style={{ width: `${Math.min(b.pct, 100)}%` }} />
                            </div>
                            <div className={`text-[10px] font-semibold mt-1 ${b.over ? 'text-red-500' : 'text-slate-400'}`}>
                                {b.over ? `⚠️ Lebih bajet RM ${Math.abs(b.remaining).toFixed(2)}` : `Baki RM ${b.remaining.toFixed(2)} (${b.pct}%)`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
