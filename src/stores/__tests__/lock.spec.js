import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { useLockStore } from '../lock';

describe('lock store', () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
    });

    it('starts unlocked', () => {
        expect(useLockStore().locked).toBe(false);
    });

    it('locks and unlocks', () => {
        const lock = useLockStore();

        lock.lock();
        expect(lock.locked).toBe(true);

        lock.unlock();
        expect(lock.locked).toBe(false);
    });

    it('stays locked across reloads', async () => {
        useLockStore().lock();
        await nextTick();

        setActivePinia(createPinia());
        expect(useLockStore().locked).toBe(true);
    });
});
