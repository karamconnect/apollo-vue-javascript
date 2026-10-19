import { authClient } from '@/auth/client';
import AppLayout from '@/layout/AppLayout.vue';
import { useLockStore } from '@/stores/lock';
import ErrorPage from '@/views/auth/Error.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createAuthGuard } from './guard';

// Route meta: `requiresAuth`, `guestOnly` and `roles` (e.g. `roles: ['admin']`) — see ./guard.js.
// `title` (browser tab, see ./title.js; defaults to the breadcrumb), `breadcrumb` and `search.title` hold i18n keys (src/i18n/locales). `search: { icon, keywords, title? }` lists the page in the topbar search — see @/search/pages.js.

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: {
                requiresAuth: true
            },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    meta: {
                        breadcrumb: ['nav.dashboard'],
                        search: { icon: 'pi pi-home', keywords: ['home', 'overview', 'sales', 'revenue', 'stats', 'products'] }
                    },
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/settings',
                    component: () => import('@/views/settings/SettingsLayout.vue'),
                    children: [
                        {
                            path: '',
                            name: 'settings',
                            redirect: '/settings/profile'
                        },
                        {
                            path: 'profile',
                            name: 'settings-profile',
                            meta: {
                                breadcrumb: ['nav.settings', 'nav.profile'],
                                search: { icon: 'pi pi-user', keywords: ['name', 'email', 'bio', 'photo', 'avatar', 'picture'] }
                            },
                            component: () => import('@/views/settings/ProfileSettings.vue')
                        },
                        {
                            path: 'account',
                            name: 'settings-account',
                            meta: {
                                breadcrumb: ['nav.settings', 'nav.account'],
                                search: { icon: 'pi pi-lock', keywords: ['password', 'change password', 'security', 'sessions', 'sign out', 'delete account'] }
                            },
                            component: () => import('@/views/settings/AccountSettings.vue')
                        },
                        {
                            path: 'preferences',
                            name: 'settings-preferences',
                            meta: {
                                breadcrumb: ['nav.settings', 'nav.preferences'],
                                search: { icon: 'pi pi-sliders-h', keywords: ['language', 'timezone', 'region', 'locale'] }
                            },
                            component: () => import('@/views/settings/PreferencesSettings.vue')
                        },
                        {
                            path: 'notifications',
                            name: 'settings-notifications',
                            meta: {
                                breadcrumb: ['nav.settings', 'nav.notifications'],
                                search: { icon: 'pi pi-bell', keywords: ['email', 'alerts', 'push', 'weekly digest'] }
                            },
                            component: () => import('@/views/settings/NotificationSettings.vue')
                        },
                        {
                            path: 'appearance',
                            name: 'settings-appearance',
                            meta: {
                                breadcrumb: ['nav.settings', 'nav.appearance'],
                                search: { icon: 'pi pi-palette', keywords: ['theme', 'dark mode', 'light mode', 'colors', 'menu layout'] }
                            },
                            component: () => import('@/views/settings/AppearanceSettings.vue')
                        }
                    ]
                },
                {
                    path: '/help',
                    name: 'help',
                    meta: {
                        breadcrumb: ['nav.help'],
                        search: { icon: 'pi pi-question-circle', keywords: ['support', 'faq', 'contact', 'docs'] }
                    },
                    component: () => import('@/views/Help.vue')
                },
                {
                    path: '/admin',
                    name: 'admin',
                    meta: {
                        breadcrumb: ['nav.admin'],
                        search: { icon: 'pi pi-shield', keywords: ['users', 'roles', 'administration'] },
                        roles: ['admin']
                    },
                    component: () => import('@/views/Admin.vue')
                }
            ]
        },
        {
            path: '/auth',
            children: [
                {
                    path: '',
                    redirect: '/auth/login'
                },
                {
                    path: 'login',
                    name: 'login',
                    meta: { title: 'auth.logIn', guestOnly: true },
                    component: () => import('@/views/auth/Login.vue')
                },
                {
                    path: 'register',
                    name: 'register',
                    meta: { title: 'auth.register.title', guestOnly: true },
                    component: () => import('@/views/auth/Register.vue')
                },
                {
                    path: 'forgot-password',
                    name: 'forgot-password',
                    meta: { title: 'auth.forgot.title', guestOnly: true },
                    component: () => import('@/views/auth/ForgotPassword.vue')
                },
                {
                    path: 'reset-password',
                    name: 'reset-password',
                    meta: { title: 'auth.reset.title', guestOnly: true },
                    component: () => import('@/views/auth/ResetPassword.vue')
                },
                {
                    path: 'verification',
                    name: 'verification',
                    meta: { title: 'auth.verify.title', requiresAuth: true },
                    component: () => import('@/views/auth/Verification.vue')
                },
                {
                    path: 'access',
                    name: 'access-denied',
                    meta: { title: 'status.accessDenied', requiresAuth: true },
                    component: () => import('@/views/auth/Access.vue')
                },
                {
                    path: 'error',
                    name: 'error',
                    meta: { title: 'status.error' },
                    component: ErrorPage
                }
            ]
        },
        {
            path: '/terms',
            name: 'terms',
            meta: {
                title: 'nav.terms',
                search: { title: 'nav.terms', icon: 'pi pi-file', keywords: ['legal', 'terms of service', 'privacy'] }
            },
            component: () => import('@/views/legal/Terms.vue')
        },
        {
            // Signed-out users are sent to login first, so unknown paths don't reveal anything.
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            meta: { title: 'status.notFound', requiresAuth: true },
            component: ErrorPage,
            props: { notFound: true }
        }
    ],
    scrollBehavior() {
        return { left: 0, top: 0 };
    }
});

router.beforeEach(
    createAuthGuard({
        async getUser() {
            const { data } = await authClient.getSession();

            return data?.user ?? null;
        },
        isLocked: () => useLockStore().locked
    })
);

// E.g. a lazy-loaded page that fails to download. The error page is bundled eagerly so it can't fail the same way.
router.onError((error, to) => {
    console.error(error);
    if (to.name !== 'error') router.replace({ name: 'error', query: { error: 'NAVIGATION_FAILED' } });
});

export default router;
