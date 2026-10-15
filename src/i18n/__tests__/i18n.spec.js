import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, i18n, LOCALES, setLocale } from '..';
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
});
