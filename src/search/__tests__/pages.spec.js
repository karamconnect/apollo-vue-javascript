import { describe, expect, it } from 'vitest';
import { buildPageIndex, searchPages } from '../pages';

const routes = [
    { name: 'dashboard', meta: { breadcrumb: ['Dashboard'], search: { icon: 'pi pi-home', keywords: ['overview'] } } },
    { name: 'settings-account', meta: { breadcrumb: ['Settings', 'Account'], search: { keywords: ['password', 'delete account'] } } },
    { name: 'settings-appearance', meta: { breadcrumb: ['Settings', 'Appearance'], search: { keywords: ['theme', 'dark mode'] } } },
    { name: 'admin', meta: { breadcrumb: ['Admin'], roles: ['admin'], search: { keywords: ['users'] } } },
    { name: 'terms', meta: { search: { title: 'Terms and Conditions', keywords: ['legal'] } } },
    { name: 'login', meta: { guestOnly: true } },
    { path: '/settings', meta: { search: { keywords: ['unnamed'] } } }
];

describe('page search', () => {
    it('indexes named routes that opt in with meta.search, titled by breadcrumb', () => {
        const index = buildPageIndex(routes, { role: 'user' });

        expect(index.map((page) => page.name)).toEqual(['dashboard', 'settings-account', 'settings-appearance', 'terms']);
        expect(index[1]).toEqual({ name: 'settings-account', title: 'Settings / Account', icon: 'pi pi-file', keywords: ['password', 'delete account'] });
        expect(index[3].title).toBe('Terms and Conditions');
    });

    it('only includes role-restricted pages for users with the role', () => {
        expect(buildPageIndex(routes, { role: 'admin' }).some((page) => page.name === 'admin')).toBe(true);
        expect(buildPageIndex(routes, null).some((page) => page.name === 'admin')).toBe(false);
    });

    it('matches keywords and tolerates typos', () => {
        const index = buildPageIndex(routes, { role: 'user' });

        expect(searchPages(index, 'dark mode')[0].name).toBe('settings-appearance');
        expect(searchPages(index, 'pasword')[0].name).toBe('settings-account');
        expect(searchPages(index, 'apperance')[0].name).toBe('settings-appearance');
    });

    it('returns nothing for unrelated text', () => {
        expect(searchPages(buildPageIndex(routes, { role: 'user' }), 'zzqx')).toEqual([]);
    });
});
