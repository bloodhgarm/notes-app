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
@use '~/assets/styles/tokens' as *;

.base-input {
  width: 100%;
  min-height: $control-height-lg;
  padding: $space-2-5 $space-3;
  border: $border-width solid $color-border-control;
  border-radius: $radius-lg;
  color: $color-text-primary;
  background: $color-surface-raised;
  box-shadow: $shadow-control;
  font: inherit;
  line-height: $line-height-control;
  transition:
    border-color $duration-fast $easing-standard,
    box-shadow $duration-fast $easing-standard;
}
.base-input::placeholder {
  color: $color-text-placeholder;
}
.base-input:hover:not(:disabled) {
  border-color: $color-border-strong;
}
.base-input:focus {
  border-color: $color-primary;
  outline: 0;
  box-shadow: 0 0 0 $focus-ring-width $focus-ring-control;
}
.base-input:disabled {
  color: $color-disabled-text;
  background: $color-disabled-surface;
  cursor: not-allowed;
}
.base-input--invalid {
  border-color: $color-danger;
}
.base-input--invalid:focus {
  box-shadow: 0 0 0 $focus-ring-width $focus-ring-danger;
}
</style>
