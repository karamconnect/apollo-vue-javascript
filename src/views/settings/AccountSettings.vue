<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

// Placeholder: nothing here is wired to an auth backend yet.
const toast = useToast();

const passwords = ref({ current: '', next: '', confirm: '' });

function notAvailable() {
    toast.add({ severity: 'info', summary: 'Not available', detail: 'Account management is not connected yet.', life: 3000 });
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
            <Button label="Delete account" icon="pi pi-trash" severity="danger" outlined @click="notAvailable" />
        </SettingsRow>
    </SettingsSection>
</template>
