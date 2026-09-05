<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{ modelValue: string; invalid?: boolean }>(), { invalid: false })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    v-bind="$attrs"
    class="base-input"
    :class="{ 'base-input--invalid': invalid }"
    :value="modelValue"
    :aria-invalid="invalid || undefined"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped lang="scss">
.base-input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #1e293b;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  font: inherit;
  line-height: 1.4;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.base-input::placeholder {
  color: #94a3b8;
}
.base-input:hover:not(:disabled) {
  border-color: #94a3b8;
}
.base-input:focus {
  border-color: #2563eb;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
}
.base-input:disabled {
  color: #94a3b8;
  background: #f1f5f9;
  cursor: not-allowed;
}
.base-input--invalid {
  border-color: #dc2626;
}
.base-input--invalid:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.16);
}
</style>
