<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    for: {
        type: String,
        default: null
    }
});
</script>

<template>
    <div class="flex flex-col md:flex-row items-start gap-4 md:gap-8 pb-6 border-b border-dashed border-surface-200 dark:border-surface-700 last:border-b-0 last:pb-0">
        <div class="w-full md:w-72 shrink-0 flex flex-col gap-1">
            <label :for="$props.for" class="text-surface-950 dark:text-surface-0 font-medium">{{ label }}</label>
            <span v-if="description" class="text-surface-500 dark:text-surface-400 text-sm">{{ description }}</span>
        </div>
        <div class="flex-1 w-full">
            <slot />
        </div>
    </div>
</template>
