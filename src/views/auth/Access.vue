<script setup>
import StatusPage from '@/components/auth/StatusPage.vue';
</script>

<template>
    <StatusPage :title="$t('status.accessDenied')" :message="$t('status.accessDeniedMessage')" color="purple" severity="help" />
</template>
