import { useStorage } from '@vueuse/core';

const STORAGE_PREFIX = 'app.';

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Stored objects are shallow-merged over the defaults so fields added later still get a value;
// a stored value of the wrong shape (or malformed JSON) is ignored.
function mergeStored(stored, defaults) {
    if (isPlainObject(defaults) && isPlainObject(stored)) return { ...defaults, ...stored };
    if (Array.isArray(defaults) && Array.isArray(stored)) return stored;

    return defaults;
}

const tolerantJson = {
    read(raw) {
        try {
            return JSON.parse(raw);
        } catch {
            return undefined;
        }
    },
    write: (value) => JSON.stringify(value)
};

/**
 * A ref backed by localStorage (key `app.<key>`), for use inside setup stores. Built on VueUse's
 * `useStorage`, so it also follows changes made in other tabs (e.g. locking the app).
 * Storage errors never throw: reads fall back to `defaults`, failed writes keep the state in memory only.
 */
export function usePersistedRef(key, defaults) {
    // Storage is left undefined so useStorage looks up localStorage itself, inside its try/catch: merely reading
    // `window.localStorage` throws a SecurityError when site data is blocked.
    return useStorage(STORAGE_PREFIX + key, structuredClone(defaults), undefined, {
        writeDefaults: false,
        mergeDefaults: mergeStored,
        serializer: tolerantJson,
        onError: () => {} // storage blocked or full: keep working in memory for this session
    });
}
