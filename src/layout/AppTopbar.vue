<script setup>
import { useLayoutStore } from '@/stores/layout';
import { useLockStore } from '@/stores/lock';
import AppBreadcrumb from './AppBreadcrumb.vue';

const layout = useLayoutStore();
const lock = useLockStore();
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
                        <InputIcon class="pi pi-search" />
                        <InputText type="text" placeholder="Search" class="w-48 sm:w-full" />
                    </IconField>
                </li>
                <li>
                    <Button type="button" icon="pi pi-lock" text rounded severity="secondary" aria-label="Lock screen" title="Lock screen" @click="lock.lock" />
                </li>
                <li class="topbar-profile">
                    <Button type="button" class="topbar-sidebarbutton" @click="layout.toggleProfileSidebar">
                        <img src="/demo/images/avatar/avatar.png" alt="Profile" />
                    </Button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
