<script setup>
import StatusPage from '@/components/auth/StatusPage.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

// Used for unknown paths (`notFound`) and as the generic error page (/auth/error), where
// Better Auth / the router can pass an `?error=CODE`.
const props = defineProps({
    notFound: { type: Boolean, default: false }
});

const route = useRoute();
const { t } = useI18n();

const message = computed(() => {
    if (props.notFound) return t('status.notFoundMessage');

    const code = typeof route.query.error === 'string' ? route.query.error : '';

    return code ? t('status.errorWithCode', { code: code.replaceAll('_', ' ').toLowerCase() }) : t('status.errorMessage');
});
</script>

<template>
    <StatusPage :title="notFound ? t('status.notFound') : t('status.error')" :message color="red" severity="danger" />
</template>
