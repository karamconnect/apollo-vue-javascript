import { mountWithApp } from '@/test/mount';
import { flushPromises } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Register from '../Register.vue';

const routes = [
    { name: 'terms', path: '/terms' },
    { name: 'login', path: '/auth/login' },
    { name: 'verification', path: '/auth/verification' }
];

async function fill(wrapper, values) {
    for (const [name, value] of Object.entries(values)) {
        const input = wrapper.find(`input[name="${name}"]`);
        if (typeof value === 'boolean') await input.setChecked(value);
        else await input.setValue(value);
    }
}

describe('Register page', () => {
    it('opens the Terms and Conditions in a new tab so the form is kept', async () => {
        const { wrapper } = await mountWithApp(Register, { path: '/auth/register', routes });
        const link = wrapper.findAll('a').find((a) => a.text() === 'Terms and Conditions');

        expect(link.attributes('href')).toBe('/terms');
        expect(link.attributes('target')).toBe('_blank');
    });

    // Regression: with z.literal(true) for `terms`, an unticked box aborted parsing and hid this error.
    it('reports a password mismatch even when the terms box is unticked', async () => {
        const { wrapper } = await mountWithApp(Register, { path: '/auth/register', routes });

        await fill(wrapper, { name: 'Ana Test', email: 'ana@example.com', password: 'password123', confirmPassword: 'password124' });
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(wrapper.find('#confirm-password-error').exists()).toBe(true);
        expect(wrapper.find('#terms-error').exists()).toBe(true);
    });
});
