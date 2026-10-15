<script setup>
import { authClient } from '@/auth/client';
import { DEFAULT_AVATAR } from '@/auth/useAvatar';
import { useSignOut } from '@/auth/useSignOut';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { useLockStore } from '@/stores/lock';
import { onMounted, ref, useTemplateRef } from 'vue';

// Covers the app (Apollo's lock screen) without navigating away, so the page underneath keeps
// its state — e.g. a half-filled form. Unlocking re-checks the password by signing in again,
// since Better Auth's /verify-password endpoint is server-only.
const props = defineProps({
    user: { type: Object, default: null }
});

const lock = useLockStore();
const signOut = useSignOut();

const password = ref('');
const loading = ref(false);
const error = ref('');
const form = useTemplateRef('form');

onMounted(() => form.value?.querySelector('input')?.focus());

async function unlock() {
    if (!password.value || !props.user) return;

    loading.value = true;
    error.value = '';

    const result = await authClient.signIn.email({ email: props.user.email, password: password.value });

    loading.value = false;
    password.value = '';

    if (result.error) {
        error.value = result.error.status === 401 ? 'Incorrect password.' : result.error.message || 'Could not unlock. Please try again.';
        return;
    }

    lock.unlock();
}
</script>

<template>
    <div class="fixed inset-0 z-[5000] overflow-auto" role="dialog" aria-modal="true" aria-label="Screen locked">
        <AuthLayout title="Screen locked" subtitle="Enter your password to continue where you left off.">
            <div class="flex flex-col items-center mb-6">
                <img :src="user?.image || DEFAULT_AVATAR" class="w-12 h-12 mb-2 rounded-full object-cover" alt="" />
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ user?.name }}</span>
                <span class="text-sm text-surface-500 dark:text-surface-400">{{ user?.email }}</span>
            </div>

            <form ref="form" class="flex flex-col gap-6" novalidate @submit.prevent="unlock">
                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-lock z-10" />
                        <Password
                            v-model="password"
                            placeholder="Password"
                            ariaLabel="Password"
                            autocomplete="current-password"
                            :feedback="false"
                            toggleMask
                            fluid
                            :invalid="Boolean(error)"
                            :inputProps="{ 'aria-describedby': error ? 'unlock-error' : undefined }"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                        />
                    </IconField>
                    <Message v-if="error" id="unlock-error" severity="error" size="small" variant="simple">{{ error }}</Message>
                </div>

                <Button type="submit" icon="pi pi-lock-open" label="Unlock" :loading :disabled="!password" fluid />

                <span class="font-medium text-surface-600 dark:text-surface-200">
                    Not you?
                    <a href="#" class="font-semibold text-surface-900 dark:text-surface-0 hover:text-primary transition-colors duration-300" @click.prevent="signOut">Sign out</a>
                </span>
            </form>
        </AuthLayout>
    </div>
</template>
