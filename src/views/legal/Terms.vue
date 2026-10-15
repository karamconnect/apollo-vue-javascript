<script setup>
import { useRouter } from 'vue-router';

// Public page (no auth meta): reachable signed in or out. Linked from Register and Help.
// PLACEHOLDER COPY: replace with your own, legally reviewed terms before launch.
const router = useRouter();

const LAST_UPDATED = 'October 14, 2026';

const sections = [
    {
        title: 'Acceptance of terms',
        body: 'By creating an account or using this application, you agree to these Terms and Conditions. If you do not agree, do not use the application.'
    },
    {
        title: 'Your account',
        body: 'You are responsible for the information you provide, for keeping your password secure, and for all activity under your account. Tell us promptly if you believe your account has been accessed without permission.'
    },
    {
        title: 'Acceptable use',
        body: 'Do not misuse the application: no attempts to break or bypass its security, interfere with other users, upload unlawful or harmful content, or use it in a way that breaks applicable laws.'
    },
    {
        title: 'Your content and data',
        body: 'You keep ownership of the content you add. You give us permission to store and process it only as needed to run the application. How we handle personal data is described in our Privacy Policy.'
    },
    {
        title: 'Availability and changes',
        body: 'We work to keep the application available and secure but cannot guarantee it will be uninterrupted or error-free. We may change or discontinue features, and may update these terms; continued use after an update means you accept the new terms.'
    },
    {
        title: 'Ending your account',
        body: 'You can delete your account at any time from Settings > Account. We may suspend or close accounts that break these terms.'
    },
    {
        title: 'Limitation of liability',
        body: 'To the extent permitted by law, the application is provided "as is" and we are not liable for indirect or consequential losses arising from its use.'
    },
    {
        title: 'Contact',
        body: 'Questions about these terms can be sent to support@example.com.'
    }
];

function goBack() {
    // Opened in a new tab from Register there is no history to go back to.
    if (window.history.state?.back) router.back();
    else router.push('/');
}
</script>

<template>
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 px-4 py-12">
        <main class="max-w-3xl mx-auto bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded p-6 md:p-12">
            <Button label="Back" icon="pi pi-arrow-left" text size="small" class="mb-6 -ml-3" @click="goBack" />

            <h1 class="mt-0 mb-2 text-3xl font-bold text-surface-900 dark:text-surface-0">Terms and Conditions</h1>
            <p class="mt-0 mb-8 text-surface-500 dark:text-surface-400">Last updated {{ LAST_UPDATED }}</p>

            <ol class="m-0 pl-6 flex flex-col gap-6">
                <li v-for="section in sections" :key="section.title" class="pl-2">
                    <h2 class="mt-0 mb-2 text-lg font-semibold text-surface-900 dark:text-surface-0">{{ section.title }}</h2>
                    <p class="m-0 leading-relaxed text-surface-700 dark:text-surface-200">{{ section.body }}</p>
                </li>
            </ol>
        </main>
    </div>
</template>
