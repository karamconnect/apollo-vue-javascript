import { authErrorMessage } from '@/auth/errors';
import { AUTH_ERRORS } from '@/auth/schemas';
import { PASSWORD_ERRORS } from '@/views/settings/password-schema';
import { EMAIL_ERROR, PHONE_ERROR } from '@/views/settings/profile-schema';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCALE, i18n, loadPublished, LOCALES, setLocale, syncPrimeVueLocale } from '..';
import de from '../locales/de.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

function keys(messages, prefix = '') {
    return Object.entries(messages).flatMap(([key, value]) => (typeof value === 'object' ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`]));
}

describe('i18n', () => {
    afterEach(() => setLocale(DEFAULT_LOCALE));

    it('has every English key in every other language', () => {
        const english = keys(en).sort();

        for (const [code, messages] of Object.entries({ es, fr, de })) {
            expect(keys(messages).sort(), code).toEqual(english);
        }
    });

    it('offers a message file for every listed language', () => {
        expect(LOCALES.map((locale) => locale.code)).toEqual(['en', 'es', 'fr', 'de']);
    });

    it('loads a language on demand and sets <html lang>', async () => {
        await setLocale('es');

        expect(i18n.global.t('nav.settings')).toBe('Ajustes');
        expect(i18n.global.t('today.events', 3)).toBe('3 eventos');
        expect(document.documentElement.lang).toBe('es');
    });

    it('falls back to English for an unknown language', async () => {
        await setLocale('xx');

        expect(i18n.global.locale.value).toBe('en');
        expect(i18n.global.t('nav.settings')).toBe('Settings');
    });

    it('has a message for every validation error the schemas use', () => {
        // Schemas hold message keys, which the unused-keys lint rule can't see; this catches a typo or a deleted key.
        for (const key of [...Object.values(AUTH_ERRORS), ...Object.values(PASSWORD_ERRORS), EMAIL_ERROR, PHONE_ERROR]) {
            expect(i18n.global.te(key, 'en'), key).toBe(true);
        }
    });

    it('translates Better Auth errors by code', async () => {
        expect(authErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Invalid email or password' })).toBe('Invalid email or password.');
        expect(authErrorMessage({ code: 'SOMETHING_NEW', message: 'Server text' }, 'Fallback')).toBe('Fallback');
        expect(authErrorMessage({ message: 'Server text' })).toBe('Something went wrong. Please try again.');

        await setLocale('de');
        expect(authErrorMessage({ code: 'INVALID_OTP' })).toBe('Dieser Code ist nicht richtig. Prüfe ihn und versuche es erneut.');
    });

    it("switches PrimeVue's built-in texts with the language", async () => {
        const config = { locale: { accept: 'Yes', dayNames: ['Sunday'], aria: { close: 'Close', star: '1 star' } } };
        syncPrimeVueLocale({ config: { globalProperties: { $primevue: { config } } } });

        await setLocale('fr');
        expect(config.locale.accept).toBe('Oui');
        expect(config.locale.aria.close).toBe('Fermer');

        await setLocale('en');
        expect(config.locale).toEqual({ accept: 'Yes', dayNames: ['Sunday'], aria: { close: 'Close', star: '1 star' } });
    });

    describe('published translations (Tolgee CDN)', () => {
        afterEach(() => vi.unstubAllGlobals());

        it('layers them over the bundled messages, once per language', async () => {
            const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ 'nav.help': 'Ayuda y soporte', 'nav.admin': '' }) }));
            vi.stubGlobal('fetch', fetch);
            await setLocale('es');

            await loadPublished('es', 'https://cdn.example/abc/');
            await loadPublished('es', 'https://cdn.example/abc/');

            expect(fetch).toHaveBeenCalledOnce();
            expect(fetch).toHaveBeenCalledWith('https://cdn.example/abc/es.json');
            expect(i18n.global.t('nav.help')).toBe('Ayuda y soporte');
            expect(i18n.global.t('nav.settings')).toBe('Ajustes'); // not published: bundled text stays
            expect(i18n.global.t('nav.admin')).not.toBe(''); // empty translations are skipped
        });

        it('keeps the bundled messages when the file is missing or the CDN is unreachable', async () => {
            await setLocale('fr');
            vi.stubGlobal(
                'fetch',
                vi.fn(async () => ({ ok: false }))
            );
            await loadPublished('fr', 'https://cdn.example/abc');
            vi.stubGlobal(
                'fetch',
                vi.fn(async () => Promise.reject(new TypeError('Failed to fetch')))
            );
            await loadPublished('de', 'https://cdn.example/abc');

            expect(i18n.global.t('nav.settings')).toBe('Paramètres');
        });

        it('does nothing without a CDN URL (always the case in development and tests)', async () => {
            const fetch = vi.fn();
            vi.stubGlobal('fetch', fetch);
            await loadPublished('pt');

            expect(fetch).not.toHaveBeenCalled();
        });
    });
});
