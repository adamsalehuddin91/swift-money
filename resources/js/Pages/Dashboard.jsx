import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    CheckCircle, Circle, Home, CreditCard, GraduationCap,
    Zap, Heart, User, Plus, ChevronRight,
    TrendingDown, Eye, EyeOff, Wallet, ArrowUpRight, X,
    LogOut, Users, FileText, Bell, ShieldCheck,
    Clock, DollarSign, Link2, Camera, Image, Trash2
} from 'lucide-react';

const categoryIcons = {
    Sekolah: <GraduationCap size={16} className="text-blue-500" />,
    Rumah: <Home size={16} className="text-indigo-500" />,
    Insurance: <Heart size={16} className="text-red-500" />,
    Coway: <Zap size={16} className="text-orange-500" />,
    Lain2: <CreditCard size={16} className="text-slate-500" />,
};

const CATEGORIES = ['Sekolah', 'Rumah', 'Insurance', 'Coway', 'Lain2'];

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

// ─── Bill Template Modal ───
function BillModal({ show, onClose, allDebts }) {
    const { data, setData, post, processing, reset } = useForm({
        title: '', default_amount: '', category: 'Rumah', assigned_to: 'Abg', debt_id: '',
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('bills.templates.store'), { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Modal show={show} onClose={onClose} title="Tambah Komitmen">
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
                    {processing ? 'Saving...' : 'Tambah Komitmen'}
                </button>
            </form>
        </Modal>
    );
}

// ─── Add Debt Modal ───
function DebtModal({ show, onClose }) {
    const { data, setData, post, processing, reset } = useForm({
        title: '', total_amount: '', type: 'fixed',
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('debts.store'), { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Modal show={show} onClose={onClose} title="Tambah Hutang">
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
                    {processing ? 'Saving...' : 'Simpan Hutang'}
                </button>
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
                    <img src={`/storage/${bill.receipt_path}`} alt="Resit" className="w-full rounded-2xl shadow-sm border border-slate-100" />
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

// ─── Profile View ───
function ProfileView({ user, summary, isHidden }) {
    const totalIncome = summary?.total_income || 0;
    const totalBills = summary?.total_bills || 0;
    const burnRate = totalIncome > 0 ? Math.round((totalBills / totalIncome) * 100) : 0;

    return (
        <div className="p-6 pt-16 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl border-4 border-white uppercase">
                        {user?.name?.substring(0, 3) || 'USR'}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">{user?.name}</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{user?.role === 'admin' ? 'Admin' : 'Member'}</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1 uppercase tracking-tighter">
                        <ShieldCheck size={12}/> Verified
                    </span>
                    <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full border border-green-100 flex items-center gap-1 uppercase tracking-tighter">
                        <Users size={12}/> Family Linked
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Tahunan</p>
                    <p className="text-sm font-black text-slate-800">{formatMoney(totalIncome * 12, isHidden, true)}</p>
                    <p className="text-[8px] text-slate-300 font-bold mt-1 tracking-tighter">ANGGARAN ANNUAL</p>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Burn Rate</p>
                    <p className="text-sm font-black text-red-500">{burnRate}%</p>
                    <p className="text-[8px] text-slate-300 font-bold mt-1 tracking-tighter">PENDAPATAN DIGUNAKAN</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Tetapan</h3>
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                    <div className="p-4 flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl"><Bell size={20}/></div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Notifikasi</p>
                                <p className="text-[10px] text-slate-400 font-medium">Auto-remind setiap 25hb</p>
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
                    SwiftMoney PWA v1.0.0
                </p>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───
export default function Dashboard({ user, summary, my_summary, incomes, my_incomes, categorized_bills, my_bills, active_debts, all_debts, monthYear, needsSetup }) {
    const [isHidden, setIsHidden] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [viewMode, setViewMode] = useState('saya'); // 'saya' or 'keluarga'
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

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
                <BillModal show={showBillModal} onClose={() => setShowBillModal(false)} allDebts={all_debts} />
                <DebtModal show={showDebtModal} onClose={() => setShowDebtModal(false)} />
                <PaymentModal show={showPaymentModal} onClose={() => { setShowPaymentModal(false); setSelectedDebt(null); }} debt={selectedDebt} />
                <HistoryModal show={showHistoryModal} onClose={() => { setShowHistoryModal(false); setSelectedDebt(null); }} debt={selectedDebt} />
                <ReceiptModal show={showReceiptModal} onClose={() => { setShowReceiptModal(false); setSelectedBill(null); }} bill={selectedBill} />

                {activeTab === 'home' ? (
                    <>
                        {/* ─── HEADER ─── */}
                        <div className="bg-indigo-700 pt-10 pb-28 px-6 rounded-b-[48px] shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div>
                                    <h1 className="text-white text-2xl font-bold tracking-tight">SwiftMoney</h1>
                                    <p className="text-indigo-200 text-xs font-medium tracking-wide">{monthLabel} &bull; {isSaya ? user?.name : 'Keluarga'} &bull; RM {Number(s.total_bills).toLocaleString()}</p>
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
                                                        <ChevronRight size={16} className="text-slate-300" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <ProfileView user={user} summary={s} isHidden={isHidden} />
                )}

                {/* ─── Floating Nav ─── */}
                <div className="fixed bottom-6 left-6 right-6 max-w-[calc(448px-3rem)] mx-auto z-50">
                    <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] flex justify-around items-center p-3">
                        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 transition-all ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <Home size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Home</span>
                        </button>
                        <button onClick={() => setShowBillModal(true)} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 -mt-12 active:scale-90 transition-all border-4 border-slate-50">
                            <Plus size={24} strokeWidth={3} />
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
