import { getPresetExt, presets, surfaces } from '@/layout/theme';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { usePersistedRef } from './persisted';

const OVERLAY_SUBMENU_MODES = ['slim', 'slim-plus', 'drawer', 'horizontal'];

export const useLayoutStore = defineStore('layout', () => {
    // Appearance choices, persisted across reloads.
    const config = usePersistedRef('layout.config', {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'static',
        menuTheme: 'colorScheme'
    });

    // Transient UI state for the sidebar, menus and drawers.
    const ui = ref({
        staticMenuInactive: false,
        overlayMenuActive: false,
        mobileMenuActive: false,
        sidebarExpanded: false,
        menuHoverActive: false,
        activePath: null,
        anchored: false,
        profileSidebarVisible: false
    });

    const isDarkTheme = computed(() => config.value.darkTheme);
    const isHorizontal = computed(() => config.value.menuMode === 'horizontal');
    const isSlim = computed(() => config.value.menuMode === 'slim');
    const isSlimPlus = computed(() => config.value.menuMode === 'slim-plus');
    const hasOverlaySubmenu = computed(() => OVERLAY_SUBMENU_MODES.includes(config.value.menuMode));
    const hasOpenOverlaySubmenu = computed(() => hasOverlaySubmenu.value && ui.value.activePath !== null && ui.value.activePath !== '/');
    const hasOpenOverlay = computed(() => ui.value.overlayMenuActive || hasOpenOverlaySubmenu.value);

    function isDesktop() {
        return window.innerWidth > 991;
    }

    function toggleMenu() {
        if (!isDesktop()) {
            ui.value.mobileMenuActive = !ui.value.mobileMenuActive;
        } else if (config.value.menuMode === 'static') {
            ui.value.staticMenuInactive = !ui.value.staticMenuInactive;
        } else if (config.value.menuMode === 'overlay') {
            ui.value.overlayMenuActive = !ui.value.overlayMenuActive;
        }
    }

    function hideMobileMenu() {
        ui.value.mobileMenuActive = false;
    }

    function toggleProfileSidebar() {
        ui.value.profileSidebarVisible = !ui.value.profileSidebarVisible;
    }

    function setMenuMode(menuMode, currentPath) {
        config.value.menuMode = menuMode;
        Object.assign(ui.value, {
            staticMenuInactive: false,
            overlayMenuActive: false,
            mobileMenuActive: false,
            sidebarExpanded: false,
            menuHoverActive: false,
            anchored: false
        });

        if (isDesktop()) {
            ui.value.activePath = hasOverlaySubmenu.value ? null : currentPath;
        }

        // The transparent menu theme isn't supported by the reveal and drawer modes.
        if (config.value.menuTheme === 'transparent' && (menuMode === 'reveal' || menuMode === 'drawer')) {
            config.value.menuTheme = 'colorScheme';
        }
    }

    function setMenuTheme(menuTheme) {
        config.value.menuTheme = menuTheme;
    }

    function setDarkTheme(darkTheme) {
        if (config.value.darkTheme === darkTheme) return;

        const apply = () => {
            config.value.darkTheme = darkTheme;
            document.documentElement.classList.toggle('app-dark', darkTheme);
        };

        if (document.startViewTransition) document.startViewTransition(apply);
        else apply();
    }

    function setPrimary(name) {
        config.value.primary = name;
        updatePreset(getPresetExt(name));
    }

    function setSurface(name) {
        config.value.surface = name;
        updateSurfacePalette(surfaces.find((surface) => surface.name === name)?.palette);
    }

    function setPreset(name) {
        config.value.preset = name;
        applyTheme();
    }

    // Applies the full persisted theme; call once after PrimeVue is installed and whenever the preset changes.
    function applyTheme() {
        document.documentElement.classList.toggle('app-dark', config.value.darkTheme);

        const surfacePalette = surfaces.find((surface) => surface.name === config.value.surface)?.palette;

        $t()
            .preset(presets[config.value.preset] ?? presets.Aura)
            .preset(getPresetExt(config.value.primary))
            .surfacePalette(surfacePalette)
            .use({ useDefaultOptions: true });
    }

    return {
        config,
        ui,
        isDarkTheme,
        isHorizontal,
        isSlim,
        isSlimPlus,
        hasOverlaySubmenu,
        hasOpenOverlaySubmenu,
        hasOpenOverlay,
        isDesktop,
        toggleMenu,
        hideMobileMenu,
        toggleProfileSidebar,
        setMenuMode,
        setMenuTheme,
        setDarkTheme,
        setPrimary,
        setSurface,
        setPreset,
        applyTheme
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useLayoutStore, import.meta.hot));
}
