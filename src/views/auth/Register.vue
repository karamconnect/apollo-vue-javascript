<script setup>
import { passwordInputProps } from '@/components/forms/password';
import { authClient } from '@/auth/client';
import { authErrorMessage } from '@/auth/errors';
import { registerSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import FieldError from '@/components/forms/FieldError.vue';
import { useUserStore } from '@/stores/user';
import { MIN_PASSWORD_LENGTH } from '@/views/settings/password-schema';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const { t } = useI18n();

const resolver = zodResolver(registerSchema);
const initialValues = { name: '', email: '', password: '', confirmPassword: '', terms: false };

const loading = ref(false);
const serverError = ref('');

async function onSubmit({ valid, values }) {
    if (!valid) return;

    loading.value = true;
    serverError.value = '';

    const { error } = await authClient.signUp.email({ name: values.name, email: values.email, password: values.password });

    loading.value = false;

    if (error) {
        serverError.value = authErrorMessage(error, t('auth.register.failed'));
        return;
    }

    // Seed the local profile until profiles come from the server.
    const [firstName, ...rest] = values.name.split(/\s+/);
    user.updateProfile({ firstName, lastName: rest.join(' '), email: values.email });

    // Confirm the email with the code the server just sent; Verification continues to `redirect`.
    router.replace({ name: 'verification', query: route.query });
}
</script>

<template>
    <AuthLayout :title="$t('auth.register.title')" :subtitle="$t('auth.register.subtitle')">
        <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

        <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
            <div class="flex flex-col gap-1">
                <IconField>
                    <InputIcon class="pi pi-user" />
                    <InputText name="name" :placeholder="$t('auth.fullName')" :aria-label="$t('auth.fullName')" autocomplete="name" :aria-describedby="$form.name?.invalid ? 'name-error' : undefined" fluid />
                </IconField>
                <FieldError id="name-error" :field="$form.name" />
            </div>

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
                        :placeholder="$t('auth.passwordWithMin', { min: MIN_PASSWORD_LENGTH })"
                        :ariaLabel="$t('auth.password')"
                        autocomplete="new-password"
                        toggleMask
                        fluid
                        :inputProps="passwordInputProps({ 'aria-describedby': $form.password?.invalid ? 'password-error' : undefined })"
                        :inputStyle="{ paddingLeft: '2.5rem' }"
                    />
                </IconField>
                <FieldError id="password-error" :field="$form.password" />
            </div>

            <div class="flex flex-col gap-1">
                <IconField>
                    <InputIcon class="pi pi-lock z-10" />
                    <Password
                        name="confirmPassword"
                        :placeholder="$t('auth.confirmPassword')"
                        :ariaLabel="$t('auth.confirmPassword')"
                        autocomplete="new-password"
                        :feedback="false"
                        toggleMask
                        fluid
                        :inputProps="passwordInputProps({ 'aria-describedby': $form.confirmPassword?.invalid ? 'confirm-password-error' : undefined })"
                        :inputStyle="{ paddingLeft: '2.5rem' }"
                    />
                </IconField>
                <FieldError id="confirm-password-error" :field="$form.confirmPassword" />
            </div>

            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                    <Checkbox name="terms" inputId="terms" binary :aria-describedby="$form.terms?.invalid ? 'terms-error' : undefined" />
                    <label for="terms" class="text-surface-900 dark:text-surface-0 font-medium">
                        <i18n-t keypath="auth.register.acceptTerms" scope="global">
                            <template #terms>
                                <!-- New tab, so the half-filled form isn't lost. -->
                                <router-link :to="{ name: 'terms' }" target="_blank" class="text-primary underline!">{{ $t('nav.terms') }}</router-link>
                            </template>
                        </i18n-t>
                    </label>
                </div>
                <FieldError id="terms-error" :field="$form.terms" />
            </div>

            <Button type="submit" :label="$t('auth.signUp')" :loading fluid />

            <span class="font-medium text-surface-600 dark:text-surface-200">
                {{ $t('auth.register.haveAccount') }}
                <router-link :to="{ name: 'login', query: route.query }" class="font-semibold text-surface-900 dark:text-surface-0 hover:text-primary transition-colors duration-300">{{ $t('auth.logIn') }}</router-link>
            </span>
        </Form>
    </AuthLayout>
</template>
