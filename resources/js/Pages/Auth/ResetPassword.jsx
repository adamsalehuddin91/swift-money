import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });
    const [showPass, setShowPass] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Set Kata Laluan Baru" />

            <div className="mb-6 flex items-center gap-3">
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                    <KeyRound size={18} className="text-indigo-600" />
                </div>
                <div>
                    <p className="font-black text-slate-800">Kata Laluan Baru</p>
                    <p className="text-xs text-slate-500">Masukkan kata laluan baru anda</p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Email (read-only, for context) */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Emel</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 text-slate-500 focus:outline-none"
                        autoComplete="username"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* New password */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Kata Laluan Baru</label>
                    <div className="relative">
                        <input
                            type={showPass ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Min. 8 aksara"
                            autoComplete="new-password"
                            autoFocus
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                            required
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Sahkan Kata Laluan</label>
                    <input
                        type={showPass ? 'text' : 'password'}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Ulang kata laluan baru"
                        autoComplete="new-password"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                        required
                    />
                    {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-sm disabled:opacity-60 mt-2"
                >
                    {processing ? 'Menyimpan...' : 'Simpan Kata Laluan Baru'}
                </button>
            </form>
        </GuestLayout>
    );
}
