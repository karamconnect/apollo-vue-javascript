<script setup>
import { useAvatar } from '@/auth/useAvatar';
import { useLayoutStore } from '@/stores/layout';
import { usePageSearch } from '@/search/usePageSearch';
import { useLockStore } from '@/stores/lock';
import { shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import AppBreadcrumb from './AppBreadcrumb.vue';

const layout = useLayoutStore();
const lock = useLockStore();
const avatar = useAvatar();
const router = useRouter();

// Fuzzy page search (Fuse.js): typing "dark mode" or "pasword" finds the matching settings page.
const { query, results } = usePageSearch();
const selected = shallowRef(null);

function goToPage({ value }) {
    router.push({ name: value.name });
    selected.value = null;
}
</script>

<template>
    <header class="layout-topbar">
        <div class="topbar-start">
            <Button type="button" class="topbar-menubutton p-trigger" :aria-label="$t('a11y.toggleMenu')" @click="layout.toggleMenu">
                <i class="pi pi-bars"></i>
            </Button>

            <AppBreadcrumb class="topbar-breadcrumb"></AppBreadcrumb>
        </div>

        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="topbar-search">
                    <IconField>
                        <InputIcon class="pi pi-search z-10" />
                        <AutoComplete
                            v-model="selected"
                            :suggestions="results"
                            optionLabel="title"
                            :placeholder="$t('topbar.search')"
                            :ariaLabel="$t('topbar.searchPages')"
                            :delay="100"
                            autoOptionFocus
                            :emptySearchMessage="$t('topbar.noMatches')"
                            inputClass="w-48 sm:w-full ps-10!"
                            @complete="query = $event.query"
                            @option-select="goToPage"
                        >
                            <template #option="{ option }">
                                <div class="flex items-center gap-2">
                                    <i :class="option.icon" class="text-surface-500 dark:text-surface-400"></i>
                                    <span>{{ option.title }}</span>
                                </div>
                            </template>
                        </AutoComplete>
                    </IconField>
                </li>
                <li>
                    <Button type="button" icon="pi pi-lock" text rounded severity="secondary" :aria-label="$t('topbar.lock')" :title="$t('topbar.lock')" @click="lock.lock" />
                </li>
                <li class="topbar-profile">
                    <Button type="button" class="topbar-sidebarbutton" @click="layout.toggleProfileSidebar">
                        <img :src="avatar" :alt="$t('topbar.profile')" class="rounded-full object-cover" />
                    </Button>
                </li>
            </ul>
        </div>
    </header>
</template>

<style lang="scss" scoped></style>
