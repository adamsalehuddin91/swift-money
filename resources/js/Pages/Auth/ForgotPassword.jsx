import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Laluan" />

            <div className="mb-6 flex items-center gap-3">
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                    <Mail size={18} className="text-indigo-600" />
                </div>
                <div>
                    <p className="font-black text-slate-800">Lupa Kata Laluan?</p>
                    <p className="text-xs text-slate-500">Link reset akan dihantar ke emel anda</p>
                </div>
            </div>

            {status ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium">
                    ✓ {status}
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Alamat Emel</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="contoh@email.com"
                            autoFocus
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-sm disabled:opacity-60"
                    >
                        {processing ? 'Menghantar...' : 'Hantar Link Reset'}
                    </button>
                </form>
            )}

            <a href={route('login')} className="mt-5 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium">
                <ArrowLeft size={14} /> Balik ke Log Masuk
            </a>
        </GuestLayout>
    );
}
