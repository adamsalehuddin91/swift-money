import { useState, useEffect } from 'react';
import { Bell, BellRing, Loader2 } from 'lucide-react';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}

// Register our own root-scoped SW for push, then wait until it's active.
async function getPushReg() {
    const reg = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
    if (reg.active) return reg;
    await new Promise((resolve) => {
        const sw = reg.installing || reg.waiting;
        if (!sw) return resolve();
        sw.addEventListener('statechange', () => sw.state === 'activated' && resolve());
    });
    return reg;
}

export default function PushToggle() {
    const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!supported) return;
        getPushReg()
            .then((reg) => reg.pushManager.getSubscription())
            .then((sub) => setEnabled(!!sub))
            .catch(() => {});
    }, [supported]);

    const enable = async () => {
        setBusy(true);
        try {
            const perm = await Notification.requestPermission();
            if (perm !== 'granted') return;
            const key = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!key) throw new Error('VITE_VAPID_PUBLIC_KEY tidak di-set (build variable)');
            const reg = await getPushReg();
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(key),
            });
            await window.axios.post(route('push.subscribe'), sub.toJSON());
            setEnabled(true);
        } catch (e) {
            console.error('Push subscribe failed', e);
            alert('Gagal hidupkan peringatan: ' + (e?.message || e));
        } finally {
            setBusy(false);
        }
    };

    const disable = async () => {
        setBusy(true);
        try {
            const reg = await getPushReg();
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await window.axios.post(route('push.unsubscribe'), { endpoint: sub.endpoint });
                await sub.unsubscribe();
            }
            setEnabled(false);
        } catch (e) {
            console.error('Push unsubscribe failed', e);
        } finally {
            setBusy(false);
        }
    };

    if (!supported) return null;

    return (
        <button
            onClick={enabled ? disable : enable}
            disabled={busy}
            className="w-full flex items-center justify-between p-4 border-b border-white/10 active:bg-white/5 transition-colors disabled:opacity-60"
        >
            <div className="flex items-center gap-3">
                <span className={`grid place-items-center w-9 h-9 rounded-full border ${enabled ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-white/[0.06] border-white/10 text-slate-400'}`}>
                    {busy ? <Loader2 size={16} className="animate-spin" /> : enabled ? <BellRing size={16} /> : <Bell size={16} />}
                </span>
                <div className="text-left">
                    <p className="text-sm font-bold text-slate-100">Peringatan Bil</p>
                    <p className="text-[11px] text-slate-400">{enabled ? 'Notifikasi dihidupkan' : 'Hidupkan push notification due-date'}</p>
                </div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg ${enabled ? 'bg-gold text-ink' : 'luxe-chip'}`}>
                {enabled ? 'On' : 'Off'}
            </span>
        </button>
    );
}
