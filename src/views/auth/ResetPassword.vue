<script setup>
import { authClient } from '@/auth/client';
import { resetPasswordSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { MIN_PASSWORD_LENGTH } from '@/views/settings/password-schema';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Better Auth appends `?token=…` to the link it emails (or `?error=INVALID_TOKEN` when the link is bad).
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''));

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
        serverError.value = error.message || 'Could not reset your password. Please try again.';
        return;
    }

    done.value = true;
}
</script>

<template>
    <AuthLayout title="New password" :subtitle="token && !done ? 'Enter your new password' : ''">
        <div v-if="done" class="flex flex-col gap-6">
            <Message severity="success" role="status">Your password has been reset. You can now log in with it.</Message>
            <Button asChild v-slot="slotProps" fluid><RouterLink :to="{ name: 'login' }" :class="slotProps.class">Log in</RouterLink></Button>
        </div>

        <div v-else-if="!token" class="flex flex-col gap-6">
            <Message severity="error" role="alert">This reset link is invalid or has expired.</Message>
            <Button asChild v-slot="slotProps" fluid><RouterLink :to="{ name: 'forgot-password' }" :class="slotProps.class">Request a new link</RouterLink></Button>
        </div>

        <template v-else>
            <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

            <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-lock z-10" />
                        <Password
                            name="password"
                            :placeholder="`New password (at least ${MIN_PASSWORD_LENGTH} characters)`"
                            ariaLabel="New password"
                            autocomplete="new-password"
                            toggleMask
                            fluid
                            :inputProps="{ 'aria-describedby': $form.password?.invalid ? 'password-error' : undefined }"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                        />
                    </IconField>
                    <Message v-if="$form.password?.invalid" id="password-error" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
                </div>

                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-lock z-10" />
                        <Password
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            ariaLabel="Confirm new password"
                            autocomplete="new-password"
                            :feedback="false"
                            toggleMask
                            fluid
                            :inputProps="{ 'aria-describedby': $form.confirmPassword?.invalid ? 'confirm-password-error' : undefined }"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                        />
                    </IconField>
                    <Message v-if="$form.confirmPassword?.invalid" id="confirm-password-error" severity="error" size="small" variant="simple">{{ $form.confirmPassword.error?.message }}</Message>
                </div>

                <Button type="submit" label="Reset password" :loading fluid />
            </Form>
        </template>
    </AuthLayout>
</template>
