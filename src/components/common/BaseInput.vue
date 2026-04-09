<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])
const generatedId = `input-${Math.random().toString(36).slice(2, 9)}`
const inputId = computed(() => props.id || props.name || generatedId)

function onInput(event) {
  emit('update:modelValue', event?.target?.value ?? '')
}
</script>

<template>
  <label class="base-input">
    <span v-if="label" class="label form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </span>

    <input
      :id="inputId"
      :name="name || inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :disabled="disabled"
      :class="{ error: Boolean(error) }"
      @input="onInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />

    <span v-if="error" class="error-text">{{ error }}</span>
    <span v-else-if="hint" class="hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.base-input {
  display: grid;
  gap: 0.35rem;
  font-size: 0.86rem;
}

.label {
  color: var(--fcc-text-muted);
  font-weight: 600;
}

.required {
  color: var(--color-danger);
}

input {
  width: 100%;
  border: 1px solid var(--fcc-border);
  border-radius: var(--fcc-radius-pill);
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  color: var(--fcc-text);
  background: var(--fcc-surface);
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--fcc-primary-400);
  background: var(--fcc-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fcc-primary-500) 10%, transparent);
}

input.error {
  border-color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 2%, var(--fcc-surface));
}

.hint {
  color: var(--fcc-text-muted);
  font-size: 0.78rem;
}

.error-text {
  color: var(--color-danger);
  font-size: 0.78rem;
}
</style>
