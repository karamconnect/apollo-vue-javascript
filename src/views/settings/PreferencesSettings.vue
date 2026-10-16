<script setup>
import SettingsRow from '@/components/settings/SettingsRow.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import { LOCALES, setLocale } from '@/i18n';
import { usePreferencesStore } from '@/stores/preferences';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const toast = useToast();
const preferences = usePreferencesStore();
const { t } = useI18n();

const form = ref({ ...preferences.regional });

const languages = LOCALES.map((locale) => ({ label: locale.name, value: locale.code }));

const timezones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'];

function reset() {
    form.value = { ...preferences.regional };
}

async function save() {
    preferences.updateRegional(form.value);
    // Switch now (rather than waiting for the store watcher) so the toast is already in the new language.
    await setLocale(preferences.regional.language);
    toast.add({ severity: 'success', summary: t('common.saved'), detail: t('preferences.savedDetail'), life: 3000 });
}
</script>

<template>
    <SettingsSection :title="t('nav.preferences')" :description="t('preferences.description')">
        <SettingsRow :label="t('preferences.language')" for="language">
            <Select v-model="form.language" inputId="language" :options="languages" optionLabel="label" optionValue="value" class="w-full md:w-80" />
        </SettingsRow>

        <SettingsRow :label="t('preferences.timezone')" :description="t('preferences.timezoneDescription')" for="timezone">
            <Select v-model="form.timezone" inputId="timezone" :options="timezones" filter class="w-full md:w-80" />
        </SettingsRow>

        <template #actions>
            <Button :label="t('common.cancel')" severity="secondary" outlined @click="reset" />
            <Button :label="t('common.save')" icon="pi pi-check" @click="save" />
        </template>
    </SettingsSection>
</template>
