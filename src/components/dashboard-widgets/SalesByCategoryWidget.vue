<script setup>
import { useLayoutStore } from '@/stores/layout';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const layout = useLayoutStore();
const { t, locale } = useI18n();

const pieOptions = ref({});
const pieData = ref({});

function initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    pieData.value = {
        labels: [t('dashboard.electronics'), t('dashboard.fashion'), t('dashboard.household')],
        datasets: [
            {
                data: [300, 50, 100],
                backgroundColor: [documentStyle.getPropertyValue('--p-primary-700'), documentStyle.getPropertyValue('--p-primary-400'), documentStyle.getPropertyValue('--p-primary-100')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-primary-600'), documentStyle.getPropertyValue('--p-primary-300'), documentStyle.getPropertyValue('--p-primary-200')]
            }
        ]
    };
    pieOptions.value = {
        animation: {
            duration: 0
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    font: {
                        weight: 700
                    },
                    padding: 28
                },
                position: 'bottom'
            }
        }
    };
}

watch(
    [() => layout.config.primary, () => layout.config.surface, () => layout.isDarkTheme, locale],
    () => {
        initChart();
    },
    { immediate: true }
);
</script>

<template>
    <div class="card h-full">
        <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-12">{{ $t('dashboard.salesByCategory') }}</div>
        <Chart type="pie" :data="pieData" :height="300" :options="pieOptions"></Chart>
    </div>
</template>
