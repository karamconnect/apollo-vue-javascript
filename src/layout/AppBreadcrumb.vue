<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();
const { t, te } = useI18n();
const breadcrumbRoutes = ref([]);

function setBreadcrumbRoutes() {
    if (route.meta.breadcrumb) {
        breadcrumbRoutes.value = route.meta.breadcrumb;

        return;
    }

    breadcrumbRoutes.value = route.fullPath
        .split('/')
        .filter((item) => item !== '')
        .filter((item) => isNaN(Number(item)))
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}

watch(
    route,
    () => {
        setBreadcrumbRoutes();
    },
    { immediate: true }
);
</script>

<template>
    <nav class="layout-breadcrumb" :aria-label="$t('a11y.breadcrumb')">
        <ol>
            <template v-for="(breadcrumbRoute, i) in breadcrumbRoutes" :key="breadcrumbRoute">
                <li :aria-current="i === breadcrumbRoutes.length - 1 ? 'page' : undefined">{{ te(breadcrumbRoute) ? t(breadcrumbRoute) : breadcrumbRoute }}</li>
                <li v-if="i !== breadcrumbRoutes.length - 1" class="layout-breadcrumb-chevron" aria-hidden="true">/</li>
            </template>
        </ol>
    </nav>
</template>
