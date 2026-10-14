<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useUserStore } from '@/stores/user';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { profileSchema } from './profile-schema';

const toast = useToast();
const user = useUserStore();

const resolver = zodResolver(profileSchema);

// Re-keying the form re-creates it from the saved profile (after Save, and on Cancel).
const formKey = ref(0);
const initialValues = ref({ ...user.profile });

function resetForm() {
    initialValues.value = { ...user.profile };
    formKey.value++;
}

function onSubmit({ valid, values }) {
    if (!valid) {
        toast.add({ severity: 'error', summary: 'Not saved', detail: 'Please fix the highlighted fields.', life: 3000 });
        return;
    }

    user.updateProfile(values);
    resetForm();
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Your profile has been updated.', life: 3000 });
}
</script>

<template>
    <Form :key="formKey" v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate @submit="onSubmit">
        <SettingsSection title="Profile" description="How you appear to others.">
            <SettingsRow label="Name" for="firstName">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputText id="firstName" name="firstName" placeholder="First name" aria-label="First name" fluid />
                    <InputText name="lastName" placeholder="Last name" aria-label="Last name" fluid />
                </div>
            </SettingsRow>

            <SettingsRow label="Email" description="Used for sign-in and notifications. Optional." for="email">
                <div class="flex flex-col gap-1">
                    <InputText id="email" name="email" type="email" autocomplete="email" :aria-describedby="$form.email?.invalid ? 'email-error' : undefined" fluid />
                    <Message v-if="$form.email?.invalid" id="email-error" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </div>
            </SettingsRow>

            <SettingsRow label="Bio" description="A short introduction." for="bio">
                <Textarea id="bio" name="bio" rows="4" autoResize fluid />
            </SettingsRow>

            <template #actions>
                <Button type="button" label="Cancel" severity="secondary" outlined @click="resetForm" />
                <Button type="submit" label="Save" icon="pi pi-check" />
            </template>
        </SettingsSection>
    </Form>
</template>
