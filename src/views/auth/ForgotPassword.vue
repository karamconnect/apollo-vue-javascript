<script setup>
import { authClient, isMockAuth } from '@/auth/client';
import { forgotPasswordSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';

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
        serverError.value = error.message || 'Could not send the reset link. Please try again.';
        return;
    }

    sentTo.value = values.email;
}
</script>

<template>
    <AuthLayout title="Forgot password" :subtitle="sentTo ? '' : 'Enter your email to reset your password'">
        <div v-if="sentTo" class="flex flex-col gap-6">
            <Message severity="success" role="status">
                If an account exists for <strong>{{ sentTo }}</strong
                >, you'll get an email with a link to reset your password.
            </Message>
            <Message v-if="isMockAuth" severity="info" size="small">Demo mode: no email is sent. The reset link is printed to the browser console.</Message>
            <Button asChild v-slot="slotProps" fluid><RouterLink :to="{ name: 'login' }" :class="slotProps.class">Back to log in</RouterLink></Button>
        </div>

        <template v-else>
            <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

            <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-envelope" />
                        <InputText name="email" type="email" placeholder="Email" aria-label="Email" autocomplete="email" :aria-describedby="$form.email?.invalid ? 'email-error' : undefined" fluid />
                    </IconField>
                    <Message v-if="$form.email?.invalid" id="email-error" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </div>

                <div class="flex flex-wrap gap-2">
                    <Button asChild v-slot="slotProps" outlined><RouterLink :to="{ name: 'login' }" :class="[slotProps.class, 'flex-auto']">Cancel</RouterLink></Button>
                    <Button type="submit" label="Send reset link" class="flex-auto" :loading />
                </div>
            </Form>
        </template>
    </AuthLayout>
</template>
