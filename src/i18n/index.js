import { usePreferencesStore } from '@/stores/preferences';
import { watch } from 'vue';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import { toMessages } from './messages';

// UI translations (vue-i18n, Composition API: `const { t } = useI18n()` in components, `$t` in templates).
// English is bundled and is the fallback for any missing key; other languages load when chosen.
export const DEFAULT_LOCALE = 'en';

// Each language is shown in its own name, so users can find theirs whatever the current language.
// `prime` is the primelocale file with PrimeVue's own texts (date picker, paginator, aria labels, ...); PrimeVue ships
// English. Regional variants (ar-DZ, ar-SY) only hold the messages that differ and fall back to their base language;
// their region still matters for Intl dates and numbers.
export const LOCALES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español', prime: () => import('primelocale/es.json') },
    { code: 'fr', name: 'Français', prime: () => import('primelocale/fr.json') },
    { code: 'de', name: 'Deutsch', prime: () => import('primelocale/de.json') },
    { code: 'pt', name: 'Português', prime: () => import('primelocale/pt.json') },
    { code: 'ar', name: 'العربية', prime: () => import('primelocale/ar.json') },
    { code: 'ar-DZ', name: 'العربية (الجزائر)', prime: () => import('primelocale/ar.json') },
    { code: 'ar-SY', name: 'العربية (سوريا)', prime: () => import('primelocale/ar.json') },
    { code: 'bn', name: 'বাংলা', prime: () => import('primelocale/bn.json') },
    { code: 'hi', name: 'हिन्दी', prime: () => import('primelocale/hi.json') },
    { code: 'zh', name: '中文', prime: () => import('primelocale/zh-CN.json') }
];

const RTL_LANGUAGES = ['ar'];

/** Base language of a regional code (`ar-DZ` -> `ar`), or undefined when there is none. */
const baseOf = (code) => (code.includes('-') ? code.split('-')[0] : undefined);

// Message files other than English, loaded when chosen (src/i18n/locales/<code>.json).
const loaders = Object.fromEntries(Object.entries(import.meta.glob(['./locales/*.json', '!./locales/en.json'])).map(([path, load]) => [path.match(/([\w-]+)\.json$/)[1], load]));

// Named formats for `$n(value, 'currency')`; Intl applies each language's conventions.
const numberFormat = {
    currency: { style: 'currency', currency: 'USD' },
    currencyWhole: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
};

export const i18n = createI18n({
    legacy: false,
    locale: DEFAULT_LOCALE,
    // Regional variants fall back to their base language, everything to English.
    fallbackLocale: { ...Object.fromEntries(LOCALES.filter((l) => baseOf(l.code)).map((l) => [l.code, [baseOf(l.code), DEFAULT_LOCALE]])), default: [DEFAULT_LOCALE] },
    messages: { en },
    numberFormats: { en: numberFormat }
});

const primeLocales = {};
let primeVueConfig = null;

function applyPrimeVueLocale(locale) {
    if (!primeVueConfig) return;

    const english = primeLocales[DEFAULT_LOCALE];
    const translated = primeLocales[locale] ?? {};
    // Merged over English, so keys newer than the primelocale release still have a text.
    primeVueConfig.locale = { ...english, ...translated, aria: { ...english.aria, ...translated.aria } };
}

// Translations published on the Tolgee CDN (Content Delivery), layered over the bundled files in production so
// reviewed texts go live without a deploy. The bundled files stay the baseline: they cover keys not published yet,
// and the app still works when the CDN is slow or unreachable. In development, src/i18n/tolgee.js does this live.
const PUBLISHED_URL = import.meta.env.DEV ? undefined : import.meta.env.VITE_TOLGEE_CDN_URL;
const published = new Set();

/** Fetches `<baseUrl>/<code>.json` once and merges it over the loaded messages. Missing files and errors are ignored. */
export async function loadPublished(code, baseUrl = PUBLISHED_URL) {
    if (!baseUrl || published.has(code)) return;
    published.add(code);

    try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/${code}.json`);
        if (response.ok) i18n.global.mergeLocaleMessage(code, toMessages(await response.json()));
    } catch {
        // Offline or blocked: the bundled texts stay.
    }
}

async function loadLocale(code) {
    if (i18n.global.availableLocales.includes(code)) return;

    const prime = LOCALES.find((l) => l.code === code).prime;
    const [messages, primeFile] = await Promise.all([loaders[code](), prime()]);
    i18n.global.setLocaleMessage(code, messages.default);
    i18n.global.setNumberFormat(code, numberFormat);
    primeLocales[code] = Object.values(primeFile.default)[0];
}

/** Switches the UI language, loading its messages first (and its base language's). Unknown codes fall back to English. */
let latestRequest = 0;

export async function setLocale(code) {
    const locale = code in loaders ? code : DEFAULT_LOCALE;
    const base = baseOf(locale);
    const request = ++latestRequest;

    if (locale !== DEFAULT_LOCALE) await Promise.all([loadLocale(locale), base && loadLocale(base)]);

    // A newer call was made while this language was loading; that call decides the language.
    if (request !== latestRequest) return;

    i18n.global.locale.value = locale;
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LANGUAGES.includes(base ?? locale) ? 'rtl' : 'ltr';
    applyPrimeVueLocale(locale);

    // In the background, so a slow CDN never delays the switch. Variants also refresh their base language.
    for (const code of [locale, base]) if (code) loadPublished(code);
}

/** Keeps PrimeVue's built-in texts in the current language. Call right after installing PrimeVue. */
export function syncPrimeVueLocale(app) {
    primeVueConfig = app.config.globalProperties.$primevue.config;
    primeLocales[DEFAULT_LOCALE] = { ...primeVueConfig.locale };
    applyPrimeVueLocale(i18n.global.locale.value);
}

/** Installs vue-i18n and keeps it on the language saved in Settings > Preferences. Call after Pinia. */
export function installI18n(app) {
    app.use(i18n);

    const preferences = usePreferencesStore();

    const ready = new Promise((resolve) => {
        watch(
            () => preferences.regional.language,
            (code) => setLocale(code).then(resolve, resolve),
            { immediate: true }
        );
    });

    // Tolgee in-context editing (src/i18n/tolgee.js). The condition is false in production builds, so the module
    // and the API key are left out of the bundle.
    if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
        const startTolgee = () =>
            import('./tolgee').then((tolgee) =>
                tolgee.startTolgee(
                    i18n.global,
                    LOCALES.map((l) => l.code)
                )
            );
        return ready.then(startTolgee).catch((error) => console.warn('[tolgee]', error));
    }

    return ready;
}
