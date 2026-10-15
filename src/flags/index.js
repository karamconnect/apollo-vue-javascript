import flagsmith from '@flagsmith/flagsmith';
import { useFlagsmith } from 'flagsmith-vue';

// Feature flags via Flagsmith (https://www.flagsmith.com) and flagsmith-vue (installed by `installFlags` in main.js).
// Read flags in components with `useFlags(['flag_name'])` from 'flagsmith-vue'.
// Without VITE_FLAGSMITH_ENVIRONMENT_ID nothing is fetched and every flag keeps its default below.
const ENVIRONMENT_ID = import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID;

export const isFlagsmithConnected = Boolean(ENVIRONMENT_ID);

/** Every flag the app reads, with the value used offline or before Flagsmith responds. Add new flags here. */
export const DEFAULT_FLAGS = {
    // Settings > Profile > Photo (Filestack upload).
    profile_photo_upload: { enabled: true, value: null }
};

const flagsmithOptions = {
    environmentID: ENVIRONMENT_ID || 'local',
    defaultFlags: DEFAULT_FLAGS,
    preventFetch: !isFlagsmithConnected,
    cacheFlags: isFlagsmithConnected
};

/** Starts Flagsmith and provides it to the app, so components can call `useFlags`. */
export function installFlags(app) {
    const { flags } = useFlagsmith(flagsmithOptions, flagsmith, app);

    // The SDK only publishes flags after a fetch (or a cache hit), so show the defaults until then;
    // offline (no environment ID) nothing is ever fetched and the defaults stay.
    flags.value ??= { ...DEFAULT_FLAGS };
}

/** Ties flags to the signed-in user (for per-user / per-role targeting in Flagsmith), or resets to anonymous. */
export function identifyFlagsUser(user) {
    if (!isFlagsmithConnected) return;

    if (user) flagsmith.identify(user.id, { role: user.role ?? 'user' });
    else flagsmith.logout();
}
