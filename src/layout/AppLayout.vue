<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import AppBreadCrumb from './AppBreadcrumb.vue';
import AppProfileSidebar from './AppProfileSidebar.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, hideMobileMenu } = useLayout();

const containerClass = computed(() => {
    return {
        'layout-light': !layoutConfig.darkTheme,
        'layout-dark': layoutConfig.darkTheme,
        'layout-colorscheme-menu': layoutConfig.menuTheme === 'colorScheme',
        'layout-primarycolor-menu': layoutConfig.menuTheme === 'primaryColor',
        'layout-transparent-menu': layoutConfig.menuTheme === 'transparent',
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-slim': layoutConfig.menuMode === 'slim',
        'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
        'layout-horizontal': layoutConfig.menuMode === 'horizontal',
        'layout-reveal': layoutConfig.menuMode === 'reveal',
        'layout-drawer': layoutConfig.menuMode === 'drawer',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.mobileMenuActive,
        'layout-static-inactive': layoutState.staticMenuInactive,
        'layout-sidebar-expanded': layoutState.sidebarExpanded,
        'layout-sidebar-anchored': layoutState.anchored
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
        <div class="layout-mask" @click="hideMobileMenu" />
    </div>
</template>
