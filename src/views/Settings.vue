<script setup>
import AppConfig from '@/layout/AppConfig.vue';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();

const profile = ref({
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
});

const preferences = ref({
    language: 'en',
    timezone: 'UTC'
});

const languages = ref([
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' }
]);

const timezones = ref(['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo']);

const notifications = ref([
    { key: 'email', label: 'Email notifications', description: 'Receive updates and alerts by email.', enabled: true },
    { key: 'push', label: 'Push notifications', description: 'Receive notifications in the browser.', enabled: false },
    { key: 'digest', label: 'Weekly digest', description: 'A summary of activity every Monday.', enabled: true }
]);

function save() {
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Your settings have been updated.', life: 3000 });
}
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-8">
            <div class="card">
                <div class="text-xl font-semibold mb-6">Profile</div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
                        <label for="firstName" class="font-medium">First name</label>
                        <InputText id="firstName" v-model="profile.firstName" fluid />
                    </div>
                    <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
                        <label for="lastName" class="font-medium">Last name</label>
                        <InputText id="lastName" v-model="profile.lastName" fluid />
                    </div>
                    <div class="col-span-12 flex flex-col gap-2">
                        <label for="email" class="font-medium">Email</label>
                        <InputText id="email" v-model="profile.email" type="email" fluid />
                    </div>
                    <div class="col-span-12 flex flex-col gap-2">
                        <label for="bio" class="font-medium">Bio</label>
                        <Textarea id="bio" v-model="profile.bio" rows="4" autoResize fluid />
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="text-xl font-semibold mb-6">Preferences</div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
                        <label for="language" class="font-medium">Language</label>
                        <Select v-model="preferences.language" inputId="language" :options="languages" optionLabel="label" optionValue="value" fluid />
                    </div>
                    <div class="col-span-12 md:col-span-6 flex flex-col gap-2">
                        <label for="timezone" class="font-medium">Timezone</label>
                        <Select v-model="preferences.timezone" inputId="timezone" :options="timezones" filter fluid />
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="text-xl font-semibold mb-6">Appearance</div>
                <AppConfig />
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4">
            <div class="card">
                <div class="text-xl font-semibold mb-6">Notifications</div>
                <ul class="list-none m-0 p-0 flex flex-col gap-6">
                    <li v-for="item in notifications" :key="item.key" class="flex items-center justify-between gap-4">
                        <div>
                            <label :for="`notify-${item.key}`" class="font-medium block mb-1">{{ item.label }}</label>
                            <span class="text-surface-500 dark:text-surface-400 text-sm">{{ item.description }}</span>
                        </div>
                        <ToggleSwitch v-model="item.enabled" :inputId="`notify-${item.key}`" />
                    </li>
                </ul>
            </div>

            <Button label="Save changes" icon="pi pi-check" class="w-full" @click="save" />
        </div>
    </div>
</template>
