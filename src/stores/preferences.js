import { acceptHMRUpdate, defineStore } from 'pinia';
import { usePersistedRef } from './persisted';

export const usePreferencesStore = defineStore('preferences', () => {
    const regional = usePersistedRef('preferences.regional', {
        language: 'en',
        timezone: 'UTC'
    });

    const notifications = usePersistedRef('preferences.notifications', {
        email: true,
        push: false,
        digest: true
    });

    function updateRegional(values) {
        Object.assign(regional.value, values);
    }

    function setNotification(channel, enabled) {
        notifications.value[channel] = enabled;
    }

    return { regional, notifications, updateRegional, setNotification };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePreferencesStore, import.meta.hot));
}
