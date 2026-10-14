<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    }
});
</script>

<template>
    <div class="flex flex-col">
        <div class="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
            <div class="text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">{{ title }}</div>
            <div v-if="description" class="text-surface-500 dark:text-surface-400 mt-1">{{ description }}</div>
        </div>

        <div class="px-4 sm:px-6">
            <div class="border-t border-dashed border-surface-200 dark:border-surface-700"></div>
        </div>

        <div class="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <div class="flex flex-col gap-6">
                <slot />
            </div>

            <div v-if="$slots.actions" class="flex flex-col sm:flex-row sm:justify-end gap-3">
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>
