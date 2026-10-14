<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';

// Placeholder: nothing here is wired to an auth backend yet.
const toast = useToast();
const confirm = useConfirm();

const passwords = ref({ current: '', next: '', confirm: '' });

const DELETE_PHRASE = 'DELETE';
const deleteConfirmation = ref('');
const canDelete = computed(() => deleteConfirmation.value === DELETE_PHRASE);

function notAvailable() {
    toast.add({ severity: 'info', summary: 'Not available', detail: 'Account management is not connected yet.', life: 3000 });
}

function confirmDeleteAccount(event) {
    deleteConfirmation.value = '';

    confirm.require({
        group: 'delete-account',
        target: event.currentTarget,
        header: 'Delete account?',
        message: 'This permanently removes your account and all of its data. This cannot be undone.',
        accept: notAvailable
    });
}

function submitDelete(acceptCallback) {
    if (canDelete.value) acceptCallback();
}
</script>

<template>
    <SettingsSection title="Account" description="Sign-in and security.">
        <SettingsRow label="Password" description="Use at least 8 characters." for="currentPassword">
            <div class="flex flex-col gap-4 md:w-80">
                <Password v-model="passwords.current" inputId="currentPassword" placeholder="Current password" :feedback="false" toggleMask fluid />
                <Password v-model="passwords.next" placeholder="New password" ariaLabel="New password" toggleMask fluid />
                <Password v-model="passwords.confirm" placeholder="Confirm new password" ariaLabel="Confirm new password" :feedback="false" toggleMask fluid />
                <Button label="Update password" class="self-start" @click="notAvailable" />
            </div>
        </SettingsRow>

        <SettingsRow label="Sessions" description="Sign out of this device.">
            <Button label="Sign out" icon="pi pi-sign-out" severity="secondary" outlined @click="notAvailable" />
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
