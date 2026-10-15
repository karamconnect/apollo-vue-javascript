import { ref, watch } from 'vue';

const STORAGE_PREFIX = 'app.';

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function load(key, defaults) {
    const fallback = structuredClone(defaults);

    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_PREFIX + key));

        if (isPlainObject(fallback) && isPlainObject(stored)) return { ...fallback, ...stored };
        if (Array.isArray(fallback) && Array.isArray(stored)) return stored;
    } catch {
        // ignore malformed storage and fall back to defaults
    }

    return fallback;
}

function save(key, value) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
        // storage blocked or full: keep working in memory for this session
    }
}

/**
 * A ref backed by localStorage (key `app.<key>`), for use inside setup stores.
 * Stored objects are shallow-merged over `defaults`, so fields added later still get a value.
 * Storage errors never throw: reads fall back to `defaults`, failed writes keep the state in memory only.
 */
export function usePersistedRef(key, defaults) {
    const state = ref(load(key, defaults));

    watch(state, (value) => save(key, value), { deep: true });

    return state;
}
