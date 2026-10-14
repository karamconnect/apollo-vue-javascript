<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

const toast = useToast();
const user = useUserStore();

const form = ref({ ...user.profile });

function reset() {
    form.value = { ...user.profile };
}

function save() {
    user.updateProfile(form.value);
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Your profile has been updated.', life: 3000 });
}
</script>

<template>
    <SettingsSection title="Profile" description="How you appear to others.">
        <SettingsRow label="Name" for="firstName">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText id="firstName" v-model="form.firstName" placeholder="First name" aria-label="First name" fluid />
                <InputText v-model="form.lastName" placeholder="Last name" aria-label="Last name" fluid />
            </div>
        </SettingsRow>

        <SettingsRow label="Email" description="Used for sign-in and notifications." for="email">
            <InputText id="email" v-model="form.email" type="email" fluid />
        </SettingsRow>

        <SettingsRow label="Bio" description="A short introduction." for="bio">
            <Textarea id="bio" v-model="form.bio" rows="4" autoResize fluid />
        </SettingsRow>

        <template #actions>
            <Button label="Cancel" severity="secondary" outlined @click="reset" />
            <Button label="Save" icon="pi pi-check" @click="save" />
        </template>
    </SettingsSection>
</template>
