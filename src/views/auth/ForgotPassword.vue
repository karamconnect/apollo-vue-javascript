<script setup>
import { authClient, isMockAuth } from '@/auth/client';
import { authErrorMessage } from '@/auth/errors';
import { forgotPasswordSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import FieldError from '@/components/forms/FieldError.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const resolver = zodResolver(forgotPasswordSchema);
const initialValues = { email: '' };

const loading = ref(false);
const serverError = ref('');
const sentTo = ref('');

async function onSubmit({ valid, values }) {
    if (!valid) return;

    loading.value = true;
    serverError.value = '';

    const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/auth/reset-password`
    });

    loading.value = false;

    if (error) {
        serverError.value = authErrorMessage(error, t('auth.forgot.failed'));
        return;
    }

    sentTo.value = values.email;
}
</script>

<template>
    <AuthLayout :title="$t('auth.forgot.title')" :subtitle="sentTo ? '' : $t('auth.forgot.subtitle')">
        <div v-if="sentTo" class="flex flex-col gap-6">
            <Message severity="success" role="status">
                <i18n-t keypath="auth.forgot.sent" scope="global">
                    <template #email>
                        <strong>{{ sentTo }}</strong>
                    </template>
                </i18n-t>
            </Message>
            <Message v-if="isMockAuth" severity="info" size="small">{{ $t('auth.forgot.demo') }}</Message>
            <Button asChild v-slot="slotProps" fluid
                ><RouterLink :to="{ name: 'login' }" :class="slotProps.class">{{ $t('auth.forgot.backToLogin') }}</RouterLink></Button
            >
        </div>

        <template v-else>
            <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

            <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-envelope" />
                        <InputText name="email" type="email" :placeholder="$t('auth.email')" :aria-label="$t('auth.email')" autocomplete="email" :aria-describedby="$form.email?.invalid ? 'email-error' : undefined" fluid />
                    </IconField>
                    <FieldError id="email-error" :field="$form.email" />
                </div>

                <div class="flex flex-wrap gap-2">
                    <Button asChild v-slot="slotProps" outlined
                        ><RouterLink :to="{ name: 'login' }" :class="[slotProps.class, 'flex-auto']">{{ $t('common.cancel') }}</RouterLink></Button
                    >
                    <Button type="submit" :label="$t('auth.forgot.submit')" class="flex-auto" :loading />
                </div>
            </Form>
        </template>
    </AuthLayout>
</template>
