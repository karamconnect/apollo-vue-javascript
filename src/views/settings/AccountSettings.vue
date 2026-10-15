<script setup>
import { authClient } from '@/auth/client';
import { useSignOut } from '@/auth/useSignOut';
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useUserStore } from '@/stores/user';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { changePasswordSchema, MIN_PASSWORD_LENGTH } from './password-schema';

// Talks to Better Auth through `authClient` (answered by the in-browser mock until a server exists).
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const user = useUserStore();

const passwordResolver = zodResolver(changePasswordSchema);
const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };
// Re-keying clears the password form after a successful update.
const passwordFormKey = ref(0);

// The form validates from the start (so the button starts disabled), but a field only
// shows its error once the user has typed in it.
function showError(field) {
    return Boolean(field?.invalid && field?.dirty);
}

const updatingPassword = ref(false);

async function onPasswordSubmit({ valid, values }) {
    if (!valid) return;

    updatingPassword.value = true;
    const { error } = await authClient.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword, revokeOtherSessions: true });
    updatingPassword.value = false;

    if (error) {
        toastError(error, 'Password not changed');
        return;
    }

    toast.add({ severity: 'success', summary: 'Password updated', detail: 'Other devices have been signed out.', life: 3000 });
    passwordFormKey.value++;
}

const signOut = useSignOut();

const DELETE_PHRASE = 'DELETE';
const deleteConfirmation = ref('');
const canDelete = computed(() => deleteConfirmation.value === DELETE_PHRASE);

function toastError(error, summary) {
    toast.add({ severity: 'error', summary, detail: error.message || 'Something went wrong. Please try again.', life: 5000 });
}

async function deleteAccount() {
    const { error } = await authClient.deleteUser();

    if (error) {
        toastError(error, 'Account not deleted');
        return;
    }

    user.updateProfile({ firstName: '', lastName: '', email: '', bio: '' });
    router.push({ name: 'login' });
}

function confirmDeleteAccount(event) {
    deleteConfirmation.value = '';

    confirm.require({
        group: 'delete-account',
        target: event.currentTarget,
        header: 'Delete account?',
        message: 'This permanently removes your account and all of its data. This cannot be undone.',
        accept: deleteAccount
    });
}

function submitDelete(acceptCallback) {
    if (canDelete.value) acceptCallback();
}
</script>

<template>
    <SettingsSection title="Account" description="Sign-in and security.">
        <SettingsRow label="Password" :description="`Use at least ${MIN_PASSWORD_LENGTH} characters.`" for="currentPassword">
            <Form :key="passwordFormKey" v-slot="$form" :initialValues="emptyPasswords" :resolver="passwordResolver" validateOnMount novalidate class="flex flex-col gap-4 md:w-80" @submit="onPasswordSubmit">
                <div class="flex flex-col gap-1">
                    <Password
                        name="currentPassword"
                        inputId="currentPassword"
                        placeholder="Current password"
                        autocomplete="current-password"
                        :feedback="false"
                        toggleMask
                        fluid
                        :invalid="showError($form.currentPassword)"
                        :inputProps="{ 'aria-describedby': showError($form.currentPassword) ? 'current-password-error' : undefined }"
                    />
                    <Message v-if="showError($form.currentPassword)" id="current-password-error" severity="error" size="small" variant="simple">{{ $form.currentPassword.error?.message }}</Message>
                </div>

                <div class="flex flex-col gap-1">
                    <Password
                        name="newPassword"
                        placeholder="New password"
                        ariaLabel="New password"
                        autocomplete="new-password"
                        toggleMask
                        fluid
                        :invalid="showError($form.newPassword)"
                        :inputProps="{ 'aria-describedby': showError($form.newPassword) ? 'new-password-error' : undefined }"
                    />
                    <Message v-if="showError($form.newPassword)" id="new-password-error" severity="error" size="small" variant="simple">{{ $form.newPassword.error?.message }}</Message>
                </div>

                <div class="flex flex-col gap-1">
                    <Password
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        ariaLabel="Confirm new password"
                        autocomplete="new-password"
                        :feedback="false"
                        toggleMask
                        fluid
                        :invalid="showError($form.confirmPassword)"
                        :inputProps="{ 'aria-describedby': showError($form.confirmPassword) ? 'confirm-password-error' : undefined }"
                    />
                    <Message v-if="showError($form.confirmPassword)" id="confirm-password-error" severity="error" size="small" variant="simple">{{ $form.confirmPassword.error?.message }}</Message>
                </div>

                <Button type="submit" label="Update password" class="self-start" :disabled="!$form.valid" :loading="updatingPassword" />
            </Form>
        </SettingsRow>

        <SettingsRow label="Sessions" description="Sign out of this device.">
            <Button label="Sign out" icon="pi pi-sign-out" severity="secondary" outlined @click="signOut" />
        </SettingsRow>

        <SettingsRow label="Delete account" description="Permanently remove your account and data.">
            <Button label="Delete account" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteAccount" />
        </SettingsRow>
    </SettingsSection>

    <ConfirmDialog group="delete-account" class="w-full max-w-md mx-4">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <form class="flex flex-col gap-4 p-6" @submit.prevent="submitDelete(acceptCallback)">
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-400/20 text-red-600 dark:text-red-400">
                        <i class="pi pi-exclamation-triangle"></i>
                    </span>
                    <span class="text-xl font-semibold">{{ message.header }}</span>
                </div>

                <p class="m-0 text-surface-600 dark:text-surface-300">{{ message.message }}</p>

                <div class="flex flex-col gap-2">
                    <label for="deleteConfirmation">
                        Type <strong>{{ DELETE_PHRASE }}</strong> to confirm.
                    </label>
                    <InputText id="deleteConfirmation" v-model="deleteConfirmation" autocomplete="off" spellcheck="false" autofocus fluid />
                </div>

                <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
                    <Button type="button" label="Cancel" severity="secondary" outlined @click="rejectCallback" />
                    <Button type="submit" label="Delete account" icon="pi pi-trash" severity="danger" :disabled="!canDelete" />
                </div>
            </form>
        </template>
    </ConfirmDialog>
</template>
