<script setup>
import { authClient, isMockAuth } from '@/auth/client';
import { computed } from 'vue';

// Example of a role-restricted page: the route has `meta: { roles: ['admin'] }`, so the guard sends
// everyone else to Access Denied. The sidebar entry is hidden for non-admins in AppMenu.vue.
const session = authClient.useSession();
const user = computed(() => session.value.data?.user);

// Code samples shown in the text (not translated).
const ROLE = 'admin';
const ROUTE_META = "meta: { roles: ['admin'] }";
const ADMIN_PREFIX = 'admin@';
const ADMIN_EXAMPLE = 'admin@example.com';
</script>

<template>
    <div class="card flex flex-col gap-6">
        <div class="flex items-center gap-3">
            <h1 class="text-surface-950 dark:text-surface-0 text-2xl font-medium m-0">{{ $t('nav.admin') }}</h1>
            <Tag :value="$t('admin.adminsOnly')" severity="contrast" icon="pi pi-shield" />
        </div>

        <i18n-t keypath="admin.intro" tag="p" class="text-surface-600 dark:text-surface-300 leading-normal m-0" scope="global">
            <template #role>
                <code>{{ ROLE }}</code>
            </template>
            <template #meta>
                <code>{{ ROUTE_META }}</code>
            </template>
        </i18n-t>

        <Message v-if="isMockAuth" severity="info" size="small">
            <i18n-t keypath="admin.demo" scope="global">
                <template #prefix>
                    <code>{{ ADMIN_PREFIX }}</code>
                </template>
                <template #example>{{ ADMIN_EXAMPLE }}</template>
            </i18n-t>
        </Message>

        <div v-if="user" class="flex flex-col gap-2">
            <span class="text-surface-500 dark:text-surface-400 text-sm font-medium">{{ $t('admin.signedInAs') }}</span>
            <div class="flex items-center gap-3">
                <span class="text-surface-900 dark:text-surface-0 font-medium">{{ user.email }}</span>
                <Tag :value="user.role" severity="success" />
            </div>
        </div>
    </div>
</template>
