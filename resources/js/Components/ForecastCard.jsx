import { TrendingUp, AlertTriangle, ShieldCheck, CalendarClock } from 'lucide-react';

function fmt(v) {
    return `RM ${Number(v || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const THEME = {
    safe:  { ring: 'ring-emerald-500/20', text: 'text-emerald-400', icon: ShieldCheck,   label: 'Selamat sampai hujung bulan' },
    tight: { ring: 'ring-gold/25',        text: 'text-gold',        icon: CalendarClock, label: 'Ketat — jaga perbelanjaan' },
    risk:  { ring: 'ring-red-500/25',     text: 'text-red-400',     icon: AlertTriangle, label: 'Risiko kurang sebelum gaji' },
};

export default function ForecastCard({ forecast }) {
    if (!forecast || !forecast.applicable) return null;

    const t = THEME[forecast.status] || THEME.safe;
    const Icon = t.icon;

    return (
        <section>
            <h3 className="luxe-heading mb-4"><TrendingUp size={14} className="text-gold" /> Unjuran Tunai</h3>

            <div className={`luxe-card ring-1 ${t.ring} p-5`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="luxe-label">Anggaran baki 30 hb</p>
                        <p className={`text-3xl luxe-figure ${t.text}`}>{fmt(forecast.projected_end)}</p>
                    </div>
                    <Icon size={26} className={t.text} />
                </div>

                <p className={`text-xs font-bold ${t.text} mb-4`}>{t.label}</p>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <Mini label="Dalam tangan" value={fmt(forecast.current_balance)} />
                    <Mini label="Bil blm bayar" value={fmt(forecast.unpaid_bills)} />
                    <Mini label={`Belanja ~${forecast.days_remaining} hr`} value={fmt(forecast.projected_spend)} />
                </div>

                <p className="text-[10px] text-slate-500 text-center mt-3">
                    Berdasarkan purata belanja RM{Number(forecast.daily_avg).toFixed(0)}/hari bulan ini · anggaran sahaja
                </p>
            </div>
        </section>
    );
}

function Mini({ label, value }) {
    return (
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl py-2 px-1">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-sm font-bold text-slate-100">{value}</p>
        </div>
    );
}
