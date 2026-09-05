<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'secondary',
    disabled: false,
  },
)
</script>

<template>
  <button class="button" :class="`button--${variant}`" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.button {
  min-height: $control-height-md;
  padding: 0 $space-4;
  border: $border-width solid transparent;
  border-radius: $radius-lg;
  font: inherit;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition:
    color $duration-fast $easing-standard,
    border-color $duration-fast $easing-standard,
    background-color $duration-fast $easing-standard,
    transform $duration-press $easing-standard;
}
.button:focus-visible {
  outline: $focus-ring-width solid $focus-ring;
  outline-offset: $focus-ring-offset;
}
.button:disabled {
  opacity: $opacity-disabled;
  cursor: not-allowed;
}
.button:not(:disabled):active {
  transform: translateY($pressed-offset);
}
.button--primary {
  color: $color-text-on-accent;
  background: $color-primary;
}
.button--primary:hover:not(:disabled) {
  background: $color-primary-hover;
}
.button--primary:active:not(:disabled) {
  background: $color-primary-active;
}
.button--secondary {
  color: $color-text-primary;
  border-color: $color-border-control;
  background: $color-surface-raised;
}
.button--secondary:hover:not(:disabled) {
  border-color: $color-border-strong;
  background: $color-surface-page;
}
.button--secondary:active:not(:disabled) {
  background: $color-surface-subtle;
}
.button--danger {
  color: $color-text-on-accent;
  background: $color-danger;
}
.button--danger:hover:not(:disabled) {
  background: $color-danger-hover;
}
.button--danger:active:not(:disabled) {
  background: $color-danger-active;
}
</style>
