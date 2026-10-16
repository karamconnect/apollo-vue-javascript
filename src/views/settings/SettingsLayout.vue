<script setup>
const menuItems = [
    { label: 'nav.profile', icon: 'pi pi-user', to: '/settings/profile' },
    { label: 'nav.account', icon: 'pi pi-lock', to: '/settings/account' },
    { label: 'nav.preferences', icon: 'pi pi-sliders-h', to: '/settings/preferences' },
    { label: 'nav.notifications', icon: 'pi pi-bell', to: '/settings/notifications' },
    { label: 'nav.appearance', icon: 'pi pi-palette', to: '/settings/appearance' }
];
</script>

<template>
    <div class="card p-0! overflow-hidden flex flex-col lg:flex-row">
        <nav class="lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-surface-200 dark:border-surface-700" :aria-label="$t('nav.settings')">
            <div class="px-4 sm:px-6 py-5 border-b border-surface-200 dark:border-surface-700">
                <h1 class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7 m-0">{{ $t('nav.settings') }}</h1>
            </div>

            <ul class="list-none m-0 p-4 lg:p-6 flex lg:flex-col gap-2 overflow-x-auto">
                <li v-for="item in menuItems" :key="item.to">
                    <router-link v-slot="{ href, navigate, isActive }" :to="item.to" custom>
                        <a
                            :href="href"
                            :aria-current="isActive ? 'page' : undefined"
                            :class="[
                                'px-4 lg:pl-3 lg:pr-2 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-contrast font-medium shadow-sm'
                                    : 'text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 lg:bg-transparent lg:dark:bg-transparent hover:bg-surface-200 dark:hover:bg-surface-700'
                            ]"
                            @click="navigate"
                        >
                            <i :class="item.icon"></i>
                            <span>{{ $t(item.label) }}</span>
                        </a>
                    </router-link>
                </li>
            </ul>
        </nav>

        <div class="flex-1 min-w-0">
            <router-view />
        </div>
    </div>
</template>
