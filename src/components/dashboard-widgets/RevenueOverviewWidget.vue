<script setup>
import { useLayoutStore } from '@/stores/layout';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const layout = useLayoutStore();
const { t, locale } = useI18n();

const weeks = ref([
    {
        value: 0,
        data: [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ]
    },
    {
        value: 1,
        data: [
            [35, 19, 40, 61, 16, 55, 30],
            [48, 78, 10, 29, 76, 77, 10]
        ]
    }
]);

const selectedWeek = ref(weeks.value[0]);
const weekOptions = computed(() => [
    { label: t('dashboard.lastWeek'), value: 0 },
    { label: t('dashboard.thisWeek'), value: 1 }
]);

// Monday to Sunday, abbreviated in the UI language (5 January 1970 was a Monday).
function weekdayLabels() {
    const format = new Intl.DateTimeFormat(locale.value, { weekday: 'short', timeZone: 'UTC' });
    return Array.from({ length: 7 }, (_, day) => format.format(Date.UTC(1970, 0, 5 + day)).toUpperCase());
}

const barOptions = ref({});
const barData = ref({});

function onWeekChange(value) {
    selectedWeek.value = weeks.value[value];
    let newBarData = { ...barData.value };
    newBarData.datasets[0].data = selectedWeek.value.data[0];
    newBarData.datasets[1].data = selectedWeek.value.data[1];
    barData.value = newBarData;
    initChart();
}

function initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    barData.value = {
        labels: weekdayLabels(),
        datasets: [
            {
                label: t('dashboard.revenue'),
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                barThickness: 12,
                borderRadius: 12,
                data: selectedWeek.value.data[0]
            },
            {
                label: t('dashboard.profit'),
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                barThickness: 12,
                borderRadius: 12,
                data: selectedWeek.value.data[1]
            }
        ]
    };

    barOptions.value = {
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
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
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
        <div class="flex items-start justify-between mb-12">
            <span class="text-surface-900 dark:text-surface-0 text-xl font-semibold">{{ $t('dashboard.revenueOverview') }}</span>
            <Select :options="weekOptions" :modelValue="selectedWeek.value" class="min-w-40" optionLabel="label" optionValue="value" :aria-label="$t('dashboard.revenueOverview')" @update:modelValue="(value) => onWeekChange(value)"></Select>
        </div>
        <Chart type="bar" :height="300" :data="barData" :options="barOptions"></Chart>
    </div>
</template>
