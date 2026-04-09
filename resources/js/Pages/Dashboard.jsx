import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    CheckCircle, Circle, Home, CreditCard, GraduationCap,
    Zap, Heart, User, Plus, ChevronRight,
    TrendingDown, TrendingUp, Eye, EyeOff, Wallet, ArrowUpRight, X, ChevronLeft,
    LogOut, Users, FileText, Bell, ShieldCheck,
    Clock, DollarSign, Link2, Camera, Image, Trash2, Pencil,
    Car, Smartphone, Wifi, ShoppingCart, Activity, Tv, Droplets, Fuel,
    PiggyBank, Target, BarChart2, RefreshCw, CheckCheck, Calendar,
    KeyRound, UserCog, Award, Trophy, AlertTriangle, Flame
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
            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
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
                    <input type="text" placeholder="e.g. Bonus, Felda" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.source} onChange={(e) => setData('source', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                </div>
                <button
                    type="button"
                    onClick={() => setData('is_recurring', !data.is_recurring)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${data.is_recurring ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-500'}`}
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
function BillModal({ show, onClose, allDebts, editTemplate }) {
    const isEdit = !!editTemplate;
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        title: '', default_amount: '', category: 'Rumah', assigned_to: 'Abg', debt_id: '',
    });

    useEffect(() => {
        if (editTemplate) {
            setData({
                title: editTemplate.title,
                default_amount: editTemplate.default_amount,
                category: editTemplate.category,
                assigned_to: editTemplate.assigned_to,
                debt_id: editTemplate.debt_id || '',
            });
        } else {
            reset();
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
                    <input type="text" placeholder="e.g. Astro, Bil Air" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah</label>
                        <input type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.default_amount} onChange={(e) => setData('default_amount', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kategori</label>
                        <select className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">PIC</label>
                        <select className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.assigned_to} onChange={(e) => setData('assigned_to', e.target.value)}>
                            <option value="Abg">Abang</option>
                            <option value="Ayg">Sayang</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Link Hutang</label>
                        <select className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.debt_id} onChange={(e) => setData('debt_id', e.target.value)}>
                            <option value="">Tiada</option>
                            {(allDebts || []).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 mt-2 active:scale-95 transition-all disabled:opacity-50">
                    {processing ? 'Saving...' : isEdit ? 'Kemaskini Komitmen' : 'Tambah Komitmen'}
                </button>
                {isEdit && (
                    <button type="button" disabled={processing} onClick={() => destroy(route('bills.templates.destroy', editTemplate.id), { onSuccess: () => { reset(); onClose(); } })} className="w-full text-red-500 font-bold text-sm p-3 rounded-2xl bg-red-50 active:scale-95 transition-all disabled:opacity-50">
                        Padam Komitmen
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
                    <input type="text" placeholder="e.g. Hutang Kereta, CC Bank" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah Asal (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.total_amount} onChange={(e) => setData('total_amount', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jenis Bayaran</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 appearance-none focus:ring-2 focus:ring-indigo-300 outline-none" value={data.type} onChange={(e) => setData('type', e.target.value)}>
                        <option value="fixed">Tetap (Fixed)</option>
                        <option value="flexible">Fleksibel</option>
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
            <div className="mb-4 p-4 bg-orange-50 rounded-2xl">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Baki semasa</span>
                    <span className="font-black text-orange-600">{formatMoney(debt?.remaining || 0)}</span>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah Bayaran (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
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
            <div className="mb-4 p-4 bg-slate-50 rounded-2xl">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Jumlah</p>
                        <p className="text-sm font-black text-slate-700">{formatMoney(debt?.total || 0)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Dah Bayar</p>
                        <p className="text-sm font-black text-green-600">{formatMoney(debt?.paid || 0)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Baki</p>
                        <p className="text-sm font-black text-orange-600">{formatMoney(debt?.remaining || 0)}</p>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="h-2 bg-white rounded-full overflow-hidden">
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
                        <div key={p.id || i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                            <div className="bg-green-100 p-2 rounded-xl">
                                <DollarSign size={16} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-700">{formatMoney(p.amount_paid)}</p>
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <Clock size={10} /> {formatDate(p.payment_date)}
                                </p>
                            </div>
                            {p.bill_record_id && (
                                <span className="text-[8px] font-bold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md uppercase">
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
                        <label className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 py-3 rounded-xl cursor-pointer active:scale-95 transition-all">
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
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
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
                    <input type="text" placeholder="e.g. Dana Kecemasan, DP Rumah" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Target (RM)</label>
                        <input type="number" step="1" placeholder="10000" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.target_amount} onChange={(e) => setData('target_amount', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tarikh Target</label>
                        <input type="date" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={data.deadline} onChange={(e) => setData('deadline', e.target.value)} />
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
            <div className="mb-4 p-4 bg-emerald-50 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Terkumpul</p>
                    <p className="text-sm font-black text-emerald-600">{formatMoney(goal?.saved || 0)} / {formatMoney(goal?.target || 0)}</p>
                </div>
                <span className="text-3xl">{goal?.emoji}</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jumlah (RM)</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-emerald-300 outline-none" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nota (optional)</label>
                    <input type="text" placeholder="e.g. Lebihan gaji" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-emerald-300 outline-none" value={data.note} onChange={(e) => setData('note', e.target.value)} />
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
                <h2 className="text-xl font-black text-slate-800 tracking-tighter">Analitik</h2>
                <p className="text-slate-400 text-xs font-medium mt-1">6 bulan terakhir</p>
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
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
            <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
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
                <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Breakdown Kategori (Bulan Ini)</h3>
                    <div className="space-y-3">
                        {data.breakdown.map((item, i) => {
                            const max = data.breakdown[0]?.amount || 1;
                            return (
                                <div key={item.category}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-600">{item.category}</span>
                                        <span className="text-xs font-black text-slate-700">RM {Number(item.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
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
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
                <button onClick={() => setTab('profil')} className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${tab === 'profil' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                    Maklumat
                </button>
                <button onClick={() => setTab('password')} className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${tab === 'password' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                    Password
                </button>
            </div>

            {tab === 'profil' ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Paparan</label>
                        <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} />
                        <p className="text-[9px] text-amber-500 font-bold ml-1 mt-1">⚠️ Nama ini digunakan untuk assignment bil (Abg/Ayg). Tukar berhati-hati.</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                        <input type="email" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} />
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
                        <input type="password" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} />
                        {passwordForm.errors.current_password && <p className="text-xs text-red-500 ml-1 mt-1">{passwordForm.errors.current_password}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Baru</label>
                        <input type="password" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} />
                        {passwordForm.errors.password && <p className="text-xs text-red-500 ml-1 mt-1">{passwordForm.errors.password}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sahkan Password Baru</label>
                        <input type="password" className="w-full bg-slate-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-indigo-300 outline-none" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} />
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
function FamilySection({ user, familyMembers, inviteLink }) {
    const { post, processing } = useForm();
    const [copied, setCopied] = useState(false);
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
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Ahli Keluarga</h3>
            <div className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm space-y-3">
                {(familyMembers || []).map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black uppercase flex-shrink-0">
                            {m.name?.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{m.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase">{m.role}</p>
                        </div>
                        {m.id === user?.id && (
                            <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">Saya</span>
                        )}
                    </div>
                ))}

                {isAdmin && (familyMembers || []).length < 2 && (
                    <div className="border-t border-slate-50 pt-3 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Jemput Pasangan</p>
                        {inviteLink ? (
                            <div className="flex gap-2">
                                <div className="flex-1 bg-slate-50 rounded-2xl px-3 py-2 text-[10px] text-slate-500 truncate font-mono">
                                    {inviteLink}
                                </div>
                                <button
                                    onClick={copyLink}
                                    className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600 active:scale-95'}`}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={generateLink}
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-xs font-bold py-3 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Link2 size={14}/> Jana Link Jemputan
                            </button>
                        )}
                        <p className="text-[9px] text-slate-300 font-medium">Link sah selama 7 hari. Satu link satu masa.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProfileView({ user, summary, savingsGoals, activeDebts, isHidden, onEditProfile, familyMembers, inviteLink }) {
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

    const scoreConfig = healthScore >= 90 ? { label: 'Cemerlang', color: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-200', icon: <Trophy size={20} className="text-emerald-600"/> } :
                        healthScore >= 75 ? { label: 'Bagus', color: 'text-indigo-600', bg: 'bg-indigo-500', ring: 'ring-indigo-200', icon: <Award size={20} className="text-indigo-600"/> } :
                        healthScore >= 60 ? { label: 'OK', color: 'text-sky-600', bg: 'bg-sky-400', ring: 'ring-sky-200', icon: <ShieldCheck size={20} className="text-sky-600"/> } :
                        healthScore >= 40 ? { label: 'Perlu Perhatian', color: 'text-amber-600', bg: 'bg-amber-400', ring: 'ring-amber-200', icon: <AlertTriangle size={20} className="text-amber-600"/> } :
                                           { label: 'Kritikal', color: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-200', icon: <Flame size={20} className="text-red-600"/> };

    return (
        <div className="p-6 pt-16 space-y-6">
            {/* Avatar + Edit */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-black shadow-xl border-4 border-white uppercase">
                            {user?.name?.substring(0, 3) || 'USR'}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tighter">{user?.name}</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{user?.role === 'admin' ? 'Admin' : 'Member'}</p>
                        <div className="flex gap-1.5 mt-1">
                            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldCheck size={9}/> Verified
                            </span>
                            <span className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Users size={9}/> Family
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={onEditProfile} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-2 rounded-2xl active:scale-95 transition-all">
                    <UserCog size={14}/> Edit
                </button>
            </div>

            {/* Financial Health Score */}
            <div className={`bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 ring-2 ${scoreConfig.ring}`}>
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
                        { label: 'Bil Bayar', value: Math.round(billsScore), color: 'text-indigo-600' },
                        { label: 'Simpanan', value: Math.round(savingsScore), color: 'text-emerald-600' },
                        { label: 'Hutang', value: Math.round(debtScore), color: 'text-orange-500' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-slate-50 rounded-2xl p-2">
                            <p className={`text-sm font-black ${color}`}>{value}%</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Tahunan</p>
                    <p className="text-sm font-black text-slate-800">{formatMoney(totalIncome * 12, isHidden, true)}</p>
                    <p className="text-[8px] text-slate-300 font-bold mt-1 tracking-tighter">ANGGARAN ANNUAL</p>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Burn Rate</p>
                    <p className={`text-sm font-black ${burnRate > 80 ? 'text-red-500' : burnRate > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{burnRate}%</p>
                    <p className="text-[8px] text-slate-300 font-bold mt-1 tracking-tighter">PENDAPATAN DIGUNAKAN</p>
                </div>
            </div>

            {/* Family Members */}
            <FamilySection user={user} familyMembers={familyMembers} inviteLink={inviteLink} />

            {/* Settings */}
            <div className="space-y-3">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Tetapan</h3>
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                    <button onClick={onEditProfile} className="w-full p-4 flex items-center justify-between border-b border-slate-50 active:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl"><UserCog size={20}/></div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-700">Edit Profil</p>
                                <p className="text-[10px] text-slate-400 font-medium">Nama, email, password</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                    </button>
                    <div className="p-4 flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl"><Bell size={20}/></div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Notifikasi</p>
                                <p className="text-[10px] text-slate-400 font-medium">Auto-remind setiap 29hb</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-50 text-slate-600 p-2.5 rounded-2xl"><FileText size={20}/></div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Laporan Kewangan</p>
                                <p className="text-[10px] text-slate-400 font-medium">Export PDF bulanan</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                    <button onClick={() => router.post(route('logout'))} className="w-full p-4 flex items-center gap-4 text-red-500 active:bg-red-50 transition-colors">
                        <div className="bg-red-50 p-2.5 rounded-2xl"><LogOut size={20}/></div>
                        <p className="text-sm font-bold">Log Keluar</p>
                    </button>
                </div>

                <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest py-4">
                    SwiftMoney PWA v1.1.0
                </p>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───
export default function Dashboard({ user, summary, my_summary, incomes, my_incomes, categorized_bills, my_bills, active_debts, all_debts, monthYear, needsSetup, savings_goals, family_members, invite_link }) {
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

    // Real-time sync: reload dashboard when family member updates a bill
    useEffect(() => {
        if (!window.Echo || !user?.family_id) return;
        const channel = window.Echo.private(`family.${user.family_id}`);
        channel.listen('.bill.updated', () => {
            router.reload({ preserveScroll: true });
        });
        return () => channel.stopListening('.bill.updated');
    }, [user?.family_id]);

    if (needsSetup) {
        return (
            <>
                <Head title="Setup" />
                <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-xl text-center space-y-4">
                        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Wallet size={32} className="text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Selamat Datang!</h2>
                        <p className="text-slate-500 text-sm">Sila hubungi admin untuk link akaun anda ke family.</p>
                    </div>
                </div>
            </>
        );
    }

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
        const newAssigned = currentAssigned === 'Abg' ? 'Ayg' : 'Abg';
        router.put(route('bills.templates.assign', templateId), { assigned_to: newAssigned }, { preserveScroll: true });
    };

    const openPayment = (debt) => { setSelectedDebt(debt); setShowPaymentModal(true); };
    const openHistory = (debt) => { setSelectedDebt(debt); setShowHistoryModal(true); };

    return (
        <>
            <Head title="Dashboard" />
            <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-28 font-sans text-slate-900 overflow-x-hidden relative">

                <IncomeModal show={showIncomeModal} onClose={() => { setShowIncomeModal(false); setSelectedIncome(null); }} monthYear={monthYear} editIncome={selectedIncome} />
                <BillModal show={showBillModal} onClose={() => { setShowBillModal(false); setSelectedTemplate(null); }} allDebts={all_debts} editTemplate={selectedTemplate} />
                <DebtModal show={showDebtModal} onClose={() => { setShowDebtModal(false); setEditDebt(null); }} editDebt={editDebt} />
                <SavingsModal show={showSavingsModal} onClose={() => { setShowSavingsModal(false); setEditGoal(null); }} editGoal={editGoal} />
                <SavingsContributeModal show={showContributeModal} onClose={() => { setShowContributeModal(false); setSelectedGoal(null); }} goal={selectedGoal} />
                <PaymentModal show={showPaymentModal} onClose={() => { setShowPaymentModal(false); setSelectedDebt(null); }} debt={selectedDebt} />
                <HistoryModal show={showHistoryModal} onClose={() => { setShowHistoryModal(false); setSelectedDebt(null); }} debt={selectedDebt} />
                <ReceiptModal show={showReceiptModal} onClose={() => { setShowReceiptModal(false); setSelectedBill(null); }} bill={selectedBill} />
                <EditProfileModal show={showEditProfile} onClose={() => setShowEditProfile(false)} user={user} />

                {activeTab === 'home' ? (
                    <>
                        {/* ─── HEADER ─── */}
                        <div className="bg-indigo-700 pt-10 pb-28 px-6 rounded-b-[48px] shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div>
                                    <h1 className="text-white text-2xl font-bold tracking-tight">SwiftMoney</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button onClick={() => navigateMonth(-1)} className="text-indigo-300 active:scale-90 transition-all p-0.5">
                                            <ChevronLeft size={16} strokeWidth={3} />
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
                                    <button onClick={() => setIsHidden(!isHidden)} className="bg-white/10 p-2.5 rounded-2xl text-white backdrop-blur-md border border-white/10 active:scale-90 transition-all">
                                        {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                    <div className="bg-white p-1 rounded-full border-2 border-indigo-400">
                                        <div className="bg-indigo-600 text-[10px] text-white font-bold w-8 h-8 rounded-full flex items-center justify-center uppercase">
                                            {user?.name?.substring(0, 3) || 'USR'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex gap-2 mb-4 relative z-10">
                                <button onClick={() => setViewMode('saya')} className={`flex-1 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${isSaya ? 'bg-white text-indigo-700 shadow-md' : 'bg-white/10 text-indigo-200 border border-white/10'}`}>
                                    {user?.name || 'Saya'}
                                </button>
                                <button onClick={() => setViewMode('keluarga')} className={`flex-1 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${!isSaya ? 'bg-white text-indigo-700 shadow-md' : 'bg-white/10 text-indigo-200 border border-white/10'}`}>
                                    <Users size={14} /> Keluarga
                                    {familyS.total_unpaid > 0 && isSaya && (
                                        <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">!</span>
                                    )}
                                </button>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-white rounded-[32px] p-6 shadow-2xl relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Wallet size={12} className="text-indigo-500" /> Baki Bersih (Net)
                                        </p>
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                                            {formatMoney(s.net_balance, isHidden, true)}
                                        </h2>
                                    </div>
                                    <div className={`${s.net_balance >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} p-2 rounded-2xl shadow-sm`}>
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pendapatan</p>
                                        <p className="text-sm font-black text-green-600">{formatMoney(s.total_income, isHidden, true)}</p>
                                    </div>
                                    <div className="text-right border-l border-slate-50 pl-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Baki Bil</p>
                                        <p className="text-sm font-black text-red-500">{formatMoney(s.total_unpaid)}</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase">
                                        <span>Progress Bayaran</span>
                                        <span className="text-indigo-600">{s.progress_pct}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${s.progress_pct}%` }}></div>
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
                                        ? 'bg-amber-50 border-amber-100'
                                        : 'bg-green-50 border-green-100'
                                }`}>
                                    <div className={`p-2 rounded-2xl ${familyS.total_unpaid > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                                        <Users size={18} className={familyS.total_unpaid > 0 ? 'text-amber-600' : 'text-green-600'} />
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
                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <ArrowUpRight size={14} className="text-green-500" /> Sumber Pendapatan
                                    </h3>
                                    <button onClick={() => { setSelectedIncome(null); setShowIncomeModal(true); }} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                                        <Plus size={12}/> TAMBAH
                                    </button>
                                </div>
                                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex gap-6 overflow-x-auto">
                                    {incomeList.length === 0 ? (
                                        <p className="text-slate-400 text-xs">Tiada pendapatan untuk bulan ini</p>
                                    ) : incomeList.map(inc => (
                                        <div key={inc.id} onClick={() => { setSelectedIncome(inc); setShowIncomeModal(true); }} className="min-w-[120px] flex flex-col cursor-pointer active:scale-95 transition-all p-2 -m-2 rounded-2xl hover:bg-slate-50">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{inc.source}</p>
                                            <p className="text-sm font-black text-slate-700">{formatMoney(inc.amount, isHidden, true)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Debt Tracker */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingDown size={14} className="text-orange-500" /> Pengurangan Hutang
                                    </h3>
                                    <button onClick={() => setShowDebtModal(true)} className="text-[10px] font-bold text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                                        <Plus size={12}/> TAMBAH
                                    </button>
                                </div>
                                {debts.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                                        <p className="text-slate-400 text-xs text-center">Tiada hutang aktif</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {debts.map((debt) => (
                                            <div key={debt.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                                                <div className="flex justify-between items-end mb-2.5">
                                                    <div>
                                                        <h4 className="font-bold text-slate-700 text-[13px]">{debt.title}</h4>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                            {debt.type === 'fixed' ? 'Bayaran Tetap' : 'Bayaran Fleksibel'}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] font-black text-indigo-600 font-mono">
                                                        {formatMoney(debt.paid, isHidden, true)}
                                                    </p>
                                                </div>
                                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100/50">
                                                    <div className="bg-orange-400 h-full rounded-full transition-all duration-1000" style={{ width: `${debt.pct}%` }}></div>
                                                </div>
                                                <div className="flex justify-between mt-2">
                                                    <p className="text-[8px] text-slate-400 font-bold">Baki: {formatMoney(debt.remaining, isHidden, true)}</p>
                                                    <p className="text-[8px] text-slate-400 font-bold">{debt.pct}% selesai</p>
                                                </div>
                                                {/* Action buttons */}
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                                                    <button onClick={() => openPayment(debt)} className="flex-1 text-[10px] font-bold text-orange-600 bg-orange-50 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <DollarSign size={12}/> Bayar
                                                    </button>
                                                    <button onClick={() => openHistory(debt)} className="flex-1 text-[10px] font-bold text-slate-500 bg-slate-50 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <Clock size={12}/> Sejarah
                                                    </button>
                                                    <button onClick={() => { setEditDebt(debt); setShowDebtModal(true); }} className="flex-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <Pencil size={12}/> Edit
                                                    </button>
                                                    <button onClick={() => { if (confirm('Mark hutang ini selesai?')) router.post(route('debts.settle', debt.id), {}, { preserveScroll: true }); }} className="flex-1 text-[10px] font-bold text-green-600 bg-green-50 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <CheckCheck size={12}/> Selesai
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Savings Goals */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <PiggyBank size={14} className="text-emerald-500" /> Simpanan
                                    </h3>
                                    <button onClick={() => setShowSavingsModal(true)} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                                        <Plus size={12}/> TAMBAH
                                    </button>
                                </div>
                                {(savings_goals || []).length === 0 ? (
                                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center">
                                        <p className="text-slate-400 text-xs">Tiada sasaran simpanan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(savings_goals || []).map(goal => (
                                            <div key={goal.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                                                <div className="flex justify-between items-start mb-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{goal.emoji}</span>
                                                        <div>
                                                            <h4 className="font-bold text-slate-700 text-[13px]">{goal.title}</h4>
                                                            {goal.deadline && (
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                                                    <Calendar size={9}/> {new Date(goal.deadline).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-black text-emerald-600">{goal.pct}%</p>
                                                </div>
                                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100/50">
                                                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${goal.pct}%` }}></div>
                                                </div>
                                                <div className="flex justify-between mt-2">
                                                    <p className="text-[8px] text-slate-400 font-bold">{formatMoney(goal.saved)} / {formatMoney(goal.target)}</p>
                                                    <p className="text-[8px] text-slate-400 font-bold">Baki: {formatMoney(goal.remaining)}</p>
                                                </div>
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                                                    <button onClick={() => { setSelectedGoal(goal); setShowContributeModal(true); }} className="flex-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <Plus size={12}/> Tambah
                                                    </button>
                                                    <button onClick={() => { setEditGoal(goal); setShowSavingsModal(true); }} className="flex-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                        <Pencil size={12}/> Edit
                                                    </button>
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
                                return (
                                    <section key={cat}>
                                        <div className="flex justify-between items-center mb-4 text-[11px] font-black text-slate-800 uppercase tracking-widest">
                                            <span className="flex items-center gap-2">
                                                {categoryIcons[cat]}
                                                {cat}
                                            </span>
                                            <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{catBills.length} ITEM</span>
                                        </div>
                                        <div className="space-y-3">
                                            {catBills.map(bill => (
                                                <div
                                                    key={bill.id}
                                                    onClick={() => handleTogglePaid(bill.id)}
                                                    className={`flex items-center justify-between p-4 rounded-[22px] transition-all border-2 cursor-pointer ${
                                                        bill.paid
                                                            ? 'bg-slate-50 border-transparent opacity-60'
                                                            : 'bg-white border-white shadow-sm ring-1 ring-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {bill.paid ? <CheckCircle size={26} className="text-green-500" /> : <Circle size={26} className="text-slate-200" />}
                                                        <div>
                                                            <h4 className={`text-[13px] font-bold leading-tight ${bill.paid ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                                {bill.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-xs font-black ${bill.paid ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                                    {formatMoney(bill.amount)}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => handleToggleAssign(e, bill.template_id, bill.assigned)}
                                                                    className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase active:scale-90 transition-all ${
                                                                    bill.assigned === 'Abg' ? 'bg-indigo-50 text-indigo-500' : 'bg-pink-50 text-pink-500'
                                                                }`}>
                                                                    {bill.assigned}
                                                                </button>
                                                                {bill.debt_title && (
                                                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-500 uppercase flex items-center gap-0.5">
                                                                        <Link2 size={8}/> {bill.debt_title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); setShowReceiptModal(true); }}
                                                            className={`p-1.5 rounded-xl active:scale-90 transition-all ${bill.receipt_path ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-300'}`}
                                                        >
                                                            {bill.receipt_path ? <Image size={14} /> : <Camera size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedTemplate({ id: bill.template_id, title: bill.title, default_amount: bill.default_amount, category: bill.category, assigned_to: bill.assigned, debt_id: bill.debt_id || '' }); setShowBillModal(true); }}
                                                            className="p-1.5 rounded-xl bg-slate-50 text-slate-400 active:scale-90 transition-all"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </>
                ) : activeTab === 'analytics' ? (
                    <AnalyticsView familyId={user?.family_id} />
                ) : activeTab === 'savings' ? (
                    <div className="p-6 pt-16 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tighter">Simpanan</h2>
                                <p className="text-slate-400 text-xs mt-1">Sasaran & perkembangan</p>
                            </div>
                            <button onClick={() => setShowSavingsModal(true)} className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-md shadow-emerald-200 active:scale-95 transition-all">
                                <Plus size={14}/> Baru
                            </button>
                        </div>
                        {(savings_goals || []).length === 0 ? (
                            <div className="bg-white rounded-[28px] p-10 shadow-sm border border-slate-100 text-center space-y-3">
                                <span className="text-5xl">🐷</span>
                                <p className="text-slate-400 text-sm font-medium">Belum ada sasaran simpanan</p>
                                <button onClick={() => setShowSavingsModal(true)} className="text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl">
                                    Tambah Pertama
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Summary bar */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Terkumpul</p>
                                        <p className="text-sm font-black text-emerald-600">{formatMoney((savings_goals||[]).reduce((a,g)=>a+g.saved,0))}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Target</p>
                                        <p className="text-sm font-black text-slate-700">{formatMoney((savings_goals||[]).reduce((a,g)=>a+g.target,0))}</p>
                                    </div>
                                </div>
                                {(savings_goals || []).map(goal => (
                                    <div key={goal.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{goal.emoji}</span>
                                                <div>
                                                    <h4 className="font-bold text-slate-700">{goal.title}</h4>
                                                    {goal.deadline && (
                                                        <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                                                            <Calendar size={9}/> {new Date(goal.deadline).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'})}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-emerald-600">{goal.pct}%</p>
                                                <p className="text-[9px] text-slate-400 font-bold">selesai</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                                            <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${goal.pct}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-2 mb-3">
                                            <p className="text-xs font-black text-emerald-600">{formatMoney(goal.saved)}</p>
                                            <p className="text-xs font-black text-slate-400">{formatMoney(goal.target)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSelectedGoal(goal); setShowContributeModal(true); }} className="flex-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 py-2.5 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                                <Plus size={12}/> Tambah Simpanan
                                            </button>
                                            <button onClick={() => { setEditGoal(goal); setShowSavingsModal(true); }} className="px-4 text-[10px] font-bold text-slate-500 bg-slate-50 py-2.5 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                                                <Pencil size={12}/>
                                            </button>
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
                    <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] flex justify-around items-center p-3">
                        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <Home size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Home</span>
                        </button>
                        <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <BarChart2 size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Analitik</span>
                        </button>
                        <button onClick={() => setShowBillModal(true)} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 -mt-12 active:scale-90 transition-all border-4 border-slate-50">
                            <Plus size={24} strokeWidth={3} />
                        </button>
                        <button onClick={() => setActiveTab('savings')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'savings' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <PiggyBank size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Simpan</span>
                        </button>
                        <button onClick={() => setActiveTab('user')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'user' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <User size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Profil</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
