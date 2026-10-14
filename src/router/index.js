import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    meta: {
                        breadcrumb: ['Dashboard']
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
                                breadcrumb: ['Settings', 'Profile']
                            },
                            component: () => import('@/views/settings/ProfileSettings.vue')
                        },
                        {
                            path: 'account',
                            name: 'settings-account',
                            meta: {
                                breadcrumb: ['Settings', 'Account']
                            },
                            component: () => import('@/views/settings/AccountSettings.vue')
                        },
                        {
                            path: 'preferences',
                            name: 'settings-preferences',
                            meta: {
                                breadcrumb: ['Settings', 'Preferences']
                            },
                            component: () => import('@/views/settings/PreferencesSettings.vue')
                        },
                        {
                            path: 'notifications',
                            name: 'settings-notifications',
                            meta: {
                                breadcrumb: ['Settings', 'Notifications']
                            },
                            component: () => import('@/views/settings/NotificationSettings.vue')
                        },
                        {
                            path: 'appearance',
                            name: 'settings-appearance',
                            meta: {
                                breadcrumb: ['Settings', 'Appearance']
                            },
                            component: () => import('@/views/settings/AppearanceSettings.vue')
                        }
                    ]
                },
                {
                    path: '/help',
                    name: 'help',
                    meta: {
                        breadcrumb: ['Help']
                    },
                    component: () => import('@/views/Help.vue')
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/NotFound.vue')
        }
    ],
    scrollBehavior() {
        return { left: 0, top: 0 };
    }
});

export default router;
