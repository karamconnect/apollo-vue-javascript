import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePreferencesStore } from '../preferences';

describe('preferences store', () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
    });

    it('has sensible defaults', () => {
        const preferences = usePreferencesStore();

        expect(preferences.regional).toEqual({ language: 'en', timezone: 'UTC' });
        expect(preferences.notifications).toEqual({ email: true, push: false, digest: true });
    });

    it('updateRegional changes only the given fields', () => {
        const preferences = usePreferencesStore();
        preferences.updateRegional({ timezone: 'Europe/Berlin' });

        expect(preferences.regional).toEqual({ language: 'en', timezone: 'Europe/Berlin' });
    });

    it('setNotification toggles a single channel', () => {
        const preferences = usePreferencesStore();
        preferences.setNotification('push', true);
        preferences.setNotification('digest', false);

        expect(preferences.notifications).toEqual({ email: true, push: true, digest: false });
    });

    it('persists regional and notification settings separately', async () => {
        const preferences = usePreferencesStore();
        preferences.updateRegional({ language: 'fr' });
        preferences.setNotification('push', true);
        await nextTick();

        expect(JSON.parse(localStorage.getItem('app.preferences.regional')).language).toBe('fr');
        expect(JSON.parse(localStorage.getItem('app.preferences.notifications')).push).toBe(true);

        setActivePinia(createPinia());
        const reloaded = usePreferencesStore();

        expect(reloaded.regional.language).toBe('fr');
        expect(reloaded.notifications.push).toBe(true);
    });
});
