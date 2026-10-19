<script setup>
import { useLayoutStore } from '@/stores/layout';
import { onKeyStroke } from '@vueuse/core';
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppBreadCrumb from './AppBreadcrumb.vue';
import AppProfileSidebar from './AppProfileSidebar.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const layout = useLayoutStore();
const route = useRoute();
const mainRef = ref(null);

function focusMain() {
    mainRef.value?.focus({ preventScroll: true });
}

// When the menu opens over the page, focus moves into it; Escape closes it and returns focus to the menu button.
watch(
    () => layout.ui.mobileMenuActive || layout.ui.overlayMenuActive,
    (open) => {
        if (open) nextTick(() => document.querySelector('.layout-sidebar .layout-menu a')?.focus());
    }
);
onKeyStroke('Escape', () => {
    if (layout.closeMenuOverlay()) document.querySelector('.topbar-menubutton')?.focus();
});

// After moving to another page, focus goes to the page content, so keyboard and screen-reader users start there
// instead of on the link they used. Moving between sections of the same page (e.g. Settings tabs) keeps focus.
watch(
    () => route.matched[1],
    (page, previous) => {
        if (previous && page !== previous) nextTick(focusMain);
    }
);

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
        <a href="#main-content" class="skip-link" @click.prevent="focusMain">{{ $t('a11y.skipToContent') }}</a>
        <AppSidebar />
        <div class="layout-content-wrapper">
            <AppTopbar />
            <AppBreadCrumb class="content-breadcrumb" />
            <main id="main-content" ref="mainRef" class="layout-content" tabindex="-1">
                <router-view />
            </main>
        </div>
        <AppProfileSidebar />
        <Toast />
        <div class="layout-mask" @click="layout.hideMobileMenu" />
    </div>
</template>
