<script setup>
import { authClient, isMockAuth } from '@/auth/client';
import { loginSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { safeRedirect } from '@/router/guard';
import { useLockStore } from '@/stores/lock';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const lock = useLockStore();

const resolver = zodResolver(loginSchema);
const initialValues = { email: '', password: '', rememberMe: true };

const loading = ref(false);
const serverError = ref('');

async function onSubmit({ valid, values }) {
    if (!valid) return;

    loading.value = true;
    serverError.value = '';

    const { error } = await authClient.signIn.email(values);

    loading.value = false;

    if (error) {
        serverError.value = error.message || 'Could not sign in. Please try again.';
        return;
    }

    // A lock left over from an expired session shouldn't cover the app after a fresh login.
    lock.unlock();
    router.replace(safeRedirect(route.query.redirect));
}
</script>

<template>
    <AuthLayout title="Log in" subtitle="Please enter your details">
        <Message v-if="isMockAuth" severity="info" size="small" class="mb-6">Demo mode: no server is connected, so any email and password will work.</Message>
        <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

        <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
            <div class="flex flex-col gap-1">
                <IconField>
                    <InputIcon class="pi pi-envelope" />
                    <InputText name="email" type="email" placeholder="Email" aria-label="Email" autocomplete="email" :aria-describedby="$form.email?.invalid ? 'email-error' : undefined" fluid />
                </IconField>
                <Message v-if="$form.email?.invalid" id="email-error" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
            </div>

            <div class="flex flex-col gap-1">
                <IconField>
                    <InputIcon class="pi pi-lock z-10" />
                    <Password
                        name="password"
                        placeholder="Password"
                        ariaLabel="Password"
                        autocomplete="current-password"
                        :feedback="false"
                        toggleMask
                        fluid
                        :inputProps="{ 'aria-describedby': $form.password?.invalid ? 'password-error' : undefined }"
                        :inputStyle="{ paddingLeft: '2.5rem' }"
                    />
                </IconField>
                <Message v-if="$form.password?.invalid" id="password-error" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
            </div>

            <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                    <Checkbox name="rememberMe" inputId="rememberMe" binary />
                    <label for="rememberMe" class="text-surface-900 dark:text-surface-0 font-medium">Remember me</label>
                </div>
                <router-link :to="{ name: 'forgot-password' }" class="text-surface-600 dark:text-surface-200 hover:text-primary ml-auto transition-colors duration-300">Forgot password?</router-link>
            </div>

            <Button type="submit" label="Log in" :loading fluid />

            <span class="font-medium text-surface-600 dark:text-surface-200">
                Don't have an account?
                <router-link :to="{ name: 'register', query: route.query }" class="font-semibold text-surface-900 dark:text-surface-0 hover:text-primary transition-colors duration-300">Sign up</router-link>
            </span>
        </Form>
    </AuthLayout>
</template>
