import { useState, useEffect } from 'react';

function detect() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    // Facebook, Instagram, Messenger, TikTok, Twitter in-app browsers
    const isIAB =
        /FBAN|FBAV|FB_IAB|Instagram|MessengerForiOS|musical_ly|BytedanceWebview|TwitterAndroid|TwitteriPhone/i.test(ua) ||
        // Generic WebView detection
        (/wv/.test(ua) && isAndroid);

    return { isIAB, isIOS, isAndroid };
}

export default function BrowserGate() {
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const { isIAB, isIOS } = detect();
        if (isIAB) {
            setIsIOS(isIOS);
            setShow(true);
        }
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6"
            style={{ background: 'rgba(15,12,41,0.97)', backdropFilter: 'blur(8px)' }}>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>

            <h2 className="text-white text-xl font-black text-center mb-2">
                Sila Buka dalam {isIOS ? 'Safari' : 'Chrome'}
            </h2>

            <p className="text-slate-400 text-sm text-center mb-7 leading-relaxed">
                Anda sedang menggunakan browser dalam Facebook.{'\n'}
                SwiftMoney perlu dibuka dalam browser biasa untuk berfungsi dengan betul.
            </p>

            {/* Steps */}
            <div className="w-full max-w-xs space-y-3 mb-7">
                {isIOS ? (
                    <>
                        <Step n={1} text='Tap butang "···" di bahagian bawah kanan' />
                        <Step n={2} text='Pilih "Open in Safari"' highlight />
                        <Step n={3} text='Login atau daftar dalam Safari' />
                    </>
                ) : (
                    <>
                        <Step n={1} text='Tap butang "⋮" di bahagian atas kanan' />
                        <Step n={2} text='Pilih "Open in external browser"' highlight />
                        <Step n={3} text='Login atau daftar dalam Chrome' />
                    </>
                )}
            </div>

            {/* URL copy hint */}
            <div className="w-full max-w-xs bg-white/10 rounded-2xl p-3 text-center">
                <p className="text-slate-400 text-xs mb-1">Atau salin URL ini:</p>
                <p className="text-indigo-300 font-bold text-sm select-all">money.swiftapps.my</p>
            </div>

            {/* Arrow indicator for iOS pointing to bottom-right */}
            {isIOS && (
                <div className="absolute bottom-8 right-6 flex flex-col items-center gap-1 animate-bounce">
                    <p className="text-orange-400 text-xs font-bold">Tap di sini</p>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2.5">
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                </div>
            )}

            {/* Arrow indicator for Android pointing to top-right */}
            {!isIOS && (
                <div className="absolute top-8 right-6 flex flex-col items-center gap-1 animate-bounce">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2.5">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                    <p className="text-orange-400 text-xs font-bold">Tap di sini</p>
                </div>
            )}
        </div>
    );
}

function Step({ n, text, highlight }) {
    return (
        <div className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black mt-0.5 ${highlight ? 'bg-indigo-500 text-white' : 'bg-white/15 text-slate-300'}`}>
                {n}
            </div>
            <p className={`text-sm leading-snug ${highlight ? 'text-white font-semibold' : 'text-slate-300'}`}>
                {text}
            </p>
        </div>
    );
}
