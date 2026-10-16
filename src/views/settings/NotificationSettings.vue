<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { usePreferencesStore } from '@/stores/preferences';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const preferences = usePreferencesStore();

const { t } = useI18n();

const channels = computed(() => [
    { key: 'email', label: t('settings.notifications.email'), description: t('settings.notifications.emailDescription') },
    { key: 'push', label: t('settings.notifications.push'), description: t('settings.notifications.pushDescription') },
    { key: 'digest', label: t('settings.notifications.digest'), description: t('settings.notifications.digestDescription') }
]);
</script>

<template>
    <SettingsSection :title="$t('nav.notifications')" :description="$t('settings.notifications.description')">
        <SettingsRow v-for="channel in channels" :key="channel.key" :label="channel.label" :description="channel.description" :for="`notify-${channel.key}`">
            <ToggleSwitch :modelValue="preferences.notifications[channel.key]" :inputId="`notify-${channel.key}`" @update:modelValue="(enabled) => preferences.setNotification(channel.key, enabled)" />
        </SettingsRow>
    </SettingsSection>
</template>
