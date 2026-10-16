<script setup>
import { presetNames, primaryColors, surfaces } from '@/layout/theme';
import { useLayoutStore } from '@/stores/layout';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const layout = useLayoutStore();
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
            <div class="flex gap-2 flex-wrap">
                <button
                    v-for="primaryColor of primaryColors"
                    :key="primaryColor.name"
                    type="button"
                    :title="primaryColor.name"
                    :aria-label="primaryColor.name"
                    @click="layout.setPrimary(primaryColor.name)"
                    :class="['cursor-pointer w-6 h-6 rounded-full flex shrink-0 items-center justify-center p-0 outline-none outline-offset-1', { 'outline-primary': layout.config.primary === primaryColor.name }]"
                    :style="{ backgroundColor: `${primaryColor.name === 'noir' ? 'var(--text-color)' : primaryColor.palette['500']}` }"
                ></button>
            </div>
        </div>

        <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
            <span class="font-medium">{{ $t('settings.appearance.surface') }}</span>
            <div class="flex gap-2 flex-wrap">
                <button
                    v-for="surface of surfaces"
                    :key="surface.name"
                    type="button"
                    :title="surface.name"
                    :aria-label="surface.name"
                    @click="layout.setSurface(surface.name)"
                    :class="[
                        'cursor-pointer w-6 h-6 rounded-full flex shrink-0 items-center justify-center p-0 outline-none outline-offset-1',
                        { 'outline-primary': layout.config.surface ? layout.config.surface === surface.name : layout.isDarkTheme ? surface.name === 'zinc' : surface.name === 'slate' }
                    ]"
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
