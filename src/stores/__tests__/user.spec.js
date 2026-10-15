import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUserStore } from '../user';

describe('user store', () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
    });

    it('starts with an empty profile', () => {
        const user = useUserStore();

        expect(user.profile).toEqual({ firstName: '', lastName: '', email: '', phone: '', bio: '' });
    });

    describe('displayName', () => {
        it('falls back to Guest when the profile is empty', () => {
            expect(useUserStore().displayName).toBe('Guest');
        });

        it('uses the email when there is no name', () => {
            const user = useUserStore();
            user.updateProfile({ email: 'ada@example.com' });

            expect(user.displayName).toBe('ada@example.com');
        });

        it('joins first and last name, skipping blanks', () => {
            const user = useUserStore();

            user.updateProfile({ firstName: 'Ada', email: 'ada@example.com' });
            expect(user.displayName).toBe('Ada');

            user.updateProfile({ lastName: 'Lovelace' });
            expect(user.displayName).toBe('Ada Lovelace');
        });
    });

    it('updateProfile only changes the given fields', () => {
        const user = useUserStore();
        user.updateProfile({ firstName: 'Ada', bio: 'Mathematician' });
        user.updateProfile({ bio: 'Writer' });

        expect(user.profile).toEqual({ firstName: 'Ada', lastName: '', email: '', phone: '', bio: 'Writer' });
    });

    it('persists the profile across store instances', async () => {
        useUserStore().updateProfile({ firstName: 'Ada' });
        await nextTick();

        setActivePinia(createPinia());

        expect(useUserStore().profile.firstName).toBe('Ada');
    });
});
