<script setup>
import { ref, watch } from 'vue';
import { VueTelInput } from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';

// International phone input (vue-tel-input) styled like PrimeVue inputs. v-model is the number in
// E.164 form ("+14155550123"), or '' when empty; the field itself shows the national format.
// Imported where it's used (not installed globally), so its country data only loads with that page.
const props = defineProps({
    modelValue: { type: String, default: '' },
    inputId: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    ariaDescribedby: { type: String, default: undefined }
});

const emit = defineEmits(['update:modelValue', 'blur']);

// Country preselected from the browser language (en-GB -> GB), US if it has none.
function browserCountry() {
    try {
        return new Intl.Locale(navigator.language).maximize().region ?? 'US';
    } catch {
        return 'US';
    }
}

const display = ref(props.modelValue);

// Follow outside changes (e.g. the form being reset), but not our own emits.
watch(
    () => props.modelValue,
    (value) => {
        if (value !== lastEmitted) display.value = value;
    }
);

let lastEmitted = props.modelValue;

function onInput(_text, phone) {
    lastEmitted = phone?.number ?? (display.value ? display.value : '');
    emit('update:modelValue', lastEmitted);
}
</script>

<template>
    <VueTelInput
        v-model="display"
        mode="international"
        :defaultCountry="browserCountry()"
        :autoDefaultCountry="false"
        :inputOptions="{ id: inputId, name: 'phone', autocomplete: 'tel', 'aria-invalid': invalid || undefined, 'aria-describedby': ariaDescribedby }"
        :dropdownOptions="{ showDialCodeInSelection: false, showFlags: true, showSearchBox: true, ariaLabel: 'Country' }"
        :styleClasses="['phone-input', { 'phone-input-invalid': invalid }]"
        validCharactersOnly
        @on-input="onInput"
        @blur="emit('blur')"
    />
</template>

<style scoped>
/* Match PrimeVue inputs via its global (semantic) tokens, so presets and dark mode apply. Component tokens
   like --p-select-* only exist once that component is on the page, so they aren't used here.
   The root (.phone-input) gets this component's scope id, so it needs no :deep(); its children do. */
.phone-input {
    background: var(--p-form-field-background);
    border: 1px solid var(--p-form-field-border-color);
    border-radius: var(--p-form-field-border-radius);
    box-shadow: var(--p-form-field-shadow);
    color: var(--p-form-field-color);
    transition: border-color var(--p-form-field-transition-duration);
}

.phone-input:hover {
    border-color: var(--p-form-field-hover-border-color);
}

.phone-input:focus-within {
    border-color: var(--p-form-field-focus-border-color);
    box-shadow: none;
}

.phone-input.phone-input-invalid {
    border-color: var(--p-form-field-invalid-border-color);
}

.phone-input :deep(.vti__input) {
    background: transparent;
    color: inherit;
    padding: var(--p-form-field-padding-y) var(--p-form-field-padding-x) var(--p-form-field-padding-y) 0.5rem;
    border-radius: 0 var(--p-form-field-border-radius) var(--p-form-field-border-radius) 0;
}

.phone-input :deep(.vti__input::placeholder) {
    color: var(--p-form-field-placeholder-color);
}

.phone-input :deep(.vti__dropdown) {
    padding: 0 0.25rem 0 var(--p-form-field-padding-x);
    border-radius: var(--p-form-field-border-radius) 0 0 var(--p-form-field-border-radius);
}

.phone-input :deep(.vti__dropdown:hover),
.phone-input :deep(.vti__dropdown.open) {
    background: var(--p-content-hover-background);
}

.phone-input :deep(.vti__dropdown-list) {
    z-index: 10;
    background: var(--p-overlay-select-background);
    border: 1px solid var(--p-overlay-select-border-color);
    border-radius: var(--p-overlay-select-border-radius);
    box-shadow: var(--p-overlay-select-shadow);
    color: var(--p-overlay-select-color);
    max-width: min(390px, 90vw);
}

.phone-input :deep(.vti__dropdown-item.highlighted) {
    background: var(--p-list-option-focus-background);
    color: var(--p-list-option-focus-color);
}

.phone-input :deep(.vti__search_box) {
    background: var(--p-form-field-background);
    border: 1px solid var(--p-form-field-border-color);
    border-radius: var(--p-form-field-border-radius);
    color: var(--p-form-field-color);
}
</style>
