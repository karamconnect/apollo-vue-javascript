import { useLayoutStore } from '@/stores/layout';
import { mountWithApp } from '@/test/mount';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import AppLayout from '../AppLayout.vue';

const Page = { render: () => null };
const routes = [
    {
        path: '/app',
        children: [
            { path: 'dashboard', name: 'dashboard', component: Page },
            { path: 'help', name: 'help', component: Page },
            {
                path: 'settings',
                name: 'settings',
                component: Page,
                children: [
                    { path: 'profile', name: 'settings-profile', component: Page },
                    { path: 'account', name: 'settings-account', component: Page }
                ]
            },
            { path: 'admin', name: 'admin', component: Page }
        ]
    },
    { path: '/terms', name: 'terms' }
];

describe('AppLayout', () => {
    let wrapper;

    async function mountLayout(path) {
        const result = await mountWithApp(AppLayout, { path, routes, attachTo: document.body });
        wrapper = result.wrapper;
        return result;
    }

    afterEach(() => wrapper?.unmount());

    it('has a skip link to the main content', async () => {
        await mountLayout('/app/dashboard');

        const skip = wrapper.find('a.skip-link');
        await skip.trigger('click');

        expect(skip.attributes('href')).toBe('#main-content');
        expect(document.activeElement).toBe(wrapper.find('main#main-content').element);
    });

    it('moves focus to the content after going to another page, but not between sections of one page', async () => {
        const { router } = await mountLayout('/app/settings/profile');
        const main = wrapper.find('main').element;

        await router.push('/app/settings/account');
        await flushPromises();
        expect(document.activeElement).not.toBe(main);

        await router.push('/app/help');
        await flushPromises();
        expect(document.activeElement).toBe(main);
    });

    it('closes the mobile menu with Escape and returns focus to the menu button', async () => {
        await mountLayout('/app/dashboard');
        const layout = useLayoutStore();
        layout.ui.mobileMenuActive = true;
        await flushPromises();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flushPromises();

        expect(layout.ui.mobileMenuActive).toBe(false);
        expect(document.activeElement).toBe(wrapper.find('.topbar-menubutton').element);
    });
});
