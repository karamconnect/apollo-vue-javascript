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
    <div class="layout-topbar">
        <div class="topbar-start">
            <Button type="button" class="topbar-menubutton p-trigger" @click="layout.toggleMenu">
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
                            placeholder="Search"
                            ariaLabel="Search pages"
                            :delay="100"
                            autoOptionFocus
                            emptySearchMessage="No matching pages"
                            inputClass="w-48 sm:w-full pl-10!"
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
                    <Button type="button" icon="pi pi-lock" text rounded severity="secondary" aria-label="Lock screen" title="Lock screen" @click="lock.lock" />
                </li>
                <li class="topbar-profile">
                    <Button type="button" class="topbar-sidebarbutton" @click="layout.toggleProfileSidebar">
                        <img :src="avatar" alt="Profile" class="rounded-full object-cover" />
                    </Button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
