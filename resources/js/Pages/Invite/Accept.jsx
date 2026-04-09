import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

export default function Accept({ family_name, google_url }) {
    return (
        <>
            <Head title="Jemputan Keluarga" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-[32px] p-8 shadow-xl max-w-sm w-full text-center space-y-6">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Users size={32} className="text-indigo-600" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Jemputan Diterima</h1>
                        <p className="text-slate-500 text-sm mt-2">
                            Kamu dijemput untuk join keluarga
                        </p>
                        <p className="text-indigo-700 font-bold text-lg mt-1">{family_name}</p>
                    </div>

                    <p className="text-slate-400 text-xs">
                        Log masuk dengan Google untuk mula tracking perbelanjaan bersama.
                    </p>

                    <a
                        href={google_url}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" opacity=".9"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".9"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".9"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".9"/>
                        </svg>
                        Teruskan dengan Google
                    </a>
                </div>
            </div>
        </>
    );
}
