<script setup>
import { ProductService } from '@/service/ProductService';
import { onMounted, ref } from 'vue';

const products = ref([]);

onMounted(() => {
    ProductService.getProductsSmall().then((data) => (products.value = data));
});
</script>

<template>
    <div class="card h-full">
        <h2 class="text-surface-900 dark:text-surface-0 text-xl font-semibold mt-0 mb-4">{{ $t('dashboard.topProducts') }}</h2>
        <ul class="list-none p-0 m-0">
            <template v-for="(product, i) in products" :key="{ i }">
                <li v-if="i < 6" class="flex items-center justify-between p-4">
                    <div class="inline-flex items-center">
                        <img :src="`/demo/images/product/${product.image}`" :alt="product.name" width="75" class="shadow shrink-0" />
                        <div class="flex flex-col ms-4">
                            <span class="font-medium text-lg mb-1">{{ product.name }}</span>
                            <!-- Display only: the stars are hidden from assistive tech and the tab order; the text says the rating. -->
                            <Rating v-model="product.rating" readonly :cancel="false" inert aria-hidden="true"></Rating>
                            <span class="sr-only">{{ $t('dashboard.rating', { n: product.rating }) }}</span>
                        </div>
                    </div>
                    <span class="ms-auto font-semibold text-xl p-text-secondary">{{ $n(product.price, 'currency') }}</span>
                </li>
            </template>
        </ul>
    </div>
</template>
