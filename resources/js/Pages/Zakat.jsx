import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { ArrowLeft, Info, Landmark } from 'lucide-react';

function fmt(v) {
    return `RM ${Number(v || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Zakat({ prefill }) {
    const [income, setIncome]   = useState(prefill.annual_income || 0);
    const [savings, setSavings] = useState(prefill.savings_total || 0);
    const [nisab, setNisab]     = useState(prefill.nisab);
    const rate = prefill.rate;

    const zIncome  = useMemo(() => (Number(income)  >= nisab ? Number(income)  * rate : 0), [income, nisab, rate]);
    const zSavings = useMemo(() => (Number(savings) >= nisab ? Number(savings) * rate : 0), [savings, nisab, rate]);
    const total    = zIncome + zSavings;

    const record = (kind, amount) => {
        if (amount <= 0) return;
        router.post(route('zakat.record'), { kind, amount: Number(amount).toFixed(2) }, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Head title="Kalkulator Zakat" />

            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-5 pb-10">
                <div className="flex items-center justify-between mb-5">
                    <button onClick={() => router.get(route('dashboard'))} className="flex items-center gap-1.5 text-emerald-200 text-sm font-bold">
                        <ArrowLeft size={16} /> Balik
                    </button>
                    <h1 className="font-black tracking-wide">Kalkulator Zakat</h1>
                    <span className="w-12" />
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">Jumlah zakat ({prefill.year})</p>
                    <p className="text-4xl font-black">{fmt(total)}</p>
                    <p className="text-emerald-300 text-xs mt-1">kadar {(rate * 100).toFixed(1)}% · nisab {fmt(nisab)}</p>
                </div>
            </div>

            <div className="max-w-xl mx-auto p-4 -mt-5 space-y-4">
                {/* Inputs */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
                    <NumField label="Pendapatan setahun" value={income} onChange={setIncome} hint="diisi auto dari rekod pendapatan" />
                    <NumField label="Simpanan / harta (≥ 1 haul)" value={savings} onChange={setSavings} hint="termasuk ASB, tunai, emas — sahkan sendiri" />
                    <NumField label="Nisab semasa" value={nisab} onChange={setNisab} hint="≈ 85g emas — sahkan dengan pihak zakat" />
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    <ResultRow
                        title="Zakat Pendapatan"
                        base={income}
                        nisab={nisab}
                        amount={zIncome}
                        onRecord={() => record('pendapatan', zIncome)}
                    />
                    <div className="border-t border-slate-100" />
                    <ResultRow
                        title="Zakat Simpanan / Harta"
                        base={savings}
                        nisab={nisab}
                        amount={zSavings}
                        onRecord={() => record('simpanan', zSavings)}
                    />
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <span className="font-black text-slate-700">Jumlah Zakat</span>
                        <span className="font-black text-emerald-600 text-lg">{fmt(total)}</span>
                    </div>
                    {total > 0 && (
                        <button onClick={() => record('gabungan', total)}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-black py-3 rounded-2xl">
                            <Landmark size={16} /> Rekod sebagai rebat cukai (LHDN)
                        </button>
                    )}
                </div>

                {/* Note */}
                <div className="flex gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-800">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                        Zakat yang dibayar = <b>rebat cukai</b> (tolak terus dari cukai, bukan pelepasan). Rekod di sini terus masuk modul Cukai/LHDN.
                        Anggaran sahaja — sahkan nisab & kaedah kiraan dengan pihak zakat negeri.
                    </p>
                </div>
            </div>
        </div>
    );
}

function NumField({ label, value, onChange, hint }) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-500">
                <span className="text-slate-400 font-bold text-sm mr-2">RM</span>
                <input type="number" step="0.01" value={value}
                    onChange={(e) => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    className="flex-1 border-0 p-0 font-bold text-slate-700 focus:ring-0 text-sm" />
            </div>
            {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

function ResultRow({ title, base, nisab, amount, onRecord }) {
    const belowNisab = Number(base) < nisab;
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-bold text-sm text-slate-700">{title}</p>
                {belowNisab
                    ? <p className="text-[11px] text-slate-400">Bawah nisab — tiada zakat</p>
                    : <p className="text-[11px] text-slate-400">2.5% × {fmt(base)}</p>}
            </div>
            <div className="flex items-center gap-3">
                <span className="font-black text-slate-700">{fmt(amount)}</span>
                {amount > 0 && (
                    <button onClick={onRecord} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">
                        Rekod
                    </button>
                )}
            </div>
        </div>
    );
}
