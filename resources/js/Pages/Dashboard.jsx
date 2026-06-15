import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useLang } from '@/hooks/useLang';
import { useState, useEffect } from 'react';
import BrowserGate from '@/Components/BrowserGate';
import IOSInstallGuide from '@/Components/IOSInstallGuide';
import BudgetSection from '@/Components/BudgetSection';
import ForecastCard from '@/Components/ForecastCard';
import PushToggle from '@/Components/PushToggle';
import {
    CheckCircle, Circle, Home, CreditCard, GraduationCap,
    Zap, Heart, User, Plus, ChevronRight,
    TrendingDown, TrendingUp, Eye, EyeOff, Wallet, ArrowUpRight, X, ChevronLeft,
    LogOut, Users, FileText, Bell, ShieldCheck,
    Clock, DollarSign, Link2, Camera, Image, Trash2, Pencil, Ban, RotateCcw,
    MessageCircle, AlertCircle, Receipt,
    Car, Smartphone, Wifi, ShoppingCart, Activity, Tv, Droplets, Fuel,
    PiggyBank, Target, BarChart2, RefreshCw, CheckCheck, Calendar,
    KeyRound, UserCog, Award, Trophy, AlertTriangle, Flame, Landmark, HandCoins, Scale
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const categoryIcons = {
    Sekolah:    <GraduationCap size={16} className="text-blue-500" />,
    Rumah:      <Home size={16} className="text-indigo-500" />,
    Insurance:  <Heart size={16} className="text-red-500" />,
    Coway:      <Zap size={16} className="text-orange-500" />,
    Kereta:     <Car size={16} className="text-sky-500" />,
    Utiliti:    <Droplets size={16} className="text-cyan-500" />,
    Telefon:    <Smartphone size={16} className="text-violet-500" />,
    Internet:   <Wifi size={16} className="text-teal-500" />,
    Makanan:    <ShoppingCart size={16} className="text-lime-500" />,
    Kesihatan:  <Activity size={16} className="text-pink-500" />,
    Pelaburan:  <TrendingUp size={16} className="text-emerald-500" />,
    Hiburan:    <Tv size={16} className="text-purple-500" />,
    Minyak:     <Fuel size={16} className="text-amber-500" />,
    Lain2:      <CreditCard size={16} className="text-slate-500" />,
};

const CATEGORIES = [
    'Rumah', 'Kereta', 'Sekolah', 'Insurance',
    'Utiliti', 'Telefon', 'Internet', 'Minyak',
    'Makanan', 'Kesihatan', 'Pelaburan', 'Hiburan',
    'Coway', 'Lain2',
];

function formatMoney(amount, isHidden = false, isPrivate = false) {
    if (isHidden && isPrivate) return 'RM •••••';
    return `RM ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Modal Wrapper ───
function Modal({ show, onClose, title, children }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-ink-soft border border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20}/></button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── Income Modal (Add / Edit) ───
function IncomeModal({ show, onClose, monthYear, editIncome }) {
    const isEdit = !!editIncome;
    const { data, setData, post, put, processing, reset, delete: destroy } = useForm({
        source: editIncome?.source || '',
        amount: editIncome?.amount || '',
        month_year: monthYear,
        is_recurring: false,
    });

    useEffect(() => {
        if (editIncome) {
            setData({ source: editIncome.source, amount: editIncome.amount, month_year: monthYear, is_recurring: false });
        } else {
            reset();
        }
    }, [editIncome, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('incomes.update', editIncome.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('incomes.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };
    const handleDelete = () => {
        if (!isEdit) return;
        destroy(route('incomes.destroy', editIncome.id), { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Modal show={show} onClose={onClose} title={isEdit ? 'Edit Pendapatan' : 'Tambah Pendapatan'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sumber</label>
                    <input type="text" placeholder="e.g. Bonus, Felda" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.source} onChange={(e) => setData('source', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                </div>
                <button
                    type="button"
                    onClick={() => setData('is_recurring', !data.is_recurring)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${data.is_recurring ? 'bg-indigo-500/15 border-indigo-200 text-indigo-700' : 'bg-white/5 border-transparent text-slate-500'}`}
                >
                    <span className="flex items-center gap-2 text-sm font-bold"><RefreshCw size={14}/> Berulang setiap bulan</span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.is_recurring ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                        {data.is_recurring && <CheckCheck size={11} className="text-white" />}
                    </span>
                </button>
                <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 mt-2 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Saving...' : isEdit ? 'Kemaskini' : 'Simpan Pendapatan'}
                </button>
                {isEdit && (
                    <button type="button" onClick={handleDelete} disabled={processing} className="w-full text-red-500 font-bold text-sm p-3 rounded-2xl bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                        Padam Pendapatan
                    </button>
                )}
            </form>
        </Modal>
    );
}

// ─── Bill Template Modal (Add / Edit) ───
function BillModal({ show, onClose, allDebts, editTemplate, familyMembers }) {
    const isEdit = !!editTemplate;
    const { data, setData, post, put, processing, reset } = useForm({
        title: '', default_amount: '', category: 'Rumah', assigned_to: '', debt_id: '', due_day: '',
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (editTemplate) {
            setData({
                title: editTemplate.title,
                default_amount: editTemplate.default_amount,
                category: editTemplate.category,
                assigned_to: editTemplate.assigned_to,
                debt_id: editTemplate.debt_id || '',
                due_day: editTemplate.due_day || '',
            });
        } else {
            reset();
            setData('assigned_to', familyMembers?.[0]?.name || '');
        }
    }, [editTemplate, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('bills.templates.update', editTemplate.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('bills.templates.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };
    return (
        <Modal show={show} onClose={onClose} title={isEdit ? 'Edit Komitmen' : 'Tambah Komitmen'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tajuk</label>
                    <input type="text" placeholder="e.g. Astro, Bil Air" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah</label>
                        <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.default_amount} onChange={(e) => setData('default_amount', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kategori</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            {CATEGORIES.map(c => <option className="bg-ink-soft text-slate-100" key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">PIC</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.assigned_to} onChange={(e) => setData('assigned_to', e.target.value)}>
                            {(familyMembers || []).map(m => (
                                <option className="bg-ink-soft text-slate-100" key={m.id} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Due Hari Ke-</label>
                        <input type="number" min="1" max="31" placeholder="cth: 15" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.due_day} onChange={(e) => setData('due_day', e.target.value)} />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Link Hutang</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.debt_id} onChange={(e) => setData('debt_id', e.target.value)}>
                        <option className="bg-ink-soft text-slate-100" value="">Tiada</option>
                        {(allDebts || []).map(d => <option className="bg-ink-soft text-slate-100" key={d.id} value={d.id}>{d.title}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 mt-2 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Saving...' : isEdit ? 'Kemaskini Komitmen' : 'Tambah Komitmen'}
                </button>
                {isEdit && (
                    <button type="button" disabled={processing || deleting} onClick={() => {
                        setDeleting(true);
                        router.delete(route('bills.templates.destroy', editTemplate.id), {
                            onSuccess: () => { reset(); onClose(); },
                            onFinish: () => setDeleting(false),
                        });
                    }} className="w-full text-red-500 font-bold text-sm p-3 rounded-2xl bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                        {deleting ? 'Memadamkan...' : 'Padam Komitmen'}
                    </button>
                )}
            </form>
        </Modal>
    );
}

// ─── One-Time Expense Modal ───
function ExpenseModal({ show, onClose, monthYear, editExpense }) {
    const isEdit = !!editExpense;
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        title: '', amount: '', category: 'Lain2', note: '', month_year: monthYear,
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (editExpense) {
            setData({ title: editExpense.title, amount: editExpense.amount, category: editExpense.category, note: editExpense.note || '', month_year: monthYear });
        } else {
            reset();
            setData('month_year', monthYear);
        }
    }, [editExpense, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('expenses.update', editExpense.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('expenses.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={isEdit ? 'Edit Perbelanjaan' : 'Tambah Perbelanjaan'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Perkara</label>
                    <input type="text" placeholder="e.g. Beli TV, Duit raya" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah (RM)</label>
                        <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kategori</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            {CATEGORIES.map(c => <option className="bg-ink-soft text-slate-100" key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nota (optional)</label>
                    <input type="text" placeholder="Kenapa beli, untuk siapa..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                </div>
                <button type="submit" disabled={processing} className="w-full bg-violet-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-violet-200 mt-2 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Saving...' : isEdit ? 'Kemaskini' : 'Tambah Perbelanjaan'}
                </button>
                {isEdit && (
                    <button type="button" disabled={deleting} onClick={() => {
                        setDeleting(true);
                        destroy(route('expenses.destroy', editExpense.id), { onSuccess: () => { reset(); onClose(); }, onFinish: () => setDeleting(false) });
                    }} className="w-full text-red-500 font-bold text-sm p-3 rounded-2xl bg-red-50 active:scale-95 transition-all">
                        {deleting ? 'Memadamkan...' : 'Padam'}
                    </button>
                )}
            </form>
        </Modal>
    );
}

// ─── Add / Edit Debt Modal ───
function DebtModal({ show, onClose, editDebt }) {
    const isEdit = !!editDebt;
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        title: '', total_amount: '', type: 'fixed',
    });

    useEffect(() => {
        if (editDebt) {
            setData({ title: editDebt.title, total_amount: editDebt.total, type: editDebt.type });
        } else {
            reset();
        }
    }, [editDebt, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('debts.update', editDebt.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('debts.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };
    return (
        <Modal show={show} onClose={onClose} title={isEdit ? 'Edit Hutang' : 'Tambah Hutang'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Hutang</label>
                    <input type="text" placeholder="e.g. Hutang Kereta, CC Bank" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah Asal (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.total_amount} onChange={(e) => setData('total_amount', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jenis Bayaran</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.type} onChange={(e) => setData('type', e.target.value)}>
                        <option className="bg-ink-soft text-slate-100" value="fixed">Tetap (Fixed)</option>
                        <option className="bg-ink-soft text-slate-100" value="flexible">Fleksibel</option>
                    </select>
                </div>
                <button type="submit" disabled={processing} className="w-full bg-orange-500 text-white font-bold p-4 rounded-2xl shadow-lg shadow-orange-200 mt-2 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Saving...' : isEdit ? 'Kemaskini Hutang' : 'Simpan Hutang'}
                </button>
                {isEdit && (
                    <button type="button" disabled={processing} onClick={() => destroy(route('debts.destroy', editDebt.id), { onSuccess: () => { reset(); onClose(); } })} className="w-full text-red-500 font-bold text-sm p-3 rounded-2xl bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                        Padam Hutang
                    </button>
                )}
            </form>
        </Modal>
    );
}

// ─── Manual Payment Modal ───
function PaymentModal({ show, onClose, debt }) {
    const { data, setData, post, processing, reset } = useForm({ amount: '' });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!debt) return;
        post(route('debts.pay', debt.id), { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Modal show={show} onClose={onClose} title={`Bayar: ${debt?.title || ''}`}>
            <div className="mb-4 p-4 bg-orange-500/15 rounded-2xl">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Baki semasa</span>
                    <span className="font-black text-orange-600">{formatMoney(debt?.remaining || 0)}</span>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah Bayaran (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                </div>
                <button type="submit" disabled={processing} className="w-full bg-orange-500 text-white font-bold p-4 rounded-2xl shadow-lg shadow-orange-200 mt-2 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Processing...' : 'Rekod Bayaran'}
                </button>
            </form>
        </Modal>
    );
}

// ─── Payment History Modal ───
function HistoryModal({ show, onClose, debt }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && debt) {
            setLoading(true);
            setError(null);
            fetch(route('debts.history', debt.id))
                .then(res => {
                    if (!res.ok) throw new Error('Gagal memuatkan sejarah');
                    return res.json();
                })
                .then(data => { setHistory(data); setLoading(false); })
                .catch((err) => { setError(err.message); setLoading(false); });
        }
    }, [show, debt]);

    return (
        <Modal show={show} onClose={onClose} title={`Sejarah: ${debt?.title || ''}`}>
            <div className="mb-4 p-4 bg-white/5 rounded-2xl">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Jumlah</p>
                        <p className="text-sm font-black text-slate-100">{formatMoney(debt?.total || 0)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Dah Bayar</p>
                        <p className="text-sm font-black text-emerald-400">{formatMoney(debt?.paid || 0)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Baki</p>
                        <p className="text-sm font-black text-orange-600">{formatMoney(debt?.remaining || 0)}</p>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${debt?.pct || 0}%` }}></div>
                    </div>
                    <p className="text-center text-[9px] font-bold text-slate-400 mt-1">{debt?.pct || 0}% selesai</p>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-slate-400 text-sm py-8">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-500 text-sm py-8">{error}</p>
            ) : history.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Tiada rekod bayaran</p>
            ) : (
                <div className="space-y-3">
                    {history.map((p, i) => (
                        <div key={p.id || i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl">
                            <div className="bg-green-100 p-2 rounded-xl">
                                <DollarSign size={16} className="text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-100">{formatMoney(p.amount_paid)}</p>
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <Clock size={10} /> {formatDate(p.payment_date)}
                                </p>
                            </div>
                            {p.bill_record_id && (
                                <span className="text-[8px] font-bold bg-indigo-500/15 text-indigo-500 px-2 py-0.5 rounded-md uppercase">
                                    Auto
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}

// ─── Receipt Modal ───
function ReceiptModal({ show, onClose, bill }) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('receipt', file);
        router.post(route('bills.receipt.upload', bill.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { setUploading(false); onClose(); },
        });
    };

    const handleDelete = () => {
        router.delete(route('bills.receipt.delete', bill.id), {
            preserveScroll: true,
            onFinish: () => onClose(),
        });
    };

    return (
        <Modal show={show} onClose={onClose} title={`Resit: ${bill?.title || ''}`}>
            {bill?.receipt_path ? (
                <div className="space-y-4">
                    <img src={route('bills.receipt.view', bill.id)} alt="Resit" className="w-full rounded-2xl shadow-sm border border-slate-100" />
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-300 bg-indigo-500/15 py-3 rounded-xl cursor-pointer active:scale-95 transition-all">
                            <Camera size={14}/> Tukar Resit
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
                        </label>
                        <button onClick={handleDelete} className="flex items-center justify-center gap-2 text-[10px] font-bold text-red-500 bg-red-50 py-3 rounded-xl active:scale-95 transition-all">
                            <Trash2 size={14}/> Padam
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 space-y-4">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Camera size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm">Tiada resit untuk bil ini</p>
                    <label className={`block w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 cursor-pointer active:scale-95 transition-all ${uploading ? 'opacity-50' : ''}`}>
                        {uploading ? 'Uploading...' : 'Ambil / Pilih Gambar'}
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>
            )}
        </Modal>
    );
}

// ─── Savings Goal Modal (Add / Edit) ───
function SavingsModal({ show, onClose, editGoal }) {
    const isEdit = !!editGoal;
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        title: '', target_amount: '', deadline: '', emoji: '💰',
    });

    useEffect(() => {
        if (editGoal) {
            setData({ title: editGoal.title, target_amount: editGoal.target, deadline: editGoal.deadline || '', emoji: editGoal.emoji });
        } else {
            reset();
        }
    }, [editGoal, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('savings.update', editGoal.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('savings.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    };

    const EMOJIS = ['💰', '🏠', '🚗', '✈️', '📱', '🎓', '💍', '🏖️', '💊', '🛒'];

    return (
        <Modal show={show} onClose={onClose} title={isEdit ? 'Edit Simpanan' : 'Tambah Simpanan'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Emoji</label>
                    <div className="flex gap-2 flex-wrap mt-2">
                        {EMOJIS.map(e => (
                            <button key={e} type="button" onClick={() => setData('emoji', e)}
                                className={`text-xl p-2 rounded-2xl transition-all ${data.emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-50'}`}>
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Simpanan</label>
                    <input type="text" placeholder="e.g. Dana Kecemasan, DP Rumah" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Target (RM)</label>
                        <input type="number" step="1" placeholder="10000" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.target_amount} onChange={(e) => setData('target_amount', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tarikh Target</label>
                        <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.deadline} onChange={(e) => setData('deadline', e.target.value)} />
                    </div>
                </div>
                <button type="submit" disabled={processing} className="w-full bg-emerald-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-emerald-200 mt-2 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Saving...' : isEdit ? 'Kemaskini Simpanan' : 'Tambah Simpanan'}
                </button>
                {isEdit && (
                    <button type="button" disabled={processing} onClick={() => destroy(route('savings.destroy', editGoal.id), { onSuccess: () => { reset(); onClose(); } })} className="w-full text-red-500 font-bold text-sm p-3 rounded-2xl bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                        Padam Simpanan
                    </button>
                )}
            </form>
        </Modal>
    );
}

// ─── Savings Contribute Modal ───
function SavingsContributeModal({ show, onClose, goal }) {
    const { data, setData, post, processing, reset } = useForm({ amount: '', note: '' });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('savings.contribute', goal.id), { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Modal show={show} onClose={onClose} title={`Tambah: ${goal?.title || ''}`}>
            <div className="mb-4 p-4 bg-emerald-500/15 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Terkumpul</p>
                    <p className="text-sm font-black text-emerald-400">{formatMoney(goal?.saved || 0)} / {formatMoney(goal?.target || 0)}</p>
                </div>
                <span className="text-3xl">{goal?.emoji}</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-300 outline-none" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nota (optional)</label>
                    <input type="text" placeholder="e.g. Lebihan gaji" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-300 outline-none" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                </div>
                <button type="submit" disabled={processing} className="w-full bg-emerald-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Saving...' : 'Tambah Simpanan'}
                </button>
            </form>
        </Modal>
    );
}

// ─── Analytics View ───
function AnalyticsView({ familyId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!familyId) return;
        setLoading(true);
        fetch(route('analytics'))
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [familyId]);

    const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-sm">Memuatkan data...</p></div>;
    if (!data) return null;

    const maxVal = Math.max(...(data.trend || []).map(d => Math.max(d.income, d.bills)));

    return (
        <div className="p-6 pt-16 space-y-8">
            <div>
                <h2 className="font-display text-xl font-semibold text-white tracking-tight">Analitik</h2>
                <p className="text-slate-400 text-xs font-medium mt-1">6 bulan terakhir</p>
            </div>

            {/* Trend Chart */}
            <div className="luxe-card rounded-[28px] p-5">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Pendapatan vs Komitmen</h3>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={data.trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(v, n) => [`RM ${Number(v).toLocaleString()}`, n === 'income' ? 'Pendapatan' : n === 'bills' ? 'Komitmen' : 'Simpan']}
                            contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 11 }} />
                        <Line type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} name="income" />
                        <Line type="monotone" dataKey="bills" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} name="bills" />
                        <Line type="monotone" dataKey="saved" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} name="saved" />
                    </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-3 justify-center">
                    {[['#6366f1','Pendapatan'],['#f97316','Komitmen'],['#10b981','Simpan']].map(([c,l]) => (
                        <div key={l} className="flex items-center gap-1.5">
                            <div className="w-3 h-1.5 rounded-full" style={{ background: c }}></div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{l}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly savings bars */}
            <div className="luxe-card rounded-[28px] p-5">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Lebihan Bulanan</h3>
                <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={data.trend} margin={{ top: 0, right: 5, left: -20, bottom: 0 }} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(v) => [`RM ${Number(v).toLocaleString()}`, 'Lebihan']}
                            contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 11 }} />
                        <Bar dataKey="saved" radius={[8, 8, 0, 0]}>
                            {data.trend.map((_, i) => <Cell key={i} fill={i === data.trend.length - 1 ? '#6366f1' : '#e0e7ff'} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            {data.breakdown?.length > 0 && (
                <div className="luxe-card rounded-[28px] p-5">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Breakdown Kategori (Bulan Ini)</h3>
                    <div className="space-y-3">
                        {data.breakdown.map((item, i) => {
                            const max = data.breakdown[0]?.amount || 1;
                            return (
                                <div key={item.category}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-300">{item.category}</span>
                                        <span className="text-xs font-black text-slate-100">RM {Number(item.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${(item.amount / max) * 100}%`, background: COLORS[i % COLORS.length] }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Edit Profile Modal ───
function EditProfileModal({ show, onClose, user }) {
    const [tab, setTab] = useState('profil');
    const profileForm = useForm({ name: user?.name || '', email: user?.email || '' });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    useEffect(() => {
        if (show) {
            profileForm.setData({ name: user?.name || '', email: user?.email || '' });
            passwordForm.reset();
        }
    }, [show]);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), { onSuccess: () => onClose() });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), { onSuccess: () => { passwordForm.reset(); onClose(); } });
    };

    return (
        <Modal show={show} onClose={onClose} title="Edit Profil">
            {/* Tab toggle */}
            <div className="flex bg-white/10 rounded-2xl p-1 mb-5">
                <button onClick={() => setTab('profil')} className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${tab === 'profil' ? 'bg-gold text-ink shadow-sm' : 'text-slate-400'}`}>
                    Maklumat
                </button>
                <button onClick={() => setTab('password')} className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${tab === 'password' ? 'bg-gold text-ink shadow-sm' : 'text-slate-400'}`}>
                    Password
                </button>
            </div>

            {tab === 'profil' ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Paparan</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} />
                        <p className="text-[9px] text-amber-500 font-bold ml-1 mt-1">⚠️ Nama ini digunakan untuk assignment bil. Tukar nama akan ubah PIC pada semua komitmen.</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} />
                    </div>
                    {profileForm.errors.name && <p className="text-xs text-red-500 ml-1">{profileForm.errors.name}</p>}
                    {profileForm.errors.email && <p className="text-xs text-red-500 ml-1">{profileForm.errors.email}</p>}
                    <button type="submit" disabled={profileForm.processing} className="w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50">
                        {profileForm.processing ? 'Saving...' : 'Kemaskini Profil'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Semasa</label>
                        <input type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} />
                        {passwordForm.errors.current_password && <p className="text-xs text-red-500 ml-1 mt-1">{passwordForm.errors.current_password}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Baru</label>
                        <input type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} />
                        {passwordForm.errors.password && <p className="text-xs text-red-500 ml-1 mt-1">{passwordForm.errors.password}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sahkan Password Baru</label>
                        <input type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-1 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 outline-none" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} />
                    </div>
                    <button type="submit" disabled={passwordForm.processing} className="w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50">
                        {passwordForm.processing ? 'Saving...' : 'Tukar Password'}
                    </button>
                </form>
            )}
        </Modal>
    );
}

// ─── Profile View ───
// ─── Upgrade Modal ───
function UpgradeModal({ show, onClose }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-ink-soft border border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center space-y-4">
                <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🔒</span>
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">Ciri Berbayar</h3>
                    <p className="text-slate-500 text-sm mt-2">
                        Ciri ini hanya untuk akaun <span className="font-bold text-indigo-300">SwiftMoney Pro</span>.
                    </p>
                </div>
                <div className="bg-indigo-500/15 rounded-2xl p-4 text-left space-y-2">
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-wide">Pro — RM 5/bulan</p>
                    {['Hutang tracker', 'Simpanan goals', 'Analitik 6 bulan', 'Upload resit', 'Navigasi bulan lepas', 'Bil tanpa had'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle size={13} className="text-emerald-500 flex-shrink-0"/>
                            {f}
                        </div>
                    ))}
                </div>
                <a
                    href="https://wa.me/60132094577?text=Hi+Adam%2C+saya+nak+upgrade+SwiftMoney+ke+Pro+plan.+Boleh+bantu%3F"
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-all"
                >
                    Upgrade Sekarang — RM 5/bln
                </a>
                <button onClick={onClose} className="text-slate-400 text-xs font-medium">Buat masa ni tak</button>
            </div>
        </div>
    );
}

function FamilySection({ user, familyMembers, inviteLink }) {
    const { post, processing } = useForm();
    const [copied, setCopied] = useState(false);
    const { t } = useLang();
    const isAdmin = user?.role === 'admin';

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateLink = () => {
        post(route('invite.generate'));
    };

    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('family.title')}</h3>
            <div className="luxe-card rounded-[32px] p-5 space-y-3">
                {(familyMembers || []).map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                        {m.avatar
                            ? <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            : <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black uppercase flex-shrink-0">{m.name?.substring(0, 2)}</div>
                        }
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-100 truncate">{m.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase">{m.role}</p>
                        </div>
                        {m.id === user?.id && (
                            <span className="text-[9px] font-black bg-indigo-500/15 text-indigo-300 px-2 py-1 rounded-full">{t('dash.my_view')}</span>
                        )}
                    </div>
                ))}

                {isAdmin && (
                    <div className="border-t border-white/10 pt-3 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('family.invite')}</p>
                        {(familyMembers || []).length >= 2 ? (
                            <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-3 py-2.5">
                                <Users size={12} className="text-slate-400 shrink-0"/>
                                <p className="text-[10px] text-slate-400 font-medium">{t('family.full')}</p>
                            </div>
                        ) : inviteLink ? (
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white/5 rounded-2xl px-3 py-2 text-[10px] text-slate-500 truncate font-mono">
                                    {inviteLink}
                                </div>
                                <button
                                    onClick={copyLink}
                                    className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all ${copied ? 'bg-green-100 text-emerald-400' : 'bg-indigo-500/15 text-indigo-300 active:scale-95'}`}
                                >
                                    {copied ? t('family.copied') : t('family.copy')}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={generateLink}
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-xs font-bold py-3 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Link2 size={14}/> {t('family.generate_link')}
                            </button>
                        )}
                        {(familyMembers || []).length < 2 && (
                            <p className="text-[9px] text-slate-300 font-medium">{t('family.link_valid')}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ProfileView({ user, summary, savingsGoals, activeDebts, isHidden, onEditProfile, familyMembers, inviteLink }) {
    const { plan } = usePage().props;
    const { t, lang, setLanguage } = useLang();
    const isPaid = plan?.is_paid ?? false;
    const totalIncome = summary?.total_income || 0;
    const totalBills = summary?.total_bills || 0;
    const totalUnpaid = summary?.total_unpaid || 0;
    const burnRate = totalIncome > 0 ? Math.round((totalBills / totalIncome) * 100) : 0;

    // Financial Health Score
    const billsScore = totalBills > 0 ? ((totalBills - totalUnpaid) / totalBills) * 100 : 100;
    const savingsScore = (savingsGoals || []).length > 0
        ? (savingsGoals.reduce((a, g) => a + g.pct, 0) / savingsGoals.length)
        : 50;
    const debtScore = (activeDebts || []).length > 0
        ? (activeDebts.reduce((a, d) => a + d.pct, 0) / activeDebts.length)
        : 100;
    const healthScore = Math.round(billsScore * 0.5 + savingsScore * 0.25 + debtScore * 0.25);

    const scoreConfig = healthScore >= 90 ? { label: 'Cemerlang', color: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-200', icon: <Trophy size={20} className="text-emerald-400"/> } :
                        healthScore >= 75 ? { label: 'Bagus', color: 'text-indigo-300', bg: 'bg-indigo-500', ring: 'ring-indigo-200', icon: <Award size={20} className="text-indigo-300"/> } :
                        healthScore >= 60 ? { label: 'OK', color: 'text-sky-600', bg: 'bg-sky-400', ring: 'ring-sky-200', icon: <ShieldCheck size={20} className="text-sky-600"/> } :
                        healthScore >= 40 ? { label: 'Perlu Perhatian', color: 'text-amber-600', bg: 'bg-amber-400', ring: 'ring-amber-200', icon: <AlertTriangle size={20} className="text-amber-600"/> } :
                                           { label: 'Kritikal', color: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-200', icon: <Flame size={20} className="text-red-600"/> };

    return (
        <div className="p-6 pt-16 space-y-6">
            {/* Avatar + Edit */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {user?.avatar
                            ? <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover shadow-xl border-4 border-white" />
                            : <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-black shadow-xl border-4 border-white uppercase">{user?.name?.substring(0, 3) || 'USR'}</div>
                        }
                        <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-semibold text-white tracking-tight">{user?.name}</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{user?.role === 'admin' ? 'Admin' : 'Member'}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                            <span className="bg-indigo-500/15 text-indigo-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldCheck size={9}/> Verified
                            </span>
                            <span className="bg-green-500/15 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Users size={9}/> Family
                            </span>
                            {isPaid && (
                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                    👑 Pro
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={onEditProfile} className="flex items-center gap-1.5 bg-white/10 text-slate-300 text-xs font-bold px-3 py-2 rounded-2xl active:scale-95 transition-all">
                    <UserCog size={14}/> Edit
                </button>
            </div>

            {/* Financial Health Score */}
            <div className={`luxe-card rounded-[28px] p-5 ring-2 ${scoreConfig.ring}`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kesihatan Kewangan</p>
                        <div className="flex items-center gap-2 mt-1">
                            {scoreConfig.icon}
                            <span className={`text-lg font-black ${scoreConfig.color}`}>{scoreConfig.label}</span>
                        </div>
                    </div>
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                            <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                                strokeDasharray={`${healthScore} ${100 - healthScore}`}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ${scoreConfig.bg.replace('bg-','stroke-')}`}
                            />
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${scoreConfig.color}`}>{healthScore}</span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                        { label: 'Bil Bayar', value: Math.round(billsScore), color: 'text-indigo-300' },
                        { label: 'Simpanan', value: Math.round(savingsScore), color: 'text-emerald-400' },
                        { label: 'Hutang', value: Math.round(debtScore), color: 'text-orange-500' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white/5 rounded-2xl p-2">
                            <p className={`text-sm font-black ${color}`}>{value}%</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="luxe-card p-4 rounded-3xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Tahunan</p>
                    <p className="text-sm font-black text-white">{formatMoney(totalIncome * 12, isHidden, true)}</p>
                    <p className="text-[8px] text-slate-300 font-bold mt-1 tracking-tighter">ANGGARAN ANNUAL</p>
                </div>
                <div className="luxe-card p-4 rounded-3xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Burn Rate</p>
                    <p className={`text-sm font-black ${burnRate > 80 ? 'text-red-500' : burnRate > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{burnRate}%</p>
                    <p className="text-[8px] text-slate-300 font-bold mt-1 tracking-tighter">{t('profile.income_used').toUpperCase()}</p>
                </div>
            </div>

            {/* Family Members */}
            <FamilySection user={user} familyMembers={familyMembers} inviteLink={inviteLink} />

            {/* Settings */}
            <div className="space-y-3">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('profile.settings')}</h3>
                <div className="luxe-card rounded-[32px] overflow-hidden">
                    <button onClick={onEditProfile} className="w-full p-4 flex items-center justify-between border-b border-white/10 active:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-500/15 text-indigo-300 p-2.5 rounded-2xl"><UserCog size={20}/></div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-100">{t('profile.edit')}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{t('profile.name')}, {t('profile.email')}, password</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                    </button>

                    {/* Language Toggle */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500/15 text-emerald-400 p-2.5 rounded-2xl">
                                <span className="text-sm font-black">{lang === 'ms' ? 'BM' : 'EN'}</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-100">{t('lang.label')}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{t('lang.ms')} / {t('lang.en')}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 bg-white/10 rounded-2xl p-1">
                            <button
                                onClick={() => setLanguage('ms')}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${lang === 'ms' ? 'bg-gold text-ink shadow-sm' : 'text-slate-400'}`}
                            >BM</button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${lang === 'en' ? 'bg-gold text-ink shadow-sm' : 'text-slate-400'}`}
                            >EN</button>
                        </div>
                    </div>

                    <PushToggle />
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/5 text-slate-300 p-2.5 rounded-2xl"><FileText size={20}/></div>
                            <div>
                                <p className="text-sm font-bold text-slate-100">Laporan Kewangan</p>
                                <p className="text-[10px] text-slate-400 font-medium">Export PDF bulanan</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                    </div>
                </div>

                <div className="luxe-card rounded-[32px] overflow-hidden">
                    <button onClick={() => router.post(route('logout'))} className="w-full p-4 flex items-center gap-4 text-red-500 active:bg-red-50 transition-colors">
                        <div className="bg-red-50 p-2.5 rounded-2xl"><LogOut size={20}/></div>
                        <p className="text-sm font-bold">{t('profile.logout')}</p>
                    </button>
                </div>

                <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest py-4">
                    SwiftMoney PWA v1.1.0
                </p>
            </div>
        </div>
    );
}

// ─── Onboarding Screen (user registered but has no family yet) ───
function OnboardingScreen() {
    const { data, setData, post, processing, errors } = useForm({ family_name: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('setup.family'));
    };

    return (
        <>
            <Head title="Sediakan Akaun" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <div className="bg-ink-soft border border-white/10 rounded-[32px] p-8 shadow-xl w-full max-w-sm space-y-6">
                    <div className="text-center space-y-3">
                        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Wallet size={32} className="text-indigo-300" />
                        </div>
                        <h2 className="text-xl font-black text-white">Selamat Datang!</h2>
                        <p className="text-slate-500 text-sm">Namakan rumahtangga anda untuk mula guna SwiftMoney.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-100 mb-1">
                                Nama Rumahtangga / Keluarga
                            </label>
                            <input
                                type="text"
                                value={data.family_name}
                                onChange={e => setData('family_name', e.target.value)}
                                placeholder="cth: Keluarga Ahmad, Rumahtangga Zulaikha..."
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                autoFocus
                            />
                            {errors.family_name && (
                                <p className="text-red-500 text-xs mt-1">{errors.family_name}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.family_name.trim()}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl text-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
                        >
                            {processing ? 'Menyediakan...' : 'Mula Sekarang →'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400">
                        Nama boleh ditukar kemudian dalam tetapan profil.
                    </p>

                    <div className="border-t border-slate-100 pt-4 text-center space-y-2">
                        <p className="text-xs text-slate-400">Ada masalah semasa daftar?</p>
                        <a
                            href="https://wa.me/60132094577?text=Hi%20Adam%2C%20saya%20ada%20masalah%20nak%20guna%20SwiftMoney."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl hover:bg-green-600 active:scale-95 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Hubungi Adam
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Suspended Screen ───
function SuspendedScreen() {
    return (
        <div className="min-h-screen bg-white/5 flex items-center justify-center p-6">
            <div className="bg-ink-soft border border-white/10 rounded-[32px] p-8 shadow-xl max-w-sm w-full text-center space-y-5">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-3xl">🚫</span>
                </div>
                <div>
                    <h2 className="text-xl font-black text-white">Akaun Digantung</h2>
                    <p className="text-slate-500 text-sm mt-2">Akaun anda telah digantung sementara. Sila hubungi kami untuk maklumat lanjut.</p>
                </div>
                <a
                    href="https://wa.me/60132094577?text=Hi%20Adam%2C%20akaun%20SwiftMoney%20saya%20telah%20digantung."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:bg-green-600 active:scale-95 transition w-full justify-center"
                >
                    Hubungi Admin
                </a>
            </div>
        </div>
    );
}

// Quick-access tool button (Cukai / Zakat / Nilai Bersih)
function ToolButton({ icon: Icon, label, onClick }) {
    return (
        <button onClick={onClick} className="group flex flex-col items-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-2xl py-3.5 backdrop-blur-xl active:scale-95 transition-all">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-gold/10 border border-gold/30 text-gold shadow-[0_0_18px_-6px_rgba(200,162,75,0.6)] group-active:scale-90 transition-all">
                <Icon size={17} strokeWidth={2} />
            </span>
            <span className="text-[10px] font-semibold tracking-wide text-slate-300">{label}</span>
        </button>
    );
}

// ─── Main Dashboard ───
export default function Dashboard({ user, summary, my_summary, incomes, my_incomes, categorized_bills, my_bills, active_debts, all_debts, monthYear, needsSetup, isSuspended, savings_goals, family_members, invite_link, expenses, budgets = [], forecast = null, my_forecast = null }) {
    const [isHidden, setIsHidden] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [viewMode, setViewMode] = useState('saya'); // 'saya' or 'keluarga'
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [editDebt, setEditDebt] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [editGoal, setEditGoal] = useState(null);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [editExpense, setEditExpense] = useState(null);

    const { plan } = usePage().props;
    const isPaid = plan?.is_paid ?? false;
    const isAdmin = user?.role === 'admin';

    const requirePaid = (callback) => {
        if (!isPaid) { setShowUpgradeModal(true); return; }
        callback();
    };

    // Real-time sync: reload dashboard when family member updates a bill
    useEffect(() => {
        if (!window.Echo || !user?.family_id) return;
        const channel = window.Echo.private(`family.${user.family_id}`);
        channel.listen('.bill.updated', () => {
            router.reload({ preserveScroll: true });
        });
        return () => channel.stopListening('.bill.updated');
    }, [user?.family_id]);

    if (needsSetup) return <OnboardingScreen />;
    if (isSuspended) return <SuspendedScreen />;

    const isSaya = viewMode === 'saya';
    const s = (isSaya ? my_summary : summary) || { net_balance: 0, total_income: 0, total_unpaid: 0, total_bills: 0, progress_pct: 0 };
    const incomeList = (isSaya ? my_incomes : incomes) || [];
    const bills = (isSaya ? my_bills : categorized_bills) || {};
    const debts = active_debts || [];
    const familyS = summary || { total_unpaid: 0, progress_pct: 0 };

    const monthLabel = monthYear ? (() => {
        const [m, y] = monthYear.split('-');
        const months = ['', 'JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGO', 'SEP', 'OKT', 'NOV', 'DIS'];
        return `${months[parseInt(m)]} ${y}`;
    })() : '';

    const isCurrentMonth = monthYear === new Date().toLocaleDateString('en', { month: '2-digit', year: 'numeric' }).replace('/', '-').split('/').reverse().join('-') ||
        monthYear === `${String(new Date().getMonth()+1).padStart(2,'0')}-${new Date().getFullYear()}`;

    const navigateMonth = (direction) => {
        const [m, y] = monthYear.split('-').map(Number);
        const d = new Date(y, m - 1 + direction, 1);
        const next = `${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
        router.get(route('dashboard'), { month: next }, { preserveState: false });
    };

    const handleTogglePaid = (recordId) => {
        router.post(route('bills.toggle', recordId), {}, { preserveScroll: true });
    };

    const handleToggleAssign = (e, templateId, currentAssigned) => {
        e.stopPropagation();
        const names = (family_members || []).map(m => m.name);
        if (names.length < 2) return;
        const idx = names.indexOf(currentAssigned);
        const newAssigned = names[(idx + 1) % names.length];
        router.put(route('bills.templates.assign', templateId), { assigned_to: newAssigned }, { preserveScroll: true });
    };

    const openPayment = (debt) => { setSelectedDebt(debt); setShowPaymentModal(true); };
    const openHistory = (debt) => { setSelectedDebt(debt); setShowHistoryModal(true); };

    // Real-time sync — when spouse updates a bill, refresh shared data live
    useEffect(() => {
        const familyId = user?.family_id;
        if (!familyId || !window.Echo) return;
        const channelName = `family.${familyId}`;
        window.Echo.private(channelName).listen('.bill.updated', () => {
            router.reload({ only: ['categorized_bills', 'my_bills', 'summary', 'my_summary', 'active_debts', 'forecast', 'my_forecast'] });
        });
        return () => window.Echo.leave(channelName);
    }, [user?.family_id]);

    return (
        <>
            <Head title="Dashboard" />
            <BrowserGate />
            <IOSInstallGuide />
            <div className="max-w-md mx-auto luxe-screen min-h-screen pb-28 overflow-x-hidden relative">

                <IncomeModal show={showIncomeModal} onClose={() => { setShowIncomeModal(false); setSelectedIncome(null); }} monthYear={monthYear} editIncome={selectedIncome} />
                <BillModal show={showBillModal} onClose={() => { setShowBillModal(false); setSelectedTemplate(null); }} allDebts={all_debts} editTemplate={selectedTemplate} familyMembers={family_members} />
                <DebtModal show={showDebtModal} onClose={() => { setShowDebtModal(false); setEditDebt(null); }} editDebt={editDebt} />
                <SavingsModal show={showSavingsModal} onClose={() => { setShowSavingsModal(false); setEditGoal(null); }} editGoal={editGoal} />
                <SavingsContributeModal show={showContributeModal} onClose={() => { setShowContributeModal(false); setSelectedGoal(null); }} goal={selectedGoal} />
                <PaymentModal show={showPaymentModal} onClose={() => { setShowPaymentModal(false); setSelectedDebt(null); }} debt={selectedDebt} />
                <HistoryModal show={showHistoryModal} onClose={() => { setShowHistoryModal(false); setSelectedDebt(null); }} debt={selectedDebt} />
                <ReceiptModal show={showReceiptModal} onClose={() => { setShowReceiptModal(false); setSelectedBill(null); }} bill={selectedBill} />
                <EditProfileModal show={showEditProfile} onClose={() => setShowEditProfile(false)} user={user} />
                <UpgradeModal show={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
                <ExpenseModal show={showExpenseModal} onClose={() => { setShowExpenseModal(false); setEditExpense(null); }} monthYear={monthYear} editExpense={editExpense} />

                {activeTab === 'home' ? (
                    <>
                        {/* ─── HEADER ─── */}
                        <div className="bg-gradient-to-br from-[#16223C] to-[#0B1120] border-b border-white/[0.06] pt-10 pb-28 px-6 rounded-b-[48px] shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div>
                                    <h1 className="font-display text-white text-2xl font-semibold tracking-tight">SwiftMoney</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button onClick={() => requirePaid(() => navigateMonth(-1))} className="text-indigo-300 active:scale-90 transition-all p-0.5">
                                            {isPaid ? <ChevronLeft size={16} strokeWidth={3} /> : <span className="text-xs">🔒</span>}
                                        </button>
                                        <p className="text-indigo-200 text-xs font-bold tracking-wide">{monthLabel}</p>
                                        <button onClick={() => navigateMonth(1)} disabled={isCurrentMonth} className="text-indigo-300 active:scale-90 transition-all p-0.5 disabled:opacity-30">
                                            <ChevronRight size={16} strokeWidth={3} />
                                        </button>
                                        {!isCurrentMonth && (
                                            <button onClick={() => router.get(route('dashboard'))} className="text-[8px] font-black text-indigo-300 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                Hari Ini
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-indigo-300 text-[10px] font-medium">{isSaya ? user?.name : 'Keluarga'} &bull; RM {Number(s.total_bills).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <button onClick={() => router.get(route('summary.index'), { month: monthYear })} className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md border border-white/10 active:scale-90 transition-all" title="Ringkasan bulanan">
                                        <FileText size={20} />
                                    </button>
                                    <button onClick={() => setIsHidden(!isHidden)} className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md border border-white/10 active:scale-90 transition-all">
                                        {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                    <div className="bg-white/10 p-1 rounded-full border-2 border-gold/40">
                                        {user?.avatar
                                            ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                            : <div className="bg-indigo-600 text-[10px] text-white font-bold w-8 h-8 rounded-full flex items-center justify-center uppercase">{user?.name?.substring(0, 3) || 'USR'}</div>
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex gap-2 mb-4 relative z-10">
                                <button onClick={() => setViewMode('saya')} className={`flex-1 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${isSaya ? 'bg-gold text-ink shadow-md' : 'bg-white/10 text-indigo-200 border border-white/10'}`}>
                                    {user?.name || 'Saya'}
                                </button>
                                <button onClick={() => setViewMode('keluarga')} className={`flex-1 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${!isSaya ? 'bg-gold text-ink shadow-md' : 'bg-white/10 text-indigo-200 border border-white/10'}`}>
                                    <Users size={14} /> Keluarga
                                    {familyS.total_unpaid > 0 && isSaya && (
                                        <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">!</span>
                                    )}
                                </button>
                            </div>

                            {/* Quick tools */}
                            <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
                                <ToolButton icon={Landmark} label="Cukai" onClick={() => router.get(route('tax.index'))} />
                                <ToolButton icon={HandCoins} label="Zakat" onClick={() => router.get(route('zakat.index'))} />
                                <ToolButton icon={Scale} label="Nilai Bersih" onClick={() => router.get(route('networth.index'))} />
                            </div>

                            {/* Summary Card — dark glass hero */}
                            <div className="luxe-card rounded-[32px] p-6 relative z-10 overflow-hidden ring-1 ring-gold/15">
                                <div className="absolute -top-16 -right-16 w-44 h-44 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5 flex items-center gap-1.5">
                                            <Wallet size={12} className="text-gold" /> Baki Bersih (Net)
                                        </p>
                                        <h2 className="text-4xl luxe-figure text-white tracking-tight">
                                            {formatMoney(s.net_balance, isHidden, true)}
                                        </h2>
                                    </div>
                                    <div className={`${s.net_balance >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'} p-2 rounded-2xl border border-white/10`}>
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 relative">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pendapatan</p>
                                        <p className="text-sm font-bold text-emerald-400">{formatMoney(s.total_income, isHidden, true)}</p>
                                    </div>
                                    <div className="text-right border-l border-white/10 pl-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Baki Bil</p>
                                        <p className="text-sm font-bold text-red-400">{formatMoney(s.total_unpaid)}</p>
                                    </div>
                                </div>

                                <div className="mt-6 relative">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase">
                                        <span>Progress Bayaran</span>
                                        <span className="text-gold">{s.progress_pct}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-gold-deep to-gold rounded-full transition-all duration-1000 ease-out" style={{ width: `${s.progress_pct}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── CONTENT ─── */}
                        <div className="px-6 -mt-12 space-y-8 relative z-20 pb-20">

                            {/* Family Pending Status */}
                            {isSaya && (
                                <div className={`p-4 rounded-3xl border shadow-sm flex items-center gap-3 ${
                                    familyS.total_unpaid > 0
                                        ? 'bg-amber-500/10 border-amber-500/25'
                                        : 'bg-green-500/15 border-green-100'
                                }`}>
                                    <div className={`p-2 rounded-2xl ${familyS.total_unpaid > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                                        <Users size={18} className={familyS.total_unpaid > 0 ? 'text-amber-600' : 'text-emerald-400'} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-black ${familyS.total_unpaid > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                                            {familyS.total_unpaid > 0
                                                ? `Keluarga ada baki: ${formatMoney(familyS.total_unpaid)}`
                                                : 'Semua komitmen keluarga selesai!'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${familyS.total_unpaid > 0 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${familyS.progress_pct}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400">{familyS.progress_pct}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Income Sources */}
                            <section>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                        <ArrowUpRight size={14} className="text-green-500" /> Sumber Pendapatan
                                    </h3>
                                    <button onClick={() => { setSelectedIncome(null); setShowIncomeModal(true); }} className="text-[10px] font-bold text-indigo-300 flex items-center gap-1 bg-indigo-500/15 px-2 py-1 rounded-lg">
                                        <Plus size={12}/> TAMBAH
                                    </button>
                                </div>
                                <div className="luxe-card rounded-3xl p-5 flex gap-6 overflow-x-auto">
                                    {incomeList.length === 0 ? (
                                        <p className="text-slate-400 text-xs">Tiada pendapatan untuk bulan ini</p>
                                    ) : incomeList.map(inc => (
                                        <div key={inc.id} onClick={() => { setSelectedIncome(inc); setShowIncomeModal(true); }} className="min-w-[120px] flex flex-col cursor-pointer active:scale-95 transition-all p-2 -m-2 rounded-2xl hover:bg-slate-50">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{inc.source}</p>
                                            <p className="text-sm font-black text-slate-100">{formatMoney(inc.amount, isHidden, true)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* One-Time Expenses */}
                            <section>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                        <Receipt size={14} className="text-violet-500" /> Perbelanjaan Lain
                                    </h3>
                                    <button onClick={() => { setEditExpense(null); setShowExpenseModal(true); }} className="text-[10px] font-bold text-violet-300 flex items-center gap-1 bg-violet-500/15 px-2 py-1 rounded-lg">
                                        <Plus size={12}/> TAMBAH
                                    </button>
                                </div>
                                <div className="luxe-card rounded-3xl p-5">
                                    {(expenses || []).length === 0 ? (
                                        <p className="text-slate-400 text-xs text-center">Tiada perbelanjaan lain bulan ini</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {(expenses || []).map(exp => (
                                                <div key={exp.id} onClick={() => { setEditExpense(exp); setShowExpenseModal(true); }} className="flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-100">{exp.title}</p>
                                                        <p className="text-[10px] text-slate-400">{exp.category}{exp.note ? ` · ${exp.note}` : ''} · {exp.by}</p>
                                                    </div>
                                                    <p className="text-sm font-black text-violet-300">{formatMoney(exp.amount, isHidden, true)}</p>
                                                </div>
                                            ))}
                                            <div className="border-t pt-2 mt-1 flex justify-between">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Jumlah</p>
                                                <p className="text-[12px] font-black text-violet-300">{formatMoney((expenses||[]).reduce((a,e)=>a+e.amount,0), isHidden, true)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Cash flow forecast */}
                            <ForecastCard forecast={isSaya ? my_forecast : forecast} />

                            {/* Budget per category */}
                            <BudgetSection budgets={budgets} categories={CATEGORIES} />

                            {/* Debt Tracker */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingDown size={14} className="text-orange-500" /> Pengurangan Hutang
                                    </h3>
                                    {isAdmin && (
                                        <button onClick={() => requirePaid(() => setShowDebtModal(true))} className="text-[10px] font-bold text-orange-600 flex items-center gap-1 bg-orange-500/15 px-2 py-1 rounded-lg">
                                            {isPaid ? <Plus size={12}/> : <span>🔒</span>} TAMBAH
                                        </button>
                                    )}
                                </div>
                                {debts.length === 0 ? (
                                    <div className="luxe-card rounded-3xl p-5">
                                        <p className="text-slate-400 text-xs text-center">Tiada hutang aktif</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {debts.map((debt) => (
                                            <div key={debt.id} className="luxe-card p-5 rounded-[24px]">
                                                <div className="flex justify-between items-end mb-2.5">
                                                    <div>
                                                        <h4 className="font-bold text-slate-100 text-[13px]">{debt.title}</h4>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                            {debt.type === 'fixed' ? 'Bayaran Tetap' : 'Bayaran Fleksibel'}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] font-black text-indigo-300 font-mono">
                                                        {formatMoney(debt.paid, isHidden, true)}
                                                    </p>
                                                </div>
                                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                                                    <div className="bg-orange-400 h-full rounded-full transition-all duration-1000" style={{ width: `${debt.pct}%` }}></div>
                                                </div>
                                                <div className="flex justify-between mt-2">
                                                    <p className="text-[8px] text-slate-400 font-bold">Baki: {formatMoney(debt.remaining, isHidden, true)}</p>
                                                    <p className="text-[8px] text-slate-400 font-bold">{debt.pct}% selesai</p>
                                                </div>
                                                {/* Action buttons */}
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                                                    <button onClick={() => openPayment(debt)} className="flex-1 text-[10px] font-bold text-orange-600 bg-orange-500/15 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <DollarSign size={12}/> Bayar
                                                    </button>
                                                    <button onClick={() => openHistory(debt)} className="flex-1 text-[10px] font-bold text-slate-500 bg-white/5 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <Clock size={12}/> Sejarah
                                                    </button>
                                                    {isAdmin && (
                                                        <button onClick={() => { setEditDebt(debt); setShowDebtModal(true); }} className="flex-1 text-[10px] font-bold text-indigo-500 bg-indigo-500/15 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                            <Pencil size={12}/> Edit
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <button onClick={() => { if (confirm('Mark hutang ini selesai?')) router.post(route('debts.settle', debt.id), {}, { preserveScroll: true }); }} className="flex-1 text-[10px] font-bold text-emerald-400 bg-green-500/15 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                            <CheckCheck size={12}/> Selesai
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Savings Goals */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                        <PiggyBank size={14} className="text-emerald-500" /> Simpanan
                                    </h3>
                                    {isAdmin && (
                                        <button onClick={() => setShowSavingsModal(true)} className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/15 px-2 py-1 rounded-lg">
                                            <Plus size={12}/> TAMBAH
                                        </button>
                                    )}
                                </div>
                                {(savings_goals || []).length === 0 ? (
                                    <div className="luxe-card rounded-3xl p-5 text-center">
                                        <p className="text-slate-400 text-xs">Tiada sasaran simpanan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(savings_goals || []).map(goal => (
                                            <div key={goal.id} className="luxe-card p-5 rounded-[24px]">
                                                <div className="flex justify-between items-start mb-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{goal.emoji}</span>
                                                        <div>
                                                            <h4 className="font-bold text-slate-100 text-[13px]">{goal.title}</h4>
                                                            {goal.deadline && (
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                                                    <Calendar size={9}/> {new Date(goal.deadline).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-black text-emerald-400">{goal.pct}%</p>
                                                        {goal.on_track === 'on_track' && <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">On track 🟢</span>}
                                                        {goal.on_track === 'behind' && <span className="text-[8px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-md">Perlu kejar 🟡</span>}
                                                        {goal.on_track === 'far_behind' && <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">Jauh ketinggalan 🔴</span>}
                                                        {goal.on_track === 'overdue' && <span className="text-[8px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">Tarikh lepas!</span>}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                                                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${goal.pct}%` }}></div>
                                                </div>
                                                <div className="flex justify-between mt-2">
                                                    <p className="text-[8px] text-slate-400 font-bold">{formatMoney(goal.saved)} / {formatMoney(goal.target)}</p>
                                                    <p className="text-[8px] text-slate-400 font-bold">Baki: {formatMoney(goal.remaining)}</p>
                                                </div>
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                                                    <button onClick={() => { setSelectedGoal(goal); setShowContributeModal(true); }} className="flex-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <Plus size={12}/> Tambah
                                                    </button>
                                                    {isAdmin && (
                                                        <button onClick={() => { setEditGoal(goal); setShowSavingsModal(true); }} className="flex-1 text-[10px] font-bold text-indigo-500 bg-indigo-500/15 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                            <Pencil size={12}/> Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Bills by Category */}
                            {CATEGORIES.map(cat => {
                                const catBills = bills[cat];
                                if (!catBills || catBills.length === 0) return null;
                                const activeBills = catBills.filter(b => !b.is_skipped);
                                const skippedBills = catBills.filter(b => b.is_skipped);
                                if (activeBills.length === 0 && skippedBills.length === 0) return null;
                                return (
                                    <section key={cat}>
                                        <div className="flex justify-between items-center mb-4 text-[11px] font-black text-slate-200 uppercase tracking-widest">
                                            <span className="flex items-center gap-2">
                                                {categoryIcons[cat]}
                                                {cat}
                                            </span>
                                            <span className="text-[9px] luxe-chip text-slate-300 px-2 py-0.5 rounded-full">{activeBills.length} ITEM</span>
                                        </div>
                                        <div className="space-y-3">
                                            {activeBills.map(bill => (
                                                <div
                                                    key={bill.id}
                                                    onClick={() => handleTogglePaid(bill.id)}
                                                    className={`flex items-center justify-between p-4 rounded-[22px] transition-all border-2 cursor-pointer ${
                                                        bill.paid
                                                            ? 'bg-white/5 border-transparent opacity-60'
                                                            : 'bg-white/[0.05] border-white/10 shadow-sm'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {bill.paid ? <CheckCircle size={26} className="text-green-500" /> : <Circle size={26} className="text-slate-200" />}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`text-[13px] font-bold leading-tight ${bill.paid ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                                                                    {bill.title}
                                                                </h4>
                                                                {!bill.paid && bill.urgency === 'overdue' && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md uppercase animate-pulse">Lewat!</span>}
                                                                {!bill.paid && bill.urgency === 'urgent' && <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md uppercase">{bill.due_day - new Date().getDate()}h lagi</span>}
                                                                {!bill.paid && bill.urgency === 'soon' && <span className="text-[8px] font-black bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded-md uppercase">{bill.due_day - new Date().getDate()}h lagi</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-xs font-black ${bill.paid ? 'text-slate-400' : 'text-indigo-300'}`}>
                                                                    {formatMoney(bill.amount)}
                                                                </span>
                                                                {isAdmin ? (
                                                                    <button
                                                                        onClick={(e) => handleToggleAssign(e, bill.template_id, bill.assigned)}
                                                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase active:scale-90 transition-all ${
                                                                        (family_members || [])[0]?.name === bill.assigned ? 'bg-indigo-500/15 text-indigo-500' : 'bg-pink-50 text-pink-500'
                                                                    }`}>
                                                                        {bill.assigned}
                                                                    </button>
                                                                ) : (
                                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                                                        (family_members || [])[0]?.name === bill.assigned ? 'bg-indigo-500/15 text-indigo-500' : 'bg-pink-50 text-pink-500'
                                                                    }`}>
                                                                        {bill.assigned}
                                                                    </span>
                                                                )}
                                                                {bill.debt_title && (
                                                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-500 uppercase flex items-center gap-0.5">
                                                                        <Link2 size={8}/> {bill.debt_title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!bill.paid && (
                                                            <a
                                                                href={`https://wa.me/?text=${encodeURIComponent(`Hei 😊 boleh settlekan ${bill.title} RM${Number(bill.amount).toFixed(2)} bulan ni? TQ!`)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-1.5 rounded-xl bg-green-500/15 text-green-500 active:scale-90 transition-all"
                                                            >
                                                                <MessageCircle size={14} />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); setShowReceiptModal(true); }}
                                                            className={`p-1.5 rounded-xl active:scale-90 transition-all ${bill.receipt_path ? 'bg-green-500/15 text-green-500' : 'bg-white/5 text-slate-300'}`}
                                                        >
                                                            {bill.receipt_path ? <Image size={14} /> : <Camera size={14} />}
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedTemplate({ id: bill.template_id, title: bill.title, default_amount: bill.default_amount, category: bill.category, assigned_to: bill.assigned, debt_id: bill.debt_id || '', due_day: bill.due_day || '' }); setShowBillModal(true); }}
                                                                className="p-1.5 rounded-xl bg-white/5 text-slate-400 active:scale-90 transition-all"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        )}
                                                        {isAdmin && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); if (confirm(`Langkau "${bill.title}" bulan ini sahaja?\n\nBulan depan akan kekal seperti biasa.`)) router.post(route('bills.skip', bill.id), {}, { preserveScroll: true }); }}
                                                                className="p-1.5 rounded-xl bg-red-50 text-red-400 active:scale-90 transition-all"
                                                                title="Langkau bulan ini sahaja"
                                                            >
                                                                <Ban size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {skippedBills.length > 0 && isAdmin && (
                                                <div className="mt-1 space-y-2">
                                                    {skippedBills.map(bill => (
                                                        <div key={bill.id} className="flex items-center justify-between px-4 py-3 rounded-[18px] bg-slate-100/60 border border-dashed border-slate-200 opacity-60">
                                                            <div className="flex items-center gap-3">
                                                                <Ban size={16} className="text-slate-400 shrink-0" />
                                                                <div>
                                                                    <p className="text-[12px] font-bold text-slate-400 line-through">{bill.title}</p>
                                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Dilangkau bulan ini</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => router.post(route('bills.unskip', bill.id), {}, { preserveScroll: true })}
                                                                className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-500/15 px-2.5 py-1.5 rounded-xl active:scale-90 transition-all opacity-100"
                                                            >
                                                                <RotateCcw size={11} /> Pulihkan
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </>
                ) : activeTab === 'analytics' ? (
                    isPaid ? <AnalyticsView familyId={user?.family_id} /> : (
                        <div className="p-6 pt-20 flex flex-col items-center justify-center space-y-4 text-center">
                            <span className="text-5xl">📊</span>
                            <h3 className="font-display text-lg font-semibold text-white">Analitik — Pro</h3>
                            <p className="text-slate-400 text-sm">Trend 6 bulan, breakdown kategori dan lebih.</p>
                            <button onClick={() => setShowUpgradeModal(true)} className="luxe-btn-gold px-6 py-3 text-sm">
                                Upgrade untuk akses
                            </button>
                        </div>
                    )
                ) : activeTab === 'savings' ? (
                    <div className="p-6 pt-16 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-display text-xl font-semibold text-white tracking-tight">Simpanan</h2>
                                <p className="text-slate-400 text-xs mt-1">Sasaran & perkembangan</p>
                            </div>
                            {isAdmin && (
                                <button onClick={() => requirePaid(() => setShowSavingsModal(true))} className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-md shadow-emerald-200 active:scale-95 transition-all">
                                    {isPaid ? <Plus size={14}/> : <span>🔒</span>} Baru
                                </button>
                            )}
                        </div>
                        {(savings_goals || []).length === 0 ? (
                            <div className="luxe-card rounded-[28px] p-10 text-center space-y-3">
                                <span className="text-5xl">🐷</span>
                                <p className="text-slate-400 text-sm font-medium">Belum ada sasaran simpanan</p>
                                {isAdmin && (
                                    <button onClick={() => setShowSavingsModal(true)} className="text-emerald-400 font-bold text-xs bg-emerald-500/15 px-4 py-2 rounded-xl">
                                        Tambah Pertama
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Summary bar */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="luxe-card p-4 rounded-3xl">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Terkumpul</p>
                                        <p className="text-sm font-black text-emerald-400">{formatMoney((savings_goals||[]).reduce((a,g)=>a+g.saved,0))}</p>
                                    </div>
                                    <div className="luxe-card p-4 rounded-3xl">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Target</p>
                                        <p className="text-sm font-black text-slate-100">{formatMoney((savings_goals||[]).reduce((a,g)=>a+g.target,0))}</p>
                                    </div>
                                </div>
                                {(savings_goals || []).map(goal => (
                                    <div key={goal.id} className="luxe-card p-5 rounded-[24px]">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{goal.emoji}</span>
                                                <div>
                                                    <h4 className="font-bold text-slate-100">{goal.title}</h4>
                                                    {goal.deadline && (
                                                        <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                                                            <Calendar size={9}/> {new Date(goal.deadline).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'})}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-emerald-400">{goal.pct}%</p>
                                                <p className="text-[9px] text-slate-400 font-bold">selesai</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                                            <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${goal.pct}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-2 mb-3">
                                            <p className="text-xs font-black text-emerald-400">{formatMoney(goal.saved)}</p>
                                            <p className="text-xs font-black text-slate-400">{formatMoney(goal.target)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSelectedGoal(goal); setShowContributeModal(true); }} className="flex-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 py-2.5 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                <Plus size={12}/> Tambah Simpanan
                                            </button>
                                            {isAdmin && (
                                                <button onClick={() => { setEditGoal(goal); setShowSavingsModal(true); }} className="px-4 text-[10px] font-bold text-slate-500 bg-white/5 py-2.5 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                                                    <Pencil size={12}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <ProfileView user={user} summary={s} savingsGoals={savings_goals} activeDebts={active_debts} isHidden={isHidden} onEditProfile={() => setShowEditProfile(true)} familyMembers={family_members} inviteLink={invite_link} />
                )}

                {/* ─── Floating Nav ─── */}
                <div className="fixed bottom-6 left-6 right-6 max-w-[calc(448px-3rem)] mx-auto z-50">
                    <div className="bg-ink-soft/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] flex justify-around items-center p-3">
                        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'home' ? 'text-indigo-300' : 'text-slate-400'}`}>
                            <Home size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Home</span>
                        </button>
                        <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'analytics' ? 'text-indigo-300' : 'text-slate-400'}`}>
                            <BarChart2 size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Analitik</span>
                        </button>
                        {isAdmin ? (
                            <button onClick={() => setShowBillModal(true)} className="bg-gold text-ink p-4 rounded-2xl shadow-lg shadow-gold/30 -mt-12 active:scale-90 transition-all border-4 border-ink-soft">
                                <Plus size={24} strokeWidth={3} />
                            </button>
                        ) : (
                            <div className="w-14" />
                        )}
                        <button onClick={() => setActiveTab('savings')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'savings' ? 'text-emerald-400' : 'text-slate-400'}`}>
                            <PiggyBank size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Simpan</span>
                        </button>
                        <button onClick={() => setActiveTab('user')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'user' ? 'text-indigo-300' : 'text-slate-400'}`}>
                            <User size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Profil</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
