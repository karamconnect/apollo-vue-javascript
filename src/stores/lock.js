import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed } from 'vue';
import { usePersistedRef } from './persisted';

// Lock screen state. Persisted so a reload doesn't unlock the app.
export const useLockStore = defineStore('lock', () => {
    const state = usePersistedRef('lock', { locked: false });

    const locked = computed(() => state.value.locked);

    function lock() {
        state.value.locked = true;
    }

    function unlock() {
        state.value.locked = false;
    }

    return { state, locked, lock, unlock };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useLockStore, import.meta.hot));
}
