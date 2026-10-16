<script setup>
import { MIN_PASSWORD_LENGTH } from '@/views/settings/password-schema';

// A form field's validation error. Zod schemas give message keys (`validation.*`), translated here,
// so errors follow the current language. Pass `show` to decide yourself when it appears.
const props = defineProps({
    field: { type: Object, default: null },
    show: { type: Boolean, default: undefined }
});

const params = { min: MIN_PASSWORD_LENGTH };
</script>

<template>
    <Message v-if="props.show ?? field?.invalid" severity="error" size="small" variant="simple">{{ $t(field?.error?.message ?? '', params) }}</Message>
</template>
