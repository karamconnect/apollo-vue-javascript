import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { installFlags } from '@/flags';
import { i18n, installI18n, syncPrimeVueLocale } from '@/i18n';
import { loadPreset } from '@/layout/theme';
import { installPageTitle } from '@/router/title';
import { useLayoutStore } from '@/stores/layout';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
installFlags(app);
const localeReady = installI18n(app); // saved UI language (Settings > Preferences)
installPageTitle(router, i18n); // browser tab title per page, in the current language

const layout = useLayoutStore();

// Only the saved theme preset and language are downloaded at startup, so mount once both have loaded.
Promise.all([loadPreset(layout.config.preset), localeReady])
    .then(([preset]) => {
        app.use(PrimeVue, {
            theme: {
                preset,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        });
        syncPrimeVueLocale(app);
        app.use(ToastService);
        app.use(ConfirmationService);

        // Restore the saved theme (primary/surface colors, dark mode) before first render.
        return layout.applyTheme();
    })
    .finally(() => app.mount('#app'));
