<script setup>
import { authClient, isMockAuth } from '@/auth/client';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { safeRedirect } from '@/router/guard';
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Email verification with a one-time code (Better Auth emailOTP plugin). Shown after sign-up;
// the server sends the code on sign-up (`sendVerificationOnSignUp`), and "Resend" asks for another.
const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const route = useRoute();
const router = useRouter();
const session = authClient.useSession();

const email = computed(() => session.value.data?.user.email ?? '');
const verified = computed(() => Boolean(session.value.data?.user.emailVerified));
const maskedEmail = computed(() => email.value.replace(/^(.{2})[^@]*/, '$1**'));

const code = ref('');
const loading = ref(false);
const error = ref('');
const resendNotice = ref('');
const cooldown = ref(0);
let timer;

function continueToApp() {
    router.replace(safeRedirect(route.query.redirect));
}

async function verify() {
    if (code.value.length !== CODE_LENGTH) return;

    loading.value = true;
    error.value = '';

    const result = await authClient.emailOtp.verifyEmail({ email: email.value, otp: code.value });

    loading.value = false;

    if (result.error) {
        error.value = result.error.code === 'INVALID_OTP' ? "That code isn't right. Check it and try again." : result.error.message || 'Could not verify your email.';
        code.value = '';
        return;
    }

    continueToApp();
}

async function resend() {
    error.value = '';
    resendNotice.value = '';

    const result = await authClient.emailOtp.sendVerificationOtp({ email: email.value, type: 'email-verification' });

    if (result.error) {
        error.value = result.error.message || 'Could not send a new code.';
        return;
    }

    resendNotice.value = 'A new code is on its way.';
    cooldown.value = RESEND_COOLDOWN_SECONDS;
    clearInterval(timer);
    timer = setInterval(() => {
        cooldown.value--;
        if (cooldown.value <= 0) clearInterval(timer);
    }, 1000);
}

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
    <AuthLayout title="Verification" :subtitle="verified ? '' : 'We have sent a code to your email:'">
        <div v-if="verified" class="flex flex-col gap-6">
            <Message severity="success" role="status">Your email address is verified.</Message>
            <Button label="Continue" fluid @click="continueToApp" />
        </div>

        <template v-else>
            <div class="flex items-center mb-6 -mt-4">
                <i class="pi pi-envelope text-surface-600 dark:text-surface-200"></i>
                <span class="text-surface-900 dark:text-surface-0 font-bold ml-2">{{ maskedEmail }}</span>
            </div>

            <Message v-if="isMockAuth" severity="info" size="small" class="mb-6">Demo mode: no email is sent. Any {{ CODE_LENGTH }}-digit code works (one is printed to the browser console).</Message>

            <form class="flex flex-col gap-6" novalidate @submit.prevent="verify">
                <div class="flex flex-col gap-2">
                    <label id="code-label" class="font-medium text-surface-900 dark:text-surface-0">Verification code</label>
                    <div role="group" aria-labelledby="code-label" :aria-describedby="error ? 'code-error' : undefined">
                        <InputOtp v-model="code" :length="CODE_LENGTH" integerOnly :invalid="Boolean(error)" />
                    </div>
                    <Message v-if="error" id="code-error" severity="error" size="small" variant="simple">{{ error }}</Message>
                    <Message v-else-if="resendNotice" severity="success" size="small" variant="simple" role="status">{{ resendNotice }}</Message>
                </div>

                <Button type="submit" label="Verify" :loading :disabled="code.length !== CODE_LENGTH" fluid />

                <div class="flex flex-wrap justify-between gap-2 font-medium text-surface-600 dark:text-surface-200">
                    <button
                        type="button"
                        class="p-0 bg-transparent border-0 cursor-pointer font-medium text-surface-900 dark:text-surface-0 hover:text-primary disabled:opacity-50 disabled:cursor-default disabled:hover:text-inherit"
                        :disabled="cooldown > 0"
                        @click="resend"
                    >
                        {{ cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code' }}
                    </button>
                    <button type="button" class="p-0 bg-transparent border-0 cursor-pointer font-medium text-surface-600 dark:text-surface-200 hover:text-primary" @click="continueToApp">Skip for now</button>
                </div>
            </form>
        </template>
    </AuthLayout>
</template>
