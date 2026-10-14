<script setup>
import { authClient } from '@/auth/client';
import AppLockScreen from '@/layout/AppLockScreen.vue';
import { useLockStore } from '@/stores/lock';
import { computed } from 'vue';

const lock = useLockStore();
const session = authClient.useSession();

// Covers the app while the session is still loading too, so a reload doesn't flash the page.
const showLockScreen = computed(() => lock.locked && (session.value.isPending || Boolean(session.value.data)));
</script>

<template>
    <div class="contents" :inert="showLockScreen || undefined">
        <router-view />
    </div>
    <AppLockScreen v-if="showLockScreen" :user="session.data?.user" />
</template>
