import { describe, expect, it } from 'vitest';
import { createAuthGuard, safeRedirect } from '../guard';

function route(fullPath, ...metas) {
    return { fullPath, matched: metas.map((meta) => ({ meta })) };
}

const START = route('/'); // vue-router's initial location has no matched records
const APP = route('/settings', { requiresAuth: true }, {});

const member = { id: '1', role: 'user' };
const admin = { id: '2', role: 'admin' };

function guard({ user = null, locked = false } = {}) {
    return createAuthGuard({ getUser: async () => user, isLocked: () => locked });
}

describe('auth guard', () => {
    it('lets anyone through routes without auth meta', async () => {
        expect(await guard()(route('/terms', {}), APP)).toBe(true);
    });

    it('sends signed-out users to login, remembering where they were going', async () => {
        expect(await guard()(route('/settings/account?tab=1', { requiresAuth: true }, {}, {}), START)).toEqual({ name: 'login', query: { redirect: '/settings/account?tab=1' } });
    });

    it('drops the redirect when the target is the home page', async () => {
        expect(await guard()(route('/', { requiresAuth: true }, {}), START)).toEqual({ name: 'login', query: {} });
    });

    it('lets signed-in users into protected routes', async () => {
        expect(await guard({ user: member })(route('/settings', { requiresAuth: true }, {}), START)).toBe(true);
    });

    it('keeps signed-in users off guest-only pages', async () => {
        expect(await guard({ user: member })(route('/auth/login', {}, { guestOnly: true }), START)).toEqual({ path: '/' });
    });

    it('lets signed-out users open guest-only pages', async () => {
        expect(await guard()(route('/auth/login', {}, { guestOnly: true }), START)).toBe(true);
    });

    describe('roles', () => {
        const adminPage = route('/admin', { requiresAuth: true }, { roles: ['admin'] });

        it('shows Access Denied to users without an allowed role', async () => {
            expect(await guard({ user: member })(adminPage, APP)).toEqual({ name: 'access-denied', query: { from: '/admin' } });
        });

        it('lets users with an allowed role in', async () => {
            expect(await guard({ user: admin })(adminPage, APP)).toBe(true);
        });

        it('sends signed-out users to login rather than Access Denied', async () => {
            expect(await guard()(route('/admin', { roles: ['admin'] }), START)).toEqual({ name: 'login', query: { redirect: '/admin' } });
        });

        it('applies roles set on a parent route to its children', async () => {
            expect(await guard({ user: member })(route('/admin/users', { requiresAuth: true }, { roles: ['admin'] }, {}), APP)).toMatchObject({ name: 'access-denied' });
        });

        it('lets a child override its parent', async () => {
            expect(await guard({ user: member })(route('/admin/help', { requiresAuth: true }, { roles: ['admin'] }, { roles: ['admin', 'user'] }), APP)).toBe(true);
        });
    });

    describe('lock screen', () => {
        it('blocks in-app navigation while locked', async () => {
            expect(await guard({ user: member, locked: true })(route('/help', { requiresAuth: true }, {}), APP)).toBe(false);
        });

        it('allows the initial navigation (a reload) while locked', async () => {
            expect(await guard({ user: member, locked: true })(APP, START)).toBe(true);
        });
    });
});

describe('safeRedirect', () => {
    it.each([
        ['/settings', '/settings'],
        ['/settings?x=1#y', '/settings?x=1#y'],
        ['//evil.example.com', '/'],
        ['https://evil.example.com', '/'],
        ['', '/'],
        [undefined, '/'],
        [['/a', '/b'], '/']
    ])('%j -> %j', (value, expected) => {
        expect(safeRedirect(value)).toBe(expected);
    });
});
