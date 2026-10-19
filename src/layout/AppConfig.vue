<script setup>
import { presetNames, primaryColors, surfaces } from '@/layout/theme';
import { useLayoutStore } from '@/stores/layout';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const layout = useLayoutStore();

// With no surface saved, the preset's default (slate in light mode, zinc in dark) is the selected one.
const isSelectedSurface = (name) => (layout.config.surface ?? (layout.isDarkTheme ? 'zinc' : 'slate')) === name;
const route = useRoute();
const { t } = useI18n();

const presetOptions = presetNames;
const themeOptions = computed(() => [
    { name: t('settings.appearance.light'), value: false },
    { name: t('settings.appearance.dark'), value: true }
]);
const menuModeOptions = computed(() => [
    { label: t('settings.appearance.menuStatic'), value: 'static' },
    { label: t('settings.appearance.menuOverlay'), value: 'overlay' },
    { label: t('settings.appearance.menuSlim'), value: 'slim' },
    { label: t('settings.appearance.menuSlimPlus'), value: 'slim-plus' },
    { label: t('settings.appearance.menuReveal'), value: 'reveal' },
    { label: t('settings.appearance.menuDrawer'), value: 'drawer' },
    { label: t('settings.appearance.menuHorizontal'), value: 'horizontal' }
]);
const menuThemeOptions = computed(() => [
    { label: t('settings.appearance.themeColorScheme'), value: 'colorScheme' },
    { label: t('settings.appearance.themePrimaryColor'), value: 'primaryColor' },
    { label: t('settings.appearance.themeTransparent'), value: 'transparent' }
]);

function isTransparentDisabled(option) {
    return option.value === 'transparent' && (layout.config.menuMode === 'reveal' || layout.config.menuMode === 'drawer');
}
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
            <span class="font-medium">{{ $t('settings.appearance.primary') }}</span>
            <div class="flex gap-3 flex-wrap">
                <button
                    v-for="primaryColor of primaryColors"
                    :key="primaryColor.name"
                    type="button"
                    :title="primaryColor.name"
                    :aria-label="primaryColor.name"
                    :aria-pressed="layout.config.primary === primaryColor.name"
                    @click="layout.setPrimary(primaryColor.name)"
                    :class="['swatch', { 'swatch-selected': layout.config.primary === primaryColor.name }]"
                    :style="{ backgroundColor: `${primaryColor.name === 'noir' ? 'var(--text-color)' : primaryColor.palette['500']}` }"
                ></button>
            </div>
        </div>

        <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
            <span class="font-medium">{{ $t('settings.appearance.surface') }}</span>
            <div class="flex gap-3 flex-wrap">
                <button
                    v-for="surface of surfaces"
                    :key="surface.name"
                    type="button"
                    :title="surface.name"
                    :aria-label="surface.name"
                    :aria-pressed="isSelectedSurface(surface.name)"
                    @click="layout.setSurface(surface.name)"
                    :class="['swatch', { 'swatch-selected': isSelectedSurface(surface.name) }]"
                    :style="{ backgroundColor: `${surface.palette['500']}` }"
                ></button>
            </div>
        </div>

        <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
            <span class="font-medium">{{ $t('settings.appearance.preset') }}</span>
            <SelectButton :modelValue="layout.config.preset" :options="presetOptions" :allowEmpty="false" @update:modelValue="layout.setPreset" />
        </div>

        <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
            <span class="font-medium">{{ $t('settings.appearance.colorScheme') }}</span>
            <SelectButton :modelValue="layout.config.darkTheme" :options="themeOptions" optionLabel="name" optionValue="value" :allowEmpty="false" @update:modelValue="layout.setDarkTheme" />
        </div>

        <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
            <label for="menuMode" class="font-medium">{{ $t('settings.appearance.menuType') }}</label>
            <Select :modelValue="layout.config.menuMode" inputId="menuMode" :options="menuModeOptions" optionLabel="label" optionValue="value" fluid @update:modelValue="(mode) => layout.setMenuMode(mode, route.path)" />
        </div>

        <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
            <label for="menuTheme" class="font-medium">{{ $t('settings.appearance.menuTheme') }}</label>
            <Select :modelValue="layout.config.menuTheme" inputId="menuTheme" :options="menuThemeOptions" optionLabel="label" optionValue="value" :optionDisabled="isTransparentDisabled" fluid @update:modelValue="layout.setMenuTheme" />
        </div>
    </div>
</template>

<style scoped>
/* 32px targets; the selected colour gets a ring in the text colour, keyboard focus the focus-ring colour. */
.swatch {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    outline: 2px solid transparent;
    outline-offset: 2px;
}

.swatch-selected {
    outline-color: var(--p-text-color);
}

.swatch:focus-visible {
    outline: var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);
    outline-offset: 2px;
    box-shadow: 0 0 0 calc(2px + var(--p-focus-ring-width)) var(--p-content-background);
}
</style>
