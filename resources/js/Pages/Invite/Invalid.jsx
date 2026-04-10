import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useLang } from '@/hooks/useLang';

export default function Invalid() {
    const { t } = useLang();

    return (
        <>
            <Head title={t('invite.invalid')} />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-[32px] p-8 shadow-xl max-w-sm w-full text-center space-y-6">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800">{t('invite.invalid')}</h1>
                        <p className="text-slate-500 text-sm mt-2">{t('invite.expired')}</p>
                    </div>
                    <Link
                        href="/login"
                        className="block w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                        {t('common.back')} {t('auth.login')}
                    </Link>
                </div>
            </div>
        </>
    );
}
