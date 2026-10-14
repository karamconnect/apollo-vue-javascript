<script setup>
// Full-screen status page with a coloured wave (Apollo's Error / Access Denied / Not Found pages).
defineProps({
    title: { type: String, required: true },
    message: { type: String, required: true },
    // PrimeVue palette name used for the wave, e.g. 'red', 'purple', 'orange'.
    color: { type: String, default: 'primary' },
    severity: { type: String, default: undefined }
});
</script>

<template>
    <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="min-h-screen min-w-[100vw] fixed left-0" :style="{ bottom: '-10rem' }" preserveAspectRatio="none">
        <rect x="0" y="0" width="960" height="540" fill="var(--surface-ground)"></rect>
        <path
            d="M0 331L26.7 321C53.3 311 106.7 291 160 291C213.3 291 266.7 311 320 329.5C373.3 348 426.7 365 480 373.2C533.3 381.3 586.7 380.7 640 373.8C693.3 367 746.7 354 800 341.2C853.3 328.3 906.7 315.7 933.3 309.3L960 303L960 541L933.3 541C906.7 541 853.3 541 800 541C746.7 541 693.3 541 640 541C586.7 541 533.3 541 480 541C426.7 541 373.3 541 320 541C266.7 541 213.3 541 160 541C106.7 541 53.3 541 26.7 541L0 541Z"
            :fill="`var(--p-${color}-500)`"
        ></path>
    </svg>
    <main class="px-8 min-h-screen flex justify-center items-center -mt-20 sm:mt-0">
        <div class="z-10 text-center">
            <h1 class="mt-0 mb-6 text-surface-900 dark:text-surface-0 font-bold text-6xl sm:text-8xl">{{ title }}</h1>
            <p class="leading-normal mt-0 mb-8 text-surface-700 dark:text-surface-100 text-xl font-medium">{{ message }}</p>
            <slot>
                <Button asChild v-slot="slotProps" :severity raised>
                    <RouterLink to="/" :class="[slotProps.class, 'font-medium']">Go to Dashboard</RouterLink>
                </Button>
            </slot>
        </div>
    </main>
</template>
