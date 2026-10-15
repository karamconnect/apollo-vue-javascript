import { getPresetExt, loadPreset, surfaces } from '@/layout/theme';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLayoutStore } from '../layout';

const theme = vi.hoisted(() => {
    const chain = {};
    chain.preset = vi.fn(() => chain);
    chain.surfacePalette = vi.fn(() => chain);
    chain.use = vi.fn(() => chain);

    return { chain, $t: vi.fn(() => chain), updatePreset: vi.fn(), updateSurfacePalette: vi.fn() };
});

vi.mock('@primeuix/themes', () => ({
    $t: theme.$t,
    updatePreset: theme.updatePreset,
    updateSurfacePalette: theme.updateSurfacePalette
}));

function setViewportWidth(width) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
}

describe('layout store', () => {
    let layout;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        document.documentElement.className = '';
        delete document.startViewTransition;
        setViewportWidth(1280);
        setActivePinia(createPinia());
        layout = useLayoutStore();
    });

    afterEach(() => {
        delete document.startViewTransition;
    });

    it('has default appearance and closed UI', () => {
        expect(layout.config).toEqual({ preset: 'Aura', primary: 'emerald', surface: null, darkTheme: false, menuMode: 'static', menuTheme: 'colorScheme' });
        expect(layout.ui.mobileMenuActive).toBe(false);
        expect(layout.ui.profileSidebarVisible).toBe(false);
    });

    describe('toggleMenu', () => {
        it('collapses the static menu on desktop', () => {
            layout.toggleMenu();
            expect(layout.ui.staticMenuInactive).toBe(true);

            layout.toggleMenu();
            expect(layout.ui.staticMenuInactive).toBe(false);
        });

        it('opens the overlay menu in overlay mode', () => {
            layout.setMenuMode('overlay', '/');
            layout.toggleMenu();

            expect(layout.ui.overlayMenuActive).toBe(true);
            expect(layout.ui.staticMenuInactive).toBe(false);
        });

        it('opens the mobile menu below the desktop breakpoint', () => {
            setViewportWidth(800);
            layout.toggleMenu();

            expect(layout.ui.mobileMenuActive).toBe(true);
            expect(layout.ui.staticMenuInactive).toBe(false);
        });
    });

    it('hideMobileMenu closes the mobile menu', () => {
        layout.ui.mobileMenuActive = true;
        layout.hideMobileMenu();

        expect(layout.ui.mobileMenuActive).toBe(false);
    });

    it('toggleProfileSidebar opens and closes the drawer', () => {
        layout.toggleProfileSidebar();
        expect(layout.ui.profileSidebarVisible).toBe(true);

        layout.toggleProfileSidebar();
        expect(layout.ui.profileSidebarVisible).toBe(false);
    });

    describe('setMenuMode', () => {
        it('resets open menus and tracks the current path for inline submenus', () => {
            Object.assign(layout.ui, { staticMenuInactive: true, overlayMenuActive: true, mobileMenuActive: true, anchored: true });

            layout.setMenuMode('static', '/settings/profile');

            expect(layout.config.menuMode).toBe('static');
            expect(layout.ui).toMatchObject({ staticMenuInactive: false, overlayMenuActive: false, mobileMenuActive: false, anchored: false, activePath: '/settings/profile' });
        });

        it('clears the active path for modes with overlay submenus', () => {
            layout.setMenuMode('slim', '/settings');

            expect(layout.ui.activePath).toBeNull();
            expect(layout.hasOverlaySubmenu).toBe(true);
        });

        it('falls back from the transparent menu theme in reveal and drawer modes', () => {
            layout.setMenuTheme('transparent');
            layout.setMenuMode('static', '/');
            expect(layout.config.menuTheme).toBe('transparent');

            layout.setMenuMode('drawer', '/');
            expect(layout.config.menuTheme).toBe('colorScheme');
        });
    });

    describe('getters', () => {
        it('reflect the menu mode', () => {
            layout.setMenuMode('horizontal', '/');
            expect(layout.isHorizontal).toBe(true);
            expect(layout.isSlim).toBe(false);

            layout.setMenuMode('slim-plus', '/');
            expect(layout.isSlimPlus).toBe(true);
        });

        it('hasOpenOverlaySubmenu ignores the root path', () => {
            layout.setMenuMode('slim', '/');

            layout.ui.activePath = '/';
            expect(layout.hasOpenOverlaySubmenu).toBe(false);

            layout.ui.activePath = '/menu';
            expect(layout.hasOpenOverlaySubmenu).toBe(true);
            expect(layout.hasOpenOverlay).toBe(true);
        });

        it('hasOpenOverlay is true when the overlay menu is open', () => {
            layout.ui.overlayMenuActive = true;

            expect(layout.hasOpenOverlay).toBe(true);
        });
    });

    describe('setDarkTheme', () => {
        it('updates config and the app-dark class', () => {
            layout.setDarkTheme(true);

            expect(layout.config.darkTheme).toBe(true);
            expect(layout.isDarkTheme).toBe(true);
            expect(document.documentElement.classList.contains('app-dark')).toBe(true);

            layout.setDarkTheme(false);
            expect(document.documentElement.classList.contains('app-dark')).toBe(false);
        });

        it('animates with a view transition when the browser supports it', () => {
            document.startViewTransition = vi.fn((callback) => callback());

            layout.setDarkTheme(true);

            expect(document.startViewTransition).toHaveBeenCalledOnce();
            expect(document.documentElement.classList.contains('app-dark')).toBe(true);
        });

        it('does nothing when the value is unchanged', () => {
            document.startViewTransition = vi.fn((callback) => callback());

            layout.setDarkTheme(false);

            expect(document.startViewTransition).not.toHaveBeenCalled();
        });
    });

    it('setPrimary stores the color and applies its preset extension', () => {
        layout.setPrimary('blue');

        expect(layout.config.primary).toBe('blue');
        expect(theme.updatePreset).toHaveBeenCalledWith(getPresetExt('blue'));
    });

    it('setSurface stores the surface and applies its palette', () => {
        layout.setSurface('zinc');

        expect(layout.config.surface).toBe('zinc');
        expect(theme.updateSurfacePalette).toHaveBeenCalledWith(surfaces.find((surface) => surface.name === 'zinc').palette);
    });

    it('setPreset rebuilds the theme from the chosen preset', async () => {
        await layout.setPreset('Lara');

        expect(layout.config.preset).toBe('Lara');
        expect(theme.chain.preset).toHaveBeenNthCalledWith(1, Lara);
        expect(theme.chain.use).toHaveBeenCalledWith({ useDefaultOptions: true });
    });

    it('applyTheme restores a saved theme, including dark mode', async () => {
        localStorage.setItem('app.layout.config', JSON.stringify({ preset: 'Nora', primary: 'rose', surface: 'stone', darkTheme: true }));
        setActivePinia(createPinia());

        await useLayoutStore().applyTheme();

        expect(document.documentElement.classList.contains('app-dark')).toBe(true);
        expect(theme.chain.preset).toHaveBeenNthCalledWith(1, Nora);
        expect(theme.chain.preset).toHaveBeenNthCalledWith(2, getPresetExt('rose'));
        expect(theme.chain.surfacePalette).toHaveBeenCalledWith(surfaces.find((surface) => surface.name === 'stone').palette);
    });

    it('applyTheme falls back to Aura for an unknown saved preset', async () => {
        localStorage.setItem('app.layout.config', JSON.stringify({ preset: 'Removed' }));
        setActivePinia(createPinia());

        await useLayoutStore().applyTheme();

        expect(theme.chain.preset).toHaveBeenNthCalledWith(1, Aura);
    });

    it('applies only the last preset when switching again before the first one loads', async () => {
        await Promise.all([layout.setPreset('Lara'), layout.setPreset('Nora')]);

        expect(theme.$t).toHaveBeenCalledTimes(1);
        expect(theme.chain.preset).toHaveBeenNthCalledWith(1, Nora);
    });

    it('loadPreset resolves each preset by name', async () => {
        expect(await loadPreset('Lara')).toBe(Lara);
        expect(await loadPreset('Removed')).toBe(Aura);
    });

    it('persists appearance but not transient UI state', async () => {
        layout.setMenuMode('slim', '/');
        layout.toggleProfileSidebar();
        await nextTick();

        const saved = JSON.parse(localStorage.getItem('app.layout.config'));
        expect(saved.menuMode).toBe('slim');
        expect(saved).not.toHaveProperty('profileSidebarVisible');

        setActivePinia(createPinia());
        const reloaded = useLayoutStore();

        expect(reloaded.config.menuMode).toBe('slim');
        expect(reloaded.ui.profileSidebarVisible).toBe(false);
    });
});
