import { TrendingUp, AlertTriangle, ShieldCheck, CalendarClock } from 'lucide-react';

function fmt(v) {
    return `RM ${Number(v || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const THEME = {
    safe:  { bar: 'bg-emerald-500', text: 'text-emerald-600', soft: 'bg-emerald-50', border: 'border-emerald-100', icon: ShieldCheck,    label: 'Selamat sampai hujung bulan' },
    tight: { bar: 'bg-amber-500',   text: 'text-amber-600',   soft: 'bg-amber-50',   border: 'border-amber-100',   icon: CalendarClock,  label: 'Ketat — jaga perbelanjaan' },
    risk:  { bar: 'bg-red-500',     text: 'text-red-500',     soft: 'bg-red-50',     border: 'border-red-100',     icon: AlertTriangle,  label: 'Risiko kurang sebelum gaji' },
};

export default function ForecastCard({ forecast }) {
    if (!forecast || !forecast.applicable) return null;

    const t = THEME[forecast.status] || THEME.safe;
    const Icon = t.icon;

    return (
        <section>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <TrendingUp size={14} /> Unjuran Tunai
            </h3>

            <div className={`rounded-3xl border ${t.border} ${t.soft} p-5`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Anggaran baki 30 hb</p>
                        <p className={`text-3xl font-black ${t.text}`}>{fmt(forecast.projected_end)}</p>
                    </div>
                    <div className={`flex flex-col items-center gap-1 ${t.text}`}>
                        <Icon size={26} />
                    </div>
                </div>

                <p className={`text-xs font-bold ${t.text} mb-4`}>{t.label}</p>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <Mini label="Dalam tangan" value={fmt(forecast.current_balance)} />
                    <Mini label="Bil blm bayar" value={fmt(forecast.unpaid_bills)} />
                    <Mini label={`Belanja ~${forecast.days_remaining} hr`} value={fmt(forecast.projected_spend)} />
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-3">
                    Berdasarkan purata belanja RM{Number(forecast.daily_avg).toFixed(0)}/hari bulan ini · anggaran sahaja
                </p>
            </div>
        </section>
    );
}

function Mini({ label, value }) {
    return (
        <div className="bg-white/70 rounded-2xl py-2 px-1">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-sm font-black text-slate-700">{value}</p>
        </div>
    );
}
