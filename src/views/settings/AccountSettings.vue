<script setup>
import { passwordInputProps } from '@/components/forms/password';
import { authClient } from '@/auth/client';
import { authErrorMessage } from '@/auth/errors';
import { useSignOut } from '@/auth/useSignOut';
import FieldError from '@/components/forms/FieldError.vue';
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useUserStore } from '@/stores/user';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { changePasswordSchema, MIN_PASSWORD_LENGTH } from './password-schema';

// Talks to Better Auth through `authClient` (answered by the in-browser mock until a server exists).
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const user = useUserStore();
const { t } = useI18n();

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
        toastError(error, t('settings.account.passwordNotChanged'));
        return;
    }

    toast.add({ severity: 'success', summary: t('settings.account.passwordUpdated'), detail: t('settings.account.otherDevicesSignedOut'), life: 3000 });
    passwordFormKey.value++;
}

const signOut = useSignOut();

const DELETE_PHRASE = 'DELETE';
const deleteConfirmation = ref('');
const canDelete = computed(() => deleteConfirmation.value === DELETE_PHRASE);

function toastError(error, summary) {
    toast.add({ severity: 'error', summary, detail: authErrorMessage(error), life: 5000 });
}

async function deleteAccount() {
    const { error } = await authClient.deleteUser();

    if (error) {
        toastError(error, t('settings.account.notDeleted'));
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
        header: t('settings.account.deleteHeader'),
        message: t('settings.account.deleteMessage'),
        accept: deleteAccount
    });
}

function submitDelete(acceptCallback) {
    if (canDelete.value) acceptCallback();
}
</script>

<template>
    <SettingsSection :title="$t('nav.account')" :description="$t('settings.account.description')">
        <SettingsRow :label="$t('settings.account.password')" :description="$t('validation.passwordTooShort', { min: MIN_PASSWORD_LENGTH })" for="currentPassword">
            <Form :key="passwordFormKey" v-slot="$form" :initialValues="emptyPasswords" :resolver="passwordResolver" validateOnMount novalidate class="flex flex-col gap-4 md:w-80" @submit="onPasswordSubmit">
                <div class="flex flex-col gap-1">
                    <Password
                        name="currentPassword"
                        inputId="currentPassword"
                        :placeholder="$t('settings.account.currentPassword')"
                        autocomplete="current-password"
                        :feedback="false"
                        toggleMask
                        fluid
                        :invalid="showError($form.currentPassword)"
                        :inputProps="passwordInputProps({ 'aria-describedby': showError($form.currentPassword) ? 'current-password-error' : undefined })"
                    />
                    <FieldError id="current-password-error" :field="$form.currentPassword" :show="showError($form.currentPassword)" />
                </div>

                <div class="flex flex-col gap-1">
                    <Password
                        name="newPassword"
                        :placeholder="$t('auth.newPassword')"
                        :ariaLabel="$t('auth.newPassword')"
                        autocomplete="new-password"
                        toggleMask
                        fluid
                        :invalid="showError($form.newPassword)"
                        :inputProps="passwordInputProps({ 'aria-describedby': showError($form.newPassword) ? 'new-password-error' : undefined })"
                    />
                    <FieldError id="new-password-error" :field="$form.newPassword" :show="showError($form.newPassword)" />
                </div>

                <div class="flex flex-col gap-1">
                    <Password
                        name="confirmPassword"
                        :placeholder="$t('auth.confirmNewPassword')"
                        :ariaLabel="$t('auth.confirmNewPassword')"
                        autocomplete="new-password"
                        :feedback="false"
                        toggleMask
                        fluid
                        :invalid="showError($form.confirmPassword)"
                        :inputProps="passwordInputProps({ 'aria-describedby': showError($form.confirmPassword) ? 'confirm-password-error' : undefined })"
                    />
                    <FieldError id="confirm-password-error" :field="$form.confirmPassword" :show="showError($form.confirmPassword)" />
                </div>

                <Button type="submit" :label="$t('settings.account.updatePassword')" class="self-start" :disabled="!$form.valid" :loading="updatingPassword" />
            </Form>
        </SettingsRow>

        <SettingsRow :label="$t('settings.account.sessions')" :description="$t('settings.account.sessionsDescription')">
            <Button :label="$t('common.signOut')" icon="pi pi-sign-out" severity="secondary" outlined @click="signOut" />
        </SettingsRow>

        <SettingsRow :label="$t('settings.account.deleteAccount')" :description="$t('settings.account.deleteDescription')">
            <Button :label="$t('settings.account.deleteAccount')" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteAccount" />
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
                    <i18n-t keypath="settings.account.typeToConfirm" tag="label" for="deleteConfirmation" scope="global">
                        <template #phrase>
                            <strong>{{ DELETE_PHRASE }}</strong>
                        </template>
                    </i18n-t>
                    <InputText id="deleteConfirmation" v-model="deleteConfirmation" autocomplete="off" spellcheck="false" autofocus fluid />
                </div>

                <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
                    <Button type="button" :label="$t('common.cancel')" severity="secondary" outlined @click="rejectCallback" />
                    <Button type="submit" :label="$t('settings.account.deleteAccount')" icon="pi pi-trash" severity="danger" :disabled="!canDelete" />
                </div>
            </form>
        </template>
    </ConfirmDialog>
</template>
