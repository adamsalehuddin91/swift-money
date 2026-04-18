import { useState, useEffect } from 'react';

const STORAGE_KEY = 'swiftmoney_ios_install_dismissed';

function isIOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    if (!isIOS) return false;
    const isStandalone = window.navigator.standalone === true;
    if (isStandalone) return false; // already installed
    const isChrome  = /CriOS/i.test(ua);
    const isFirefox = /FxiOS/i.test(ua);
    const isIAB     = /FBAN|FBAV|FB_IAB|Instagram|MessengerForiOS/i.test(ua);
    return !isChrome && !isFirefox && !isIAB;
}

export default function IOSInstallGuide() {
    const [show, setShow] = useState(false);
    const [visible, setVisible] = useState(false); // controls slide-up animation

    useEffect(() => {
        if (!isIOSSafari()) return;
        if (localStorage.getItem(STORAGE_KEY)) return;
        // Show after 4s — let user see the app first
        const t = setTimeout(() => {
            setShow(true);
            requestAnimationFrame(() => setVisible(true));
        }, 4000);
        return () => clearTimeout(t);
    }, []);

    const dismiss = (permanent = false) => {
        setVisible(false);
        setTimeout(() => setShow(false), 350);
        if (permanent) localStorage.setItem(STORAGE_KEY, '1');
    };

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => dismiss(false)}
                className="fixed inset-0 z-[999] bg-black/40"
                style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}
            />

            {/* Bottom sheet */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[28px] p-6 pb-10 shadow-2xl"
                style={{
                    transform: visible ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
            >
                {/* Drag handle */}
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <img src="/pwa-192x192.png" alt="SwiftMoney" className="w-12 h-12 rounded-2xl shadow" />
                    <div>
                        <p className="font-black text-slate-800 text-base">Install SwiftMoney</p>
                        <p className="text-xs text-slate-400">Guna seperti app sebenar 📱</p>
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-6">
                    <Step
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                                <polyline points="16 6 12 2 8 6"/>
                                <line x1="12" y1="2" x2="12" y2="15"/>
                            </svg>
                        }
                        label="Tap butang Share"
                        sub="Ikon kotak dengan anak panah ke atas, di bar bawah Safari"
                    />
                    <Step
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        }
                        label='Pilih "Add to Home Screen"'
                        sub="Scroll ke bawah dalam senarai pilihan"
                        highlight
                    />
                    <Step
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        }
                        label='Tap "Add" di atas kanan'
                        sub="SwiftMoney akan appear di Home Screen anda"
                    />
                </div>

                {/* Buttons */}
                <button
                    onClick={() => dismiss(true)}
                    className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition mb-2"
                >
                    Faham, nak install sekarang
                </button>
                <button
                    onClick={() => dismiss(true)}
                    className="w-full text-slate-400 font-medium py-2 text-sm"
                >
                    Jangan tunjuk lagi
                </button>

                {/* Arrow pointing to bottom toolbar */}
                <div className="flex flex-col items-center mt-2 animate-bounce">
                    <p className="text-xs text-indigo-400 font-semibold mb-1">Butang Share ada di bawah ↓</p>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                </div>
            </div>
        </>
    );
}

function Step({ icon, label, sub, highlight }) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-2xl ${highlight ? 'bg-indigo-50' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className={`text-sm font-bold ${highlight ? 'text-indigo-700' : 'text-slate-700'}`}>{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
        </div>
    );
}
