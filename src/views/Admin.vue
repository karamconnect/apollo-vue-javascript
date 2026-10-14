<script setup>
import { authClient, isMockAuth } from '@/auth/client';
import { computed } from 'vue';

// Example of a role-restricted page: the route has `meta: { roles: ['admin'] }`, so the guard sends
// everyone else to Access Denied. The sidebar entry is hidden for non-admins in AppMenu.vue.
const session = authClient.useSession();
const user = computed(() => session.value.data?.user);
</script>

<template>
    <div class="card flex flex-col gap-6">
        <div class="flex items-center gap-3">
            <h1 class="text-surface-950 dark:text-surface-0 text-2xl font-medium m-0">Admin</h1>
            <Tag value="Admins only" severity="contrast" icon="pi pi-shield" />
        </div>

        <p class="text-surface-600 dark:text-surface-300 leading-normal m-0">
            Only users with the <code>admin</code> role can open this page. Other signed-in users are sent to Access Denied. To restrict another page, add <code>meta: { roles: ['admin'] }</code> to its route; child routes inherit it.
        </p>

        <Message v-if="isMockAuth" severity="info" size="small">Demo mode: sign in with an email starting with <code>admin@</code> (e.g. admin@example.com) to get the admin role.</Message>

        <div v-if="user" class="flex flex-col gap-2">
            <span class="text-surface-500 dark:text-surface-400 text-sm font-medium">Signed in as</span>
            <div class="flex items-center gap-3">
                <span class="text-surface-900 dark:text-surface-0 font-medium">{{ user.email }}</span>
                <Tag :value="user.role" severity="success" />
            </div>
        </div>
    </div>
</template>
