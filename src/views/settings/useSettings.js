import { reactive } from 'vue';

// Module-level state so values survive navigating between settings sections.
// Replace with API calls once a backend exists.
const settings = reactive({
    profile: {
        firstName: '',
        lastName: '',
        email: '',
        bio: ''
    },
    preferences: {
        language: 'en',
        timezone: 'UTC'
    },
    notifications: {
        email: true,
        push: false,
        digest: true
    }
});

export function useSettings() {
    return { settings };
}
