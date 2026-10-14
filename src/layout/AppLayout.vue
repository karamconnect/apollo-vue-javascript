<script setup>
import { useLayoutStore } from '@/stores/layout';
import { computed } from 'vue';
import AppBreadCrumb from './AppBreadcrumb.vue';
import AppProfileSidebar from './AppProfileSidebar.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const layout = useLayoutStore();

const containerClass = computed(() => {
    return {
        'layout-light': !layout.config.darkTheme,
        'layout-dark': layout.config.darkTheme,
        'layout-colorscheme-menu': layout.config.menuTheme === 'colorScheme',
        'layout-primarycolor-menu': layout.config.menuTheme === 'primaryColor',
        'layout-transparent-menu': layout.config.menuTheme === 'transparent',
        'layout-overlay': layout.config.menuMode === 'overlay',
        'layout-static': layout.config.menuMode === 'static',
        'layout-slim': layout.config.menuMode === 'slim',
        'layout-slim-plus': layout.config.menuMode === 'slim-plus',
        'layout-horizontal': layout.config.menuMode === 'horizontal',
        'layout-reveal': layout.config.menuMode === 'reveal',
        'layout-drawer': layout.config.menuMode === 'drawer',
        'layout-overlay-active': layout.ui.overlayMenuActive,
        'layout-mobile-active': layout.ui.mobileMenuActive,
        'layout-static-inactive': layout.ui.staticMenuInactive,
        'layout-sidebar-expanded': layout.ui.sidebarExpanded,
        'layout-sidebar-anchored': layout.ui.anchored
    };
});
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <AppSidebar />
        <div class="layout-content-wrapper">
            <AppTopbar />
            <AppBreadCrumb class="content-breadcrumb" />
            <div class="layout-content">
                <router-view />
            </div>
        </div>
        <AppProfileSidebar />
        <Toast />
        <div class="layout-mask" @click="layout.hideMobileMenu" />
    </div>
</template>
