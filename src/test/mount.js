import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { createMemoryHistory, createRouter } from 'vue-router';

const Blank = { render: () => null };

/**
 * Mounts a component the way the app runs it: Pinia, PrimeVue (unstyled, no theme) and a memory router
 * at `path`. PrimeVue components are auto-registered by unplugin-vue-components (vite.config.mjs).
 * Pass extra routes (e.g. `{ name: 'terms', path: '/terms' }`) so named RouterLinks resolve.
 */
export async function mountWithApp(component, { path = '/', routes = [], ...options } = {}) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [...routes.map((route) => ({ component: Blank, ...route })), { path: '/:pathMatch(.*)*', component: Blank }]
    });

    router.push(path);
    await router.isReady();

    const wrapper = mount(component, {
        ...options,
        global: {
            plugins: [createPinia(), router, [PrimeVue, { theme: 'none' }], ToastService],
            ...options.global
        }
    });

    return { wrapper, router };
}
