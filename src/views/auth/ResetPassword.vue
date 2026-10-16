<script setup>
import { authClient } from '@/auth/client';
import { authErrorMessage } from '@/auth/errors';
import { resetPasswordSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import FieldError from '@/components/forms/FieldError.vue';
import { MIN_PASSWORD_LENGTH } from '@/views/settings/password-schema';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();

// Better Auth appends `?token=…` to the link it emails (or `?error=INVALID_TOKEN` when the link is bad).
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''));

const { t } = useI18n();

const resolver = zodResolver(resetPasswordSchema);
const initialValues = { password: '', confirmPassword: '' };

const loading = ref(false);
const serverError = ref('');
const done = ref(false);

async function onSubmit({ valid, values }) {
    if (!valid) return;

    loading.value = true;
    serverError.value = '';

    const { error } = await authClient.resetPassword({ newPassword: values.password, token: token.value });

    loading.value = false;

    if (error) {
        serverError.value = authErrorMessage(error, t('auth.reset.failed'));
        return;
    }

    done.value = true;
}
</script>

<template>
    <AuthLayout :title="$t('auth.reset.title')" :subtitle="token && !done ? $t('auth.reset.subtitle') : ''">
        <div v-if="done" class="flex flex-col gap-6">
            <Message severity="success" role="status">{{ $t('auth.reset.done') }}</Message>
            <Button asChild v-slot="slotProps" fluid
                ><RouterLink :to="{ name: 'login' }" :class="slotProps.class">{{ $t('auth.logIn') }}</RouterLink></Button
            >
        </div>

        <div v-else-if="!token" class="flex flex-col gap-6">
            <Message severity="error" role="alert">{{ $t('auth.reset.invalidLink') }}</Message>
            <Button asChild v-slot="slotProps" fluid
                ><RouterLink :to="{ name: 'forgot-password' }" :class="slotProps.class">{{ $t('auth.reset.requestNewLink') }}</RouterLink></Button
            >
        </div>

        <template v-else>
            <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

            <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-lock z-10" />
                        <Password
                            name="password"
                            :placeholder="$t('auth.newPasswordWithMin', { min: MIN_PASSWORD_LENGTH })"
                            :ariaLabel="$t('auth.newPassword')"
                            autocomplete="new-password"
                            toggleMask
                            fluid
                            :inputProps="{ 'aria-describedby': $form.password?.invalid ? 'password-error' : undefined }"
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
                            :placeholder="$t('auth.confirmNewPassword')"
                            :ariaLabel="$t('auth.confirmNewPassword')"
                            autocomplete="new-password"
                            :feedback="false"
                            toggleMask
                            fluid
                            :inputProps="{ 'aria-describedby': $form.confirmPassword?.invalid ? 'confirm-password-error' : undefined }"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                        />
                    </IconField>
                    <FieldError id="confirm-password-error" :field="$form.confirmPassword" />
                </div>

                <Button type="submit" :label="$t('auth.reset.submit')" :loading fluid />
            </Form>
        </template>
    </AuthLayout>
</template>
