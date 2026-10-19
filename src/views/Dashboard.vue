<script setup>
import RecentSalesWidget from '@/components/dashboard-widgets/RecentSalesWidget.vue';
import RevenueOverviewWidget from '@/components/dashboard-widgets/RevenueOverviewWidget.vue';
import SalesByCategoryWidget from '@/components/dashboard-widgets/SalesByCategoryWidget.vue';
import StatsEcommerceWidget from '@/components/dashboard-widgets/StatsEcommerceWidget.vue';
import TopProductsWidget from '@/components/dashboard-widgets/TopProductsWidget.vue';
</script>

<template>
    <!-- The breadcrumb already shows the page name, so the heading is for screen readers only. -->
    <h1 class="sr-only">{{ $t('nav.dashboard') }}</h1>
    <div class="grid grid-cols-12 gap-8">
        <StatsEcommerceWidget />
        <div class="col-span-12 xl:col-span-9">
            <RevenueOverviewWidget />
        </div>
        <div class="col-span-12 xl:col-span-3">
            <SalesByCategoryWidget />
        </div>
        <div class="col-span-12 lg:col-span-7">
            <RecentSalesWidget />
        </div>
        <div class="col-span-12 lg:col-span-5">
            <TopProductsWidget />
        </div>
    </div>
</template>
