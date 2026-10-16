/* eslint-disable @intlify/vue-i18n/no-missing-keys -- these tests use their own messages, not the app's */
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { describe, expect, it, vi } from 'vitest';
import { toMessages } from '../messages';
import { connectTolgee } from '../tolgee';

// Stands in for a running Tolgee instance: `wrap` marks strings, `emit` simulates a cache update.
function fakeTolgee(records = {}) {
    const listeners = [];
    return {
        records,
        wrap: ({ key, translation }) => `${translation}[${key}]`,
        on: (event, handler) => {
            listeners.push(handler);
            return { unsubscribe: () => listeners.splice(listeners.indexOf(handler), 1) };
        },
        emit: (value) => listeners.forEach((handler) => handler({ value })),
        getRecord: ({ language }) => records[language],
        getAllRecords: () => Object.values(records),
        changeLanguage: vi.fn()
    };
}

function composer() {
    return createI18n({ legacy: false, locale: 'en', messages: { en: { a: { b: 'Hello {name}', c: 'Bye' } } } }).global;
}

describe('toMessages', () => {
    it('nests flat keys and skips empty translations', () => {
        expect(toMessages({ 'a.b': 'x', 'a.c': '', 'a.d': null, e: 'y' })).toEqual({ a: { b: 'x' }, e: 'y' });
    });
});

describe('connectTolgee', () => {
    it('tags translated strings with their key, and stops when disconnected', () => {
        const i18n = composer();
        const disconnect = connectTolgee(i18n, fakeTolgee());

        expect(i18n.t('a.b', { name: 'Ana' })).toBe('Hello Ana[a.b]');

        disconnect();
        expect(i18n.t('a.b', { name: 'Ana' })).toBe('Hello Ana');
    });

    it('applies platform translations over the bundled ones, keeping keys the platform lacks', () => {
        const i18n = composer();
        const tolgee = fakeTolgee({ en: { language: 'en', namespace: '', data: { 'a.b': 'Hi {name}' } } });
        connectTolgee(i18n, tolgee);

        expect(i18n.t('a.b', { name: 'Ana' })).toBe('Hi Ana[a.b]');
        expect(i18n.t('a.c')).toBe('Bye[a.c]');

        // Saved in the in-context editor.
        tolgee.records.en.data['a.c'] = 'See you';
        tolgee.emit({ language: 'en', namespace: '', key: 'a.c' });
        expect(i18n.t('a.c')).toBe('See you[a.c]');
    });

    it("ignores languages vue-i18n hasn't loaded, so their bundled file still loads", () => {
        const i18n = composer();
        connectTolgee(i18n, fakeTolgee({ es: { language: 'es', namespace: '', data: { 'a.b': 'Hola' } } }));

        expect(i18n.availableLocales).toEqual(['en']);
    });

    it('follows the vue-i18n language', async () => {
        const i18n = composer();
        const tolgee = fakeTolgee();
        connectTolgee(i18n, tolgee);
        expect(tolgee.changeLanguage).toHaveBeenLastCalledWith('en');

        i18n.setLocaleMessage('es', {});
        i18n.locale.value = 'es';
        await nextTick();
        expect(tolgee.changeLanguage).toHaveBeenLastCalledWith('es');
    });
});
