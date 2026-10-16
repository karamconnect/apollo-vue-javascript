import { watch } from 'vue';
import { toMessages } from './messages';

// In-context translation with Tolgee (https://tolgee.io), development only: hold Alt and click a text to edit it
// on the Tolgee platform. vue-i18n still renders everything; Tolgee only tags the strings and feeds edits back.
// The API key reaches the browser, so this module is never imported by a production build (see `installI18n`).

/** Wires a running Tolgee instance to the vue-i18n composer. Returns a function that undoes it. */
export function connectTolgee(composer, tolgee) {
    // Invisible characters after each string carry its key, so Tolgee can find it in the page.
    composer.setPostTranslationHandler((translated, key) => (typeof translated === 'string' ? (tolgee.wrap({ key, translation: translated }) ?? translated) : translated));

    // Platform translations (loaded at start, or saved in the editor) replace the bundled ones. Languages
    // vue-i18n hasn't loaded yet are skipped, so `setLocale` still loads their bundled file and PrimeVue texts.
    const sync = ({ value }) => {
        if (value.namespace || !composer.availableLocales.includes(value.language)) return;

        const record = tolgee.getRecord({ language: value.language });
        if (record) composer.mergeLocaleMessage(value.language, toMessages(record.data));
    };
    const subscription = tolgee.on('cache', sync);
    for (const record of tolgee.getAllRecords()) if (record) sync({ value: record });

    const stopWatch = watch(composer.locale, (language) => tolgee.changeLanguage(language), { immediate: true });

    return () => {
        stopWatch();
        subscription.unsubscribe();
        composer.setPostTranslationHandler(null);
    };
}

/** Starts Tolgee when `VITE_APP_TOLGEE_API_KEY` is set. Resolves once strings are tagged; data loads in the background. */
export async function startTolgee(composer, languages) {
    const apiKey = import.meta.env.VITE_APP_TOLGEE_API_KEY;
    if (!apiKey) return;

    const { Tolgee, DevTools } = await import('@tolgee/web');
    const tolgee = Tolgee()
        .use(DevTools())
        .init({
            apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL || undefined,
            apiKey,
            language: composer.locale.value,
            defaultLanguage: 'en',
            availableLanguages: languages
        });

    connectTolgee(composer, tolgee);
    tolgee.run().catch((error) => console.warn('[tolgee] could not load translations from the platform', error));
}
