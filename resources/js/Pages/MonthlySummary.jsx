import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

function fmt(v) {
    return `RM ${Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(monthYear) {
    if (!monthYear) return '';
    const [m, y] = monthYear.split('-');
    const months = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    return `${months[parseInt(m)]} ${y}`;
}

export default function MonthlySummary({ monthYear, income, bills, summary, expenses, total_expenses, net, savings, debts, family_name }) {
    const paid   = bills.filter(b => b.paid);
    const unpaid = bills.filter(b => !b.paid);

    return (
        <>
            <Head title={`Ringkasan ${monthLabel(monthYear)}`} />

            {/* Print controls — hidden on print */}
            <div className="no-print flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
                <button onClick={() => router.get(route('dashboard'))} className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <ArrowLeft size={16} /> Balik
                </button>
                <p className="font-black text-slate-700">Ringkasan {monthLabel(monthYear)}</p>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl">
                    <Printer size={14} /> Cetak / PDF
                </button>
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-6 font-sans text-slate-800 print:p-4 print:space-y-4">

                {/* Header */}
                <div className="text-center border-b pb-4 print:pb-2">
                    <h1 className="text-xl font-black text-indigo-700">{family_name}</h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Penyata Kewangan — {monthLabel(monthYear)}</p>
                </div>

                {/* Net balance highlight */}
                <div className={`rounded-2xl p-5 text-center ${net >= 0 ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Baki Bersih</p>
                    <p className={`text-3xl font-black ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>{fmt(net)}</p>
                </div>

                {/* Income */}
                <Section title="Pendapatan">
                    <Row label="Jumlah Pendapatan" value={fmt(income)} bold green />
                </Section>

                {/* Bills */}
                <Section title={`Komitmen (${bills.length} item)`}>
                    {paid.length > 0 && <>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sudah Bayar</p>
                        {paid.map((b, i) => <Row key={i} label={b.title} value={fmt(b.amount)} />)}
                    </>}
                    {unpaid.length > 0 && <>
                        <p className="text-[10px] font-bold text-red-400 uppercase mt-2 mb-1">Belum Bayar</p>
                        {unpaid.map((b, i) => <Row key={i} label={b.title} value={fmt(b.amount)} red />)}
                    </>}
                    <div className="border-t mt-2 pt-2 space-y-1">
                        <Row label="Sudah Bayar" value={fmt(summary.paid_bills)} />
                        <Row label="Belum Bayar" value={fmt(summary.unpaid_bills)} red />
                        <Row label="Jumlah Komitmen" value={fmt(summary.total_bills)} bold />
                    </div>
                </Section>

                {/* Expenses */}
                {expenses.length > 0 && (
                    <Section title={`Perbelanjaan Lain (${expenses.length} item)`}>
                        {expenses.map((e, i) => <Row key={i} label={`${e.title}${e.note ? ` — ${e.note}` : ''}`} value={fmt(e.amount)} sub={e.by} />)}
                        <div className="border-t mt-2 pt-2">
                            <Row label="Jumlah Perbelanjaan" value={fmt(total_expenses)} bold />
                        </div>
                    </Section>
                )}

                {/* Savings */}
                {savings.length > 0 && (
                    <Section title="Simpanan">
                        {savings.map((g, i) => (
                            <div key={i} className="flex justify-between items-center text-sm py-1">
                                <span>{g.emoji} {g.title}</span>
                                <span className="font-bold text-emerald-600">{g.pct}% ({fmt(g.saved)} / {fmt(g.target)})</span>
                            </div>
                        ))}
                    </Section>
                )}

                {/* Debts */}
                {debts.length > 0 && (
                    <Section title="Hutang Aktif">
                        {debts.map((d, i) => <Row key={i} label={d.title} value={`Baki: ${fmt(d.remaining)}`} sub={`${d.pct}% selesai`} />)}
                    </Section>
                )}

                {/* Footer */}
                <p className="text-center text-[10px] text-slate-400 pt-4 border-t print:pt-2">
                    SwiftMoney — Dijana {new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                }
            `}</style>
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
