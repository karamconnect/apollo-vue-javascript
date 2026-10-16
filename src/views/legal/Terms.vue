<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// Public page (no auth meta): reachable signed in or out. Linked from Register and Help.
// PLACEHOLDER COPY: replace with your own, legally reviewed terms (in every language) before launch.
const router = useRouter();
const { t, locale } = useI18n();

const LAST_UPDATED = new Date(2026, 9, 14);
const CONTACT_EMAIL = 'support@example.com';

const sections = computed(() => [
    { id: 'acceptance', title: t('terms.acceptanceTitle'), body: t('terms.acceptanceBody') },
    { id: 'account', title: t('terms.accountTitle'), body: t('terms.accountBody') },
    { id: 'use', title: t('terms.useTitle'), body: t('terms.useBody') },
    { id: 'content', title: t('terms.contentTitle'), body: t('terms.contentBody') },
    { id: 'availability', title: t('terms.availabilityTitle'), body: t('terms.availabilityBody') },
    { id: 'ending', title: t('terms.endingTitle'), body: t('terms.endingBody') },
    { id: 'liability', title: t('terms.liabilityTitle'), body: t('terms.liabilityBody') },
    { id: 'contact', title: t('terms.contactTitle'), body: t('terms.contactBody', { email: CONTACT_EMAIL }) }
]);

const lastUpdated = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(LAST_UPDATED));

function goBack() {
    // Opened in a new tab from Register there is no history to go back to.
    if (window.history.state?.back) router.back();
    else router.push('/');
}
</script>

<template>
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 px-4 py-12">
        <main class="max-w-3xl mx-auto bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded p-6 md:p-12">
            <Button :label="$t('common.back')" icon="pi pi-arrow-left" text size="small" class="mb-6 -ml-3" @click="goBack" />

            <h1 class="mt-0 mb-2 text-3xl font-bold text-surface-900 dark:text-surface-0">{{ $t('nav.terms') }}</h1>
            <p class="mt-0 mb-8 text-surface-500 dark:text-surface-400">{{ $t('terms.lastUpdated', { date: lastUpdated }) }}</p>

            <ol class="m-0 pl-6 flex flex-col gap-6">
                <li v-for="section in sections" :key="section.id" class="pl-2">
                    <h2 class="mt-0 mb-2 text-lg font-semibold text-surface-900 dark:text-surface-0">{{ section.title }}</h2>
                    <p class="m-0 leading-relaxed text-surface-700 dark:text-surface-200">{{ section.body }}</p>
                </li>
            </ol>
        </main>
    </div>
</template>
