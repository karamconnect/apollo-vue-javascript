<script setup>
import { authClient } from '@/auth/client';
import { registerSchema } from '@/auth/schemas';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { useUserStore } from '@/stores/user';
import { MIN_PASSWORD_LENGTH } from '@/views/settings/password-schema';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const user = useUserStore();

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
        serverError.value = error.message || 'Could not create your account. Please try again.';
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
    <AuthLayout title="Register" subtitle="Let's get started">
        <Message v-if="serverError" severity="error" class="mb-6" role="alert">{{ serverError }}</Message>

        <Form v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate class="flex flex-col gap-6" @submit="onSubmit">
            <div class="flex flex-col gap-1">
                <IconField>
                    <InputIcon class="pi pi-user" />
                    <InputText name="name" placeholder="Full name" aria-label="Full name" autocomplete="name" :aria-describedby="$form.name?.invalid ? 'name-error' : undefined" fluid />
                </IconField>
                <Message v-if="$form.name?.invalid" id="name-error" severity="error" size="small" variant="simple">{{ $form.name.error?.message }}</Message>
            </div>

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
                        :placeholder="`Password (at least ${MIN_PASSWORD_LENGTH} characters)`"
                        ariaLabel="Password"
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
                        placeholder="Confirm password"
                        ariaLabel="Confirm password"
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

            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                    <Checkbox name="terms" inputId="terms" binary :aria-describedby="$form.terms?.invalid ? 'terms-error' : undefined" />
                    <label for="terms" class="text-surface-900 dark:text-surface-0 font-medium">
                        I have read and agree to the
                        <!-- New tab, so the half-filled form isn't lost. -->
                        <router-link :to="{ name: 'terms' }" target="_blank" class="text-primary hover:underline">Terms and Conditions</router-link>
                    </label>
                </div>
                <Message v-if="$form.terms?.invalid" id="terms-error" severity="error" size="small" variant="simple">{{ $form.terms.error?.message }}</Message>
            </div>

            <Button type="submit" label="Sign up" :loading fluid />

            <span class="font-medium text-surface-600 dark:text-surface-200">
                Already have an account?
                <router-link :to="{ name: 'login', query: route.query }" class="font-semibold text-surface-900 dark:text-surface-0 hover:text-primary transition-colors duration-300">Log in</router-link>
            </span>
        </Form>
    </AuthLayout>
</template>
