import { effectScope, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePersistedRef } from '../persisted';

describe('usePersistedRef', () => {
    let scope;

    function create(key, defaults) {
        return scope.run(() => usePersistedRef(key, defaults));
    }

    beforeEach(() => {
        localStorage.clear();
        scope = effectScope();
    });

    afterEach(() => {
        scope.stop();
        vi.restoreAllMocks();
    });

    it('starts from a copy of the defaults when nothing is stored', () => {
        const defaults = { theme: 'light', nested: { a: 1 } };
        const state = create('prefs', defaults);

        state.value.nested.a = 2;

        expect(state.value).toEqual({ theme: 'light', nested: { a: 2 } });
        expect(defaults.nested.a).toBe(1);
    });

    it('merges a stored object over the defaults so new fields get a value', () => {
        localStorage.setItem('app.prefs', JSON.stringify({ theme: 'dark' }));

        const state = create('prefs', { theme: 'light', fontSize: 14 });

        expect(state.value).toEqual({ theme: 'dark', fontSize: 14 });
    });

    it('uses a stored array as-is', () => {
        localStorage.setItem('app.list', JSON.stringify([3]));

        expect(create('list', [1, 2]).value).toEqual([3]);
    });

    it('falls back to defaults when the stored value has the wrong shape', () => {
        localStorage.setItem('app.list', JSON.stringify({ not: 'an array' }));
        localStorage.setItem('app.prefs', JSON.stringify(['not', 'an object']));

        expect(create('list', [1, 2]).value).toEqual([1, 2]);
        expect(create('prefs', { theme: 'light' }).value).toEqual({ theme: 'light' });
    });

    it('falls back to defaults when the stored value is malformed JSON', () => {
        localStorage.setItem('app.prefs', '{not json');

        expect(create('prefs', { theme: 'light' }).value).toEqual({ theme: 'light' });
    });

    it('writes deep changes back to localStorage under the app. prefix', async () => {
        const state = create('prefs', { theme: 'light', nested: { a: 1 } });

        state.value.nested.a = 5;
        await nextTick();

        expect(JSON.parse(localStorage.getItem('app.prefs'))).toEqual({ theme: 'light', nested: { a: 5 } });
    });

    it('does not write to localStorage until something changes', async () => {
        create('prefs', { theme: 'light' });
        await nextTick();

        expect(localStorage.getItem('app.prefs')).toBeNull();
    });

    it('keeps working in memory when localStorage refuses the write', async () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('Quota exceeded', 'QuotaExceededError');
        });
        const state = create('prefs', { theme: 'light' });

        state.value.theme = 'dark';
        await nextTick();

        expect(state.value.theme).toBe('dark');
    });

    it('follows changes made in another tab', async () => {
        const state = create('lock', { locked: false });
        const newValue = JSON.stringify({ locked: true });

        localStorage.setItem('app.lock', newValue);
        window.dispatchEvent(new StorageEvent('storage', { key: 'app.lock', newValue, storageArea: localStorage }));
        await nextTick();

        expect(state.value.locked).toBe(true);
    });

    // Regression: localStorage was read before useStorage's error handling, so blocked site data broke startup.
    it('works in memory when reading localStorage itself throws', () => {
        const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() {
                throw new DOMException('Access is denied for this document.', 'SecurityError');
            }
        });

        try {
            const state = create('blocked', { a: 1 });
            state.value.a = 2;
            expect(state.value).toEqual({ a: 2 });
        } finally {
            Object.defineProperty(window, 'localStorage', original);
        }
    });
});
