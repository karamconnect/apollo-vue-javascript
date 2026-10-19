import { i18n, setLocale } from '@/i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { installPageTitle, pageTitle } from '../title';

const t = (key) => `<${key}>`;

describe('page titles', () => {
    afterEach(() => setLocale('en'));

    it('names the page, most specific part first, then the app', () => {
        expect(pageTitle({ meta: { breadcrumb: ['nav.settings', 'nav.profile'] } }, t)).toBe('<nav.profile> – <nav.settings> · Apollo');
        expect(pageTitle({ meta: { title: 'auth.logIn', breadcrumb: ['ignored'] } }, t)).toBe('<auth.logIn> · Apollo');
        expect(pageTitle({ meta: {} }, t)).toBe('Apollo');
    });

    it('follows navigation and the language', async () => {
        const Blank = { render: () => null };
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', component: Blank, meta: { breadcrumb: ['nav.dashboard'] } },
                { path: '/settings', component: Blank, meta: { breadcrumb: ['nav.settings', 'nav.profile'] } }
            ]
        });
        installPageTitle(router, i18n);

        await router.push('/');
        expect(document.title).toBe('Dashboard · Apollo');

        await router.push('/settings');
        expect(document.title).toBe('Profile – Settings · Apollo');

        await setLocale('es');
        await nextTick();
        expect(document.title).toBe('Perfil – Ajustes · Apollo');
    });
});
