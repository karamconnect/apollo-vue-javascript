<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useSettings } from './useSettings';

const toast = useToast();
const { settings } = useSettings();

const form = ref({ ...settings.preferences });

const languages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' }
];

const timezones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'];

function reset() {
    form.value = { ...settings.preferences };
}

function save() {
    Object.assign(settings.preferences, form.value);
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Your preferences have been updated.', life: 3000 });
}
</script>

<template>
    <SettingsSection title="Preferences" description="Regional and language settings.">
        <SettingsRow label="Language" for="language">
            <Select v-model="form.language" inputId="language" :options="languages" optionLabel="label" optionValue="value" class="w-full md:w-80" />
        </SettingsRow>

        <SettingsRow label="Timezone" description="Used for dates and your daily schedule." for="timezone">
            <Select v-model="form.timezone" inputId="timezone" :options="timezones" filter class="w-full md:w-80" />
        </SettingsRow>

        <template #actions>
            <Button label="Cancel" severity="secondary" outlined @click="reset" />
            <Button label="Save" icon="pi pi-check" @click="save" />
        </template>
    </SettingsSection>
</template>
