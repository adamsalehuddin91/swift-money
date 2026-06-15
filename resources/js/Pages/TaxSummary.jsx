import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

function fmt(v) {
    return `RM ${Number(v || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TaxSummary({ ya, scope, summary, items, family_name, person }) {
    const relief  = summary.categories.filter((c) => c.type !== 'rebate');
    const rebate  = summary.categories.filter((c) => c.type === 'rebate');
    const withClaim = (arr) => arr.filter((c) => c.claimed > 0);

    return (
        <>
            <Head title={`Cukai YA ${ya} — ${person}`} />

            {/* Controls — hidden on print */}
            <div className="no-print flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
                <button onClick={() => router.get(route('tax.index'), { ya, scope })} className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <ArrowLeft size={16} /> Balik
                </button>
                <p className="font-black text-slate-700">e-Filing YA {ya}</p>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl">
                    <Printer size={14} /> Cetak / PDF
                </button>
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-6 font-sans text-slate-800 print:p-4 print:space-y-4">

                {/* Header */}
                <div className="text-center border-b pb-4 print:pb-2">
                    <h1 className="text-xl font-black text-indigo-700">{family_name}</h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Persediaan e-Filing — YA {ya}</p>
                    <p className="text-slate-400 text-xs mt-1">{person}</p>
                </div>

                {/* Estimate summary */}
                <div className="rounded-2xl p-5 bg-indigo-50 border border-indigo-100 space-y-1">
                    <Row label="Pendapatan setahun" value={fmt(summary.income)} />
                    <Row label="Jumlah pelepasan" value={fmt(summary.relief_total)} green />
                    <Row label="Pendapatan bercukai (anggaran)" value={fmt(summary.chargeable)} bold />
                    <div className="border-t border-indigo-100 mt-1 pt-1">
                        <Row label="Anggaran cukai sebelum rebat" value={fmt(summary.tax_before)} />
                        {summary.rebate_total > 0 && <Row label="Rebat (zakat/fitrah)" value={`− ${fmt(summary.rebate_total)}`} green />}
                        <Row label="Anggaran cukai perlu bayar" value={fmt(summary.tax_after_rebate)} bold />
                    </div>
                </div>

                {/* Relief breakdown */}
                <Section title="Pelepasan Cukai (Relief)">
                    {withClaim(relief).length === 0 && <p className="text-sm text-slate-400">Tiada item direkod.</p>}
                    {withClaim(relief).map((c) => (
                        <Row key={c.id} label={c.name} value={fmt(c.counted)}
                            sub={c.cap !== null ? `dituntut ${fmt(c.claimed)} / had ${fmt(c.cap)}${c.over ? ' (lebihan tidak dikira)' : ''}` : null} />
                    ))}
                    <div className="border-t mt-2 pt-2">
                        <Row label="Jumlah Pelepasan" value={fmt(summary.relief_total)} bold />
                    </div>
                </Section>

                {/* Rebate breakdown */}
                {withClaim(rebate).length > 0 && (
                    <Section title="Rebat Cukai">
                        {withClaim(rebate).map((c) => <Row key={c.id} label={c.name} value={fmt(c.counted)} />)}
                        <div className="border-t mt-2 pt-2">
                            <Row label="Jumlah Rebat" value={fmt(summary.rebate_total)} bold />
                        </div>
                    </Section>
                )}

                {/* Item list */}
                <Section title={`Senarai Item (${items.length})`}>
                    {items.length === 0 && <p className="text-sm text-slate-400">Tiada item.</p>}
                    {items.map((it) => (
                        <Row key={it.id} label={`${it.title}`} value={fmt(it.amount)}
                            sub={`${it.category}${it.date ? ` • ${it.date}` : ''}${it.has_receipt ? ' • resit ✓' : ' • tiada resit'}`} />
                    ))}
                </Section>

                {/* Disclaimer */}
                <p className="text-center text-[10px] text-slate-400 pt-4 border-t print:pt-2">
                    ⚠️ Anggaran sahaja — kadar & had berubah setiap Belanjawan. Sahkan dengan LHDN / borang rasmi.<br />
                    SwiftMoney — Dijana {new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
        </>
    );
}

function Section({ title, children }) {
    return (
        <div className="border border-slate-100 rounded-2xl p-4 print:rounded-none print:border-x-0 print:border-t-0 print:border-b print:p-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 print:mb-1">{title}</p>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

function Row({ label, value, bold, green, red, sub }) {
    return (
        <div className="flex justify-between items-start text-sm py-0.5">
            <div>
                <span className={bold ? 'font-bold text-slate-700' : 'text-slate-600'}>{label}</span>
                {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
            </div>
            <span className={`font-bold ${green ? 'text-green-600' : red ? 'text-red-500' : bold ? 'text-slate-800' : 'text-slate-600'}`}>{value}</span>
        </div>
    );
}
