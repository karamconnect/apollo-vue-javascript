<script setup>
import StatusPage from '@/components/auth/StatusPage.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Used for unknown paths (`notFound`) and as the generic error page (/auth/error), where
// Better Auth / the router can pass an `?error=CODE`.
const props = defineProps({
    notFound: { type: Boolean, default: false }
});

const route = useRoute();

const message = computed(() => {
    if (props.notFound) return "The page you're looking for doesn't exist.";

    const code = typeof route.query.error === 'string' ? route.query.error : '';

    return code ? `Something went wrong (${code.replaceAll('_', ' ').toLowerCase()}).` : 'Something went wrong!';
});
</script>

<template>
    <StatusPage :title="notFound ? 'Not Found' : 'Error'" :message color="red" severity="danger" />
</template>
