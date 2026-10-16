<script setup>
import { authClient, isMockAuth } from '@/auth/client';
import { authErrorMessage } from '@/auth/errors';
import { loginSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import FieldError from '@/components/forms/FieldError.vue';
import { safeRedirect } from '@/router/guard';
import { useLockStore } from '@/stores/lock';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const lock = useLockStore();

const { t } = useI18n();

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
        serverError.value = authErrorMessage(error, t('auth.login.failed'));
        return;
    }

    // A lock left over from an expired session shouldn't cover the app after a fresh login.
    lock.unlock();
    router.replace(safeRedirect(route.query.redirect));
}
</script>

<template>
    <AuthLayout :title="$t('auth.logIn')" :subtitle="$t('auth.login.subtitle')">
        <Message v-if="isMockAuth" severity="info" size="small" class="mb-6">{{ $t('auth.login.demo') }}</Message>
        <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

        <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
            <div class="flex flex-col gap-1">
                <IconField>
                    <InputIcon class="pi pi-envelope" />
                    <InputText name="email" type="email" :placeholder="$t('auth.email')" :aria-label="$t('auth.email')" autocomplete="email" :aria-describedby="$form.email?.invalid ? 'email-error' : undefined" fluid />
                </IconField>
                <FieldError id="email-error" :field="$form.email" />
            </div>

            <div class="flex flex-col gap-1">
                <IconField>
                    <InputIcon class="pi pi-lock z-10" />
                    <Password
                        name="password"
                        :placeholder="$t('auth.password')"
                        :ariaLabel="$t('auth.password')"
                        autocomplete="current-password"
                        :feedback="false"
                        toggleMask
                        fluid
                        :inputProps="{ 'aria-describedby': $form.password?.invalid ? 'password-error' : undefined }"
                        :inputStyle="{ paddingLeft: '2.5rem' }"
                    />
                </IconField>
                <FieldError id="password-error" :field="$form.password" />
            </div>

            <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                    <Checkbox name="rememberMe" inputId="rememberMe" binary />
                    <label for="rememberMe" class="text-surface-900 dark:text-surface-0 font-medium">{{ $t('auth.login.rememberMe') }}</label>
                </div>
                <router-link :to="{ name: 'forgot-password' }" class="text-surface-600 dark:text-surface-200 hover:text-primary ml-auto transition-colors duration-300">{{ $t('auth.login.forgotPassword') }}</router-link>
            </div>

            <Button type="submit" :label="$t('auth.logIn')" :loading fluid />

            <span class="font-medium text-surface-600 dark:text-surface-200">
                {{ $t('auth.login.noAccount') }}
                <router-link :to="{ name: 'register', query: route.query }" class="font-semibold text-surface-900 dark:text-surface-0 hover:text-primary transition-colors duration-300">{{ $t('auth.signUp') }}</router-link>
            </span>
        </Form>
    </AuthLayout>
</template>
