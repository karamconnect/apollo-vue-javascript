<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useSettings } from './useSettings';

const { settings } = useSettings();

const channels = [
    { key: 'email', label: 'Email notifications', description: 'Receive updates and alerts by email.' },
    { key: 'push', label: 'Push notifications', description: 'Receive notifications in the browser.' },
    { key: 'digest', label: 'Weekly digest', description: 'A summary of activity every Monday.' }
];
</script>

<template>
    <SettingsSection title="Notifications" description="Changes apply immediately.">
        <SettingsRow v-for="channel in channels" :key="channel.key" :label="channel.label" :description="channel.description" :for="`notify-${channel.key}`">
            <ToggleSwitch v-model="settings.notifications[channel.key]" :inputId="`notify-${channel.key}`" />
        </SettingsRow>
    </SettingsSection>
</template>
