<script setup>
import { ProductService } from '@/service/ProductService';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const products = ref([]);

const salesTableRef = ref(null);

const filterSalesTable = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function exportCSV() {
    salesTableRef.value.exportCSV();
}

function statusLabel(inventoryStatus) {
    switch (inventoryStatus.toLowerCase()) {
        case 'instock':
            return t('dashboard.inStock');
        case 'lowstock':
            return t('dashboard.lowStock');
        case 'outofstock':
            return t('dashboard.outOfStock');
        default:
            return inventoryStatus;
    }
}

function getBadgeSeverity(inventoryStatus) {
    switch (inventoryStatus.toLowerCase()) {
        case 'instock':
            return 'success';
        case 'lowstock':
            return 'warn';
        case 'outofstock':
            return 'danger';
        default:
            return 'info';
    }
}

onMounted(() => {
    ProductService.getProductsSmall().then((data) => (products.value = data));
});
</script>

<template>
    <div class="card">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4 md:mb-0">{{ $t('dashboard.recentSales') }}</div>
            <div class="inline-flex items-center">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText type="text" v-model="filterSalesTable.global.value" :placeholder="$t('common.search')" :aria-label="$t('common.search')" :style="{ borderRadius: '2rem' }" class="w-full" />
                </IconField>
                <Button icon="pi pi-upload" class="mx-4 export-target-button" rounded v-tooltip="$t('dashboard.export')" :aria-label="$t('dashboard.export')" @click="exportCSV"></Button>
            </div>
        </div>
        <DataTable ref="salesTableRef" :value="products" dataKey="id" paginator :rows="5" v-model:filters="filterSalesTable">
            <template #empty>{{ $t('dashboard.noProducts') }}</template>
            <Column field="name" :header="$t('dashboard.name')" sortable :headerStyle="{ minWidth: '12rem' }">
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="category" :header="$t('dashboard.category')" sortable :headerStyle="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    {{ data.category }}
                </template>
            </Column>
            <Column field="price" :header="$t('dashboard.price')" sortable :headerStyle="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    {{ $n(data.price, 'currency') }}
                </template>
            </Column>
            <Column field="inventoryStatus" :header="$t('dashboard.status')" sortable :headerStyle="{ minWidth: '10rem' }">
                <template #body="{ data }">
                    <Tag :severity="getBadgeSeverity(data.inventoryStatus)" class="whitespace-nowrap">{{ statusLabel(data.inventoryStatus) }}</Tag>
                </template>
            </Column>
            <Column class="text-center">
                <template #body="{ data }">
                    <Button type="button" icon="pi pi-search" outlined rounded :aria-label="$t('dashboard.viewProduct', { name: data.name })"></Button>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
