<script setup>
import SettingsSection from '@/components/settings/SettingsSection.vue';
import AppConfig from '@/layout/AppConfig.vue';
</script>

<template>
    <SettingsSection :title="$t('nav.appearance')" :description="$t('settings.appearance.description')">
        <AppConfig />
    </SettingsSection>
</template>
