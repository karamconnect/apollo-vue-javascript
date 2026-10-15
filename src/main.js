import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { loadPreset } from '@/layout/theme';
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

// Only the saved theme preset is downloaded at startup (see layout/theme.js), so mount once it has loaded.
loadPreset(layout.config.preset)
    .then((preset) => {
        app.use(PrimeVue, {
            theme: {
                preset,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        });
        app.use(ToastService);
        app.use(ConfirmationService);

        // Restore the saved theme (primary/surface colors, dark mode) before first render.
        return layout.applyTheme();
    })
    .finally(() => app.mount('#app'));
