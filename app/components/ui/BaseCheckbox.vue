<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{ modelValue: boolean; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="base-checkbox" :class="{ 'base-checkbox--disabled': disabled }">
    <input
      v-bind="$attrs"
      class="base-checkbox__input"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="base-checkbox__control" aria-hidden="true">✓</span>
  </label>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.base-checkbox {
  position: relative;
  display: inline-flex;
  width: $checkbox-size;
  height: $checkbox-size;
  flex: 0 0 $checkbox-size;
  cursor: pointer;
}
.base-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}
.base-checkbox__control {
  display: grid;
  width: $checkbox-size;
  height: $checkbox-size;
  place-items: center;
  border: $border-width solid $color-border-strong;
  border-radius: $radius-sm;
  color: transparent;
  background: $color-surface-raised;
  font-size: $font-size-checkbox;
  font-weight: $font-weight-extrabold;
  line-height: $line-height-tight;
  transition:
    background $duration-fast $easing-standard,
    border-color $duration-fast $easing-standard,
    box-shadow $duration-fast $easing-standard;
}
.base-checkbox:hover:not(.base-checkbox--disabled) .base-checkbox__control {
  border-color: $color-primary;
}
.base-checkbox__input:checked + .base-checkbox__control {
  border-color: $color-primary;
  color: $color-text-on-accent;
  background: $color-primary;
}
.base-checkbox__input:focus-visible + .base-checkbox__control {
  outline: $focus-ring-width solid $focus-ring;
  outline-offset: $focus-ring-offset;
}
.base-checkbox--disabled {
  cursor: not-allowed;
}
.base-checkbox--disabled .base-checkbox__control {
  border-color: $color-disabled-border;
  color: $color-disabled-text;
  background: $color-disabled-surface;
}
.base-checkbox--disabled .base-checkbox__input:checked + .base-checkbox__control {
  border-color: $color-border-strong;
  color: $color-text-on-accent;
  background: $color-border-strong;
}
</style>
