import { mountWithApp } from '@/test/mount';
import { describe, expect, it } from 'vitest';
import ErrorPage from '../Error.vue';

describe('Error page', () => {
    it('shows Not Found for unknown paths', async () => {
        const { wrapper } = await mountWithApp(ErrorPage, { path: '/nope', props: { notFound: true } });

        expect(wrapper.get('h1').text()).toBe('Not Found');
        expect(wrapper.text()).toContain("doesn't exist");
    });

    it('turns an ?error= code into a readable reason', async () => {
        const { wrapper } = await mountWithApp(ErrorPage, { path: '/auth/error?error=INVALID_TOKEN' });

        expect(wrapper.get('h1').text()).toBe('Error');
        expect(wrapper.text()).toContain('Something went wrong (invalid token).');
    });

    it('links back to the dashboard', async () => {
        const { wrapper } = await mountWithApp(ErrorPage, { path: '/auth/error' });

        expect(wrapper.text()).toContain('Something went wrong!');
        expect(wrapper.get('a').attributes('href')).toBe('/');
    });
});
