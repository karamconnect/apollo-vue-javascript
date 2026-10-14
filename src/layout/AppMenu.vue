<script setup>
import { authClient } from '@/auth/client';
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const session = authClient.useSession();

// Hiding an item is cosmetic; the route's `meta.roles` is what keeps others out.
const model = computed(() => [
    {
        label: 'Menu',
        icon: 'pi pi-home',
        path: '/menu',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/'
            },
            {
                label: 'Settings',
                icon: 'pi pi-fw pi-cog',
                to: '/settings'
            },
            {
                label: 'Help',
                icon: 'pi pi-fw pi-question-circle',
                to: '/help'
            },
            {
                label: 'Admin',
                icon: 'pi pi-fw pi-shield',
                to: '/admin',
                visible: session.value.data?.user.role === 'admin'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, index) in model" :key="item.label + '_' + (item.to || item.path || index)">
            <AppMenuItem v-if="!item.separator" :item="item" :index="index" root />

            <li v-else class="menu-separator" />
        </template>
    </ul>
</template>
