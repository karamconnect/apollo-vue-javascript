<script setup>
import { authClient } from '@/auth/client';
import { authErrorMessage } from '@/auth/errors';
import { useAvatar } from '@/auth/useAvatar';
import FieldError from '@/components/forms/FieldError.vue';
import PhoneInput from '@/components/forms/PhoneInput.vue';
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useUserStore } from '@/stores/user';
import { avatarUrl, isDemoFilestackKey, openAvatarPicker } from '@/service/filestack';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useFlags } from 'flagsmith-vue';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { profileSchema } from './profile-schema';

const toast = useToast();
const user = useUserStore();
const { t } = useI18n();
const session = authClient.useSession();
const avatar = useAvatar();
const { profile_photo_upload: photoUploadFlag } = useFlags(['profile_photo_upload']);

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
        toast.add({ severity: 'error', summary: t('settings.profile.notSaved'), detail: t('settings.profile.fixFields'), life: 3000 });
        return;
    }

    user.updateProfile(values);
    resetForm();
    toast.add({ severity: 'success', summary: t('common.saved'), detail: t('settings.profile.savedDetail'), life: 3000 });
}

// The photo is saved straight to the auth user (`user.image`), not with the form's Save button.
const photoBusy = ref(false);
const hasPhoto = computed(() => Boolean(session.value.data?.user.image));

async function savePhoto(image, detail) {
    photoBusy.value = true;
    const { error } = await authClient.updateUser({ image });
    photoBusy.value = false;

    if (error) toast.add({ severity: 'error', summary: t('settings.profile.photoNotSaved'), detail: authErrorMessage(error), life: 4000 });
    else toast.add({ severity: 'success', summary: t('settings.profile.photoUpdated'), detail, life: 3000 });
}

function photoError() {
    photoBusy.value = false;
    toast.add({ severity: 'error', summary: t('settings.profile.uploadFailed'), detail: t('settings.profile.uploadFailedDetail'), life: 6000 });
}

async function changePhoto() {
    photoBusy.value = true;
    try {
        await openAvatarPicker({ onUpload: (file) => savePhoto(avatarUrl(file.handle), t('settings.profile.photoSaved')), onError: photoError });
    } catch {
        photoError(); // the Filestack library failed to load
        return;
    }
    photoBusy.value = false;
}
</script>

<template>
    <Form :key="formKey" v-slot="$form" :initialValues :resolver :validateOnValueUpdate="false" validateOnBlur novalidate @submit="onSubmit">
        <SettingsSection :title="$t('nav.profile')" :description="$t('settings.profile.description')">
            <SettingsRow
                v-if="photoUploadFlag?.enabled"
                :label="$t('settings.profile.photo')"
                :description="isDemoFilestackKey ? `${$t('settings.profile.photoDescription')} ${$t('settings.profile.photoDemo')}` : $t('settings.profile.photoDescription')"
            >
                <div class="flex flex-wrap items-center gap-4">
                    <Avatar :image="avatar" size="xlarge" shape="circle" class="overflow-hidden" />
                    <Button type="button" :label="$t('settings.profile.changePhoto')" icon="pi pi-upload" severity="secondary" outlined :loading="photoBusy" @click="changePhoto" />
                    <Button v-if="hasPhoto" type="button" :label="$t('settings.profile.removePhoto')" icon="pi pi-trash" severity="danger" text :disabled="photoBusy" @click="savePhoto(null, $t('settings.profile.photoRemoved'))" />
                </div>
            </SettingsRow>

            <SettingsRow :label="$t('settings.profile.name')" for="firstName">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputText id="firstName" name="firstName" :placeholder="$t('settings.profile.firstName')" :aria-label="$t('settings.profile.firstName')" fluid />
                    <InputText name="lastName" :placeholder="$t('settings.profile.lastName')" :aria-label="$t('settings.profile.lastName')" fluid />
                </div>
            </SettingsRow>

            <SettingsRow :label="$t('settings.profile.email')" :description="$t('settings.profile.emailDescription')" for="email">
                <div class="flex flex-col gap-1">
                    <InputText id="email" name="email" type="email" autocomplete="email" :aria-describedby="$form.email?.invalid ? 'email-error' : undefined" fluid />
                    <FieldError id="email-error" :field="$form.email" />
                </div>
            </SettingsRow>

            <SettingsRow :label="$t('settings.profile.phone')" :description="$t('settings.profile.phoneDescription')" for="phone">
                <FormField v-slot="$field" name="phone" class="flex flex-col gap-1">
                    <PhoneInput :modelValue="$field.value" inputId="phone" :invalid="$field.invalid" :ariaDescribedby="$field.invalid ? 'phone-error' : undefined" @update:modelValue="(value) => $field.onInput({ value })" @blur="$field.onBlur" />
                    <FieldError id="phone-error" :field="$field" />
                </FormField>
            </SettingsRow>

            <SettingsRow :label="$t('settings.profile.bio')" :description="$t('settings.profile.bioDescription')" for="bio">
                <Textarea id="bio" name="bio" rows="4" autoResize fluid />
            </SettingsRow>

            <template #actions>
                <Button type="button" :label="$t('common.cancel')" severity="secondary" outlined @click="resetForm" />
                <Button type="submit" :label="$t('common.save')" icon="pi pi-check" />
            </template>
        </SettingsSection>
    </Form>
</template>
