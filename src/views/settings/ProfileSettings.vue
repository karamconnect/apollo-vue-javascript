<script setup>
import { authClient } from '@/auth/client';
import { useAvatar } from '@/auth/useAvatar';
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useUserStore } from '@/stores/user';
import { avatarUrl, isDemoFilestackKey, openAvatarPicker } from '@/service/filestack';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { profileSchema } from './profile-schema';

const toast = useToast();
const user = useUserStore();
const session = authClient.useSession();
const avatar = useAvatar();

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

// The photo is saved straight to the auth user (`user.image`), not with the form's Save button.
const photoBusy = ref(false);
const hasPhoto = computed(() => Boolean(session.value.data?.user.image));

async function savePhoto(image, detail) {
    photoBusy.value = true;
    const { error } = await authClient.updateUser({ image });
    photoBusy.value = false;

    if (error) toast.add({ severity: 'error', summary: 'Photo not saved', detail: error.message || 'Please try again.', life: 4000 });
    else toast.add({ severity: 'success', summary: 'Photo updated', detail, life: 3000 });
}

function photoError() {
    photoBusy.value = false;
    toast.add({ severity: 'error', summary: 'Upload failed', detail: 'Could not upload the photo. Please try again later.', life: 6000 });
}

async function changePhoto() {
    photoBusy.value = true;
    try {
        await openAvatarPicker({ onUpload: (file) => savePhoto(avatarUrl(file.handle), 'Your new photo is saved.'), onError: photoError });
    } catch {
        photoError(); // the Filestack library failed to load
        return;
    }
    photoBusy.value = false;
}
</script>

<template>
    <Form :key="formKey" v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate @submit="onSubmit">
        <SettingsSection title="Profile" description="How you appear to others.">
            <SettingsRow label="Photo" :description="isDemoFilestackKey ? 'Square, up to 10 MB. Saved right away. Demo mode: uploads go to Filestack\'s shared demo account.' : 'Square, up to 10 MB. Saved right away.'">
                <div class="flex flex-wrap items-center gap-4">
                    <Avatar :image="avatar" size="xlarge" shape="circle" class="overflow-hidden" />
                    <Button type="button" label="Change photo" icon="pi pi-upload" severity="secondary" outlined :loading="photoBusy" @click="changePhoto" />
                    <Button v-if="hasPhoto" type="button" label="Remove" icon="pi pi-trash" severity="danger" text :disabled="photoBusy" @click="savePhoto(null, 'Your photo was removed.')" />
                </div>
            </SettingsRow>

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
