<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// PLACEHOLDER ARTICLES: the link texts are sample copy and aren't translated. Replace them with real
// help articles, and add those titles to the locale files.
const SAMPLE_ARTICLES = ['Lorem ipsum dolor', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'];

const categories = computed(() => [
    { id: 'getting-started', title: t('help.gettingStarted'), icon: 'pi pi-power-off' },
    { id: 'transactions', title: t('help.transactions'), icon: 'pi pi-arrows-h' },
    { id: 'profile', title: t('help.profile'), icon: 'pi pi-user' },
    { id: 'billing', title: t('help.billing'), icon: 'pi pi-money-bill' },
    { id: 'integrations', title: t('help.integrations'), icon: 'pi pi-database' },
    { id: 'security', title: t('help.security'), icon: 'pi pi-lock', link: { label: t('nav.terms'), to: { name: 'terms' } } }
]);
</script>

<template>
    <div>
        <div class="card">
            <div class="relative overflow-hidden h-80 bg-primary text-primary-contrast flex flex-col items-center justify-center rounded mb-20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute w-full top-0 left-0">
                    <path
                        fill="var(--p-primary-600)"
                        fillOpacity="1"
                        d="M0,64L48,90.7C96,117,192,171,288,208C384,245,480,267,576,256C672,245,768,203,864,165.3C960,128,1056,96,1152,74.7C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    ></path>
                </svg>
                <h1 class="font-bold mt-0 mb-8 text-4xl z-10">{{ $t('help.title') }}</h1>
                <IconField class="w-9/12 md:w-6/12">
                    <InputIcon class="pi pi-search" />
                    <InputText id="name" type="text" :placeholder="$t('common.search')" :aria-label="$t('common.search')" :style="{ borderRadius: '2rem' }" class="w-full" />
                </IconField>
            </div>

            <div class="grid grid-cols-12 gap-4 mb-8">
                <div v-for="category in categories" :key="category.id" class="col-span-12 md:col-span-4 mb-8">
                    <div class="flex flex-col items-center">
                        <span class="inline-flex items-center justify-center rounded-full w-20 h-20 bg-primary-100 mb-8">
                            <i :class="[category.icon, 'text-4xl! text-primary-700']"></i>
                        </span>
                        <div class="text-2xl mb-4 font-medium">{{ category.title }}</div>
                        <ul class="list-none m-0 p-0 text-center">
                            <li v-if="category.link" class="leading-normal mb-1">
                                <router-link :to="category.link.to" class="text-surface-500 dark:text-surface-400 hover:text-primary">{{ category.link.label }}</router-link>
                            </li>
                            <li v-for="(article, index) in category.link ? SAMPLE_ARTICLES.slice(1) : SAMPLE_ARTICLES" :key="article" :class="['leading-normal', index === SAMPLE_ARTICLES.length - 1 - (category.link ? 1 : 0) ? 'mb-4' : 'mb-1']">
                                <a class="text-surface-500 dark:text-surface-400 hover:text-primary cursor-pointer">{{ article }}</a>
                            </li>
                            <li>
                                <a class="text-primary hover:underline cursor-pointer font-medium">{{ $t('help.viewAll') }}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
