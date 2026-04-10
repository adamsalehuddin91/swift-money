import { usePage, router } from '@inertiajs/react';
import translations from '@/lang';

export function useLang() {
    const { language } = usePage().props;
    const lang = language ?? 'ms';
    const dict = translations[lang] ?? translations['ms'];

    const t = (key) => dict[key] ?? key;

    const setLanguage = (newLang) => {
        router.post(route('language.update'), { language: newLang }, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return { t, lang, setLanguage };
}
