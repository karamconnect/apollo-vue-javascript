import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { presets } from '@/layout/theme';
import { useLayoutStore } from '@/stores/layout';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const layout = useLayoutStore();

app.use(PrimeVue, {
    theme: {
        preset: presets[layout.config.preset] ?? presets.Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

// Restore the saved theme (primary/surface colors, dark mode) before first render.
layout.applyTheme();

app.mount('#app');
