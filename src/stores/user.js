import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed } from 'vue';
import { usePersistedRef } from './persisted';

// Profile is kept in localStorage until there is a backend to load it from.
export const useUserStore = defineStore('user', () => {
    const profile = usePersistedRef('user.profile', {
        firstName: '',
        lastName: '',
        email: '',
        phone: '', // E.164, e.g. +14155550123
        bio: ''
    });

    const displayName = computed(() => [profile.value.firstName, profile.value.lastName].filter(Boolean).join(' ') || profile.value.email || 'Guest');

    function updateProfile(values) {
        Object.assign(profile.value, values);
    }

    return { profile, displayName, updateProfile };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
