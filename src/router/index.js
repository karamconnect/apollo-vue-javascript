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
                    name: 'settings',
                    meta: {
                        breadcrumb: ['Settings']
                    },
                    component: () => import('@/views/Settings.vue')
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
