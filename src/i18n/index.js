import { usePreferencesStore } from '@/stores/preferences';
import { watch } from 'vue';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';

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

export const i18n = createI18n({
    legacy: false,
    locale: DEFAULT_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
    messages: { en }
});

/** Switches the UI language, loading its messages first. Unknown codes fall back to English. */
export async function setLocale(code) {
    const locale = code in loaders || code === DEFAULT_LOCALE ? code : DEFAULT_LOCALE;

    if (!i18n.global.availableLocales.includes(locale)) {
        i18n.global.setLocaleMessage(locale, (await loaders[locale]()).default);
    }

    i18n.global.locale.value = locale;
    document.documentElement.lang = locale;
}

/** Installs vue-i18n and keeps it on the language saved in Settings > Preferences. Call after Pinia. */
export function installI18n(app) {
    app.use(i18n);

    const preferences = usePreferencesStore();

    return new Promise((resolve) => {
        watch(
            () => preferences.regional.language,
            (code) => setLocale(code).then(resolve, resolve),
            { immediate: true }
        );
    });
}
