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
        <div className="luxe-screen pb-10">
            <Head title="Kalkulator Zakat" />

            {/* Header */}
            <div className="px-5 pt-6 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => router.get(route('dashboard'))} className="flex items-center gap-1.5 text-slate-400 text-sm font-bold">
                        <ArrowLeft size={16} /> Balik
                    </button>
                    <h1 className="font-display text-lg font-semibold text-white tracking-wide">Kalkulator Zakat</h1>
                    <span className="w-12" />
                </div>
                <div className="text-center">
                    <p className="luxe-label">Jumlah zakat ({prefill.year})</p>
                    <p className="text-5xl luxe-figure mt-1">{fmt(total)}</p>
                    <p className="text-slate-400 text-xs mt-2">kadar {(rate * 100).toFixed(1)}% · nisab {fmt(nisab)}</p>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 mt-4 space-y-4">
                {/* Inputs */}
                <div className="luxe-card p-4 space-y-4">
                    <NumField label="Pendapatan setahun" value={income} onChange={setIncome} hint="diisi auto dari rekod pendapatan" />
                    <NumField label="Simpanan / harta (≥ 1 haul)" value={savings} onChange={setSavings} hint="termasuk ASB, tunai, emas — sahkan sendiri" />
                    <NumField label="Nisab semasa" value={nisab} onChange={setNisab} hint="≈ 85g emas — sahkan dengan pihak zakat" />
                </div>

                {/* Breakdown */}
                <div className="luxe-card p-4 space-y-3">
                    <ResultRow title="Zakat Pendapatan" base={income} nisab={nisab} amount={zIncome} onRecord={() => record('pendapatan', zIncome)} />
                    <div className="border-t border-white/[0.06]" />
                    <ResultRow title="Zakat Simpanan / Harta" base={savings} nisab={nisab} amount={zSavings} onRecord={() => record('simpanan', zSavings)} />
                    <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
                        <span className="font-display font-semibold text-slate-100">Jumlah Zakat</span>
                        <span className="font-bold text-gold text-lg">{fmt(total)}</span>
                    </div>
                    {total > 0 && (
                        <button onClick={() => record('gabungan', total)} className="w-full flex items-center justify-center gap-2 luxe-btn-gold py-3">
                            <Landmark size={16} /> Rekod sebagai rebat cukai (LHDN)
                        </button>
                    )}
                </div>

                {/* Note */}
                <div className="flex gap-2 luxe-card p-3 text-slate-300">
                    <Info size={16} className="shrink-0 mt-0.5 text-gold" />
                    <p className="text-xs leading-relaxed">
                        Zakat yang dibayar = <b className="text-slate-100">rebat cukai</b> (tolak terus dari cukai, bukan pelepasan). Rekod di sini terus masuk modul Cukai/LHDN.
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
            <label className="block luxe-label mb-1">{label}</label>
            <div className="flex items-center luxe-input">
                <span className="text-slate-500 font-bold text-sm mr-2">RM</span>
                <input type="number" step="0.01" value={value}
                    onChange={(e) => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    className="flex-1 bg-transparent border-0 p-0 font-bold text-slate-100 focus:ring-0 text-sm" />
            </div>
            {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
        </div>
    );
}

function ResultRow({ title, base, nisab, amount, onRecord }) {
    const belowNisab = Number(base) < nisab;
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-semibold text-sm text-slate-200">{title}</p>
                {belowNisab
                    ? <p className="text-[11px] text-slate-500">Bawah nisab — tiada zakat</p>
                    : <p className="text-[11px] text-slate-500">2.5% × {fmt(base)}</p>}
            </div>
            <div className="flex items-center gap-3">
                <span className="font-bold text-slate-100">{fmt(amount)}</span>
                {amount > 0 && (
                    <button onClick={onRecord} className="text-[10px] font-black text-gold bg-gold/15 px-2 py-1 rounded-lg uppercase">
                        Rekod
                    </button>
                )}
            </div>
        </div>
    );
}
