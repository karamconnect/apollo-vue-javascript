import { usePreferencesStore } from '@/stores/preferences';
import { watch } from 'vue';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import { toMessages } from './messages';

// UI translations (vue-i18n, Composition API: `const { t } = useI18n()` in components, `$t` in templates).
// English is bundled and is the fallback for any missing key; other languages load when chosen.
export const DEFAULT_LOCALE = 'en';

// Each language is shown in its own name, so users can find theirs whatever the current language.
export const LOCALES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
];

const loaders = {
    es: () => import('./locales/es.json'),
    fr: () => import('./locales/fr.json'),
    de: () => import('./locales/de.json')
};

// PrimeVue's own texts (date picker, paginator, aria labels, ...) come from primelocale. PrimeVue ships English.
const primeLoaders = {
    es: () => import('primelocale/es.json'),
    fr: () => import('primelocale/fr.json'),
    de: () => import('primelocale/de.json')
};

// Named formats for `$n(value, 'currency')`; Intl applies each language's conventions.
const numberFormat = {
    currency: { style: 'currency', currency: 'USD' },
    currencyWhole: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
};

export const i18n = createI18n({
    legacy: false,
    locale: DEFAULT_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
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

/** Switches the UI language, loading its messages first. Unknown codes fall back to English. */
export async function setLocale(code) {
    const locale = code in loaders || code === DEFAULT_LOCALE ? code : DEFAULT_LOCALE;

    if (!i18n.global.availableLocales.includes(locale)) {
        const [messages, prime] = await Promise.all([loaders[locale](), primeLoaders[locale]()]);
        i18n.global.setLocaleMessage(locale, messages.default);
        i18n.global.setNumberFormat(locale, numberFormat);
        primeLocales[locale] = prime.default[locale];
    }

    i18n.global.locale.value = locale;
    document.documentElement.lang = locale;
    applyPrimeVueLocale(locale);

    // In the background, so a slow CDN never delays the switch.
    loadPublished(locale);
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
