<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    disabled?: boolean
    variant?: 'neutral' | 'danger'
  }>(),
  {
    disabled: false,
    variant: 'neutral',
  },
)
</script>

<template>
  <button
    class="icon-button"
    :class="`icon-button--${variant}`"
    type="button"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.icon-button {
  display: inline-grid;
  width: $icon-button-size;
  height: $icon-button-size;
  flex: 0 0 $icon-button-size;
  place-items: center;
  border: 0;
  border-radius: $radius-md;
  color: $color-text-secondary;
  background: transparent;
  font: inherit;
  font-size: $font-size-icon;
  line-height: $line-height-tight;
  cursor: pointer;
  transition:
    color $duration-fast $easing-standard,
    background-color $duration-fast $easing-standard,
    transform $duration-press $easing-standard;
}

.icon-button:hover:not(:disabled) {
  background: $color-surface-subtle;
}

.icon-button:active:not(:disabled) {
  transform: translateY($pressed-offset);
  background: $color-border-default;
}

.icon-button:focus-visible {
  outline: $focus-ring-width solid $focus-ring;
  outline-offset: $focus-ring-offset;
}

.icon-button:disabled {
  opacity: $opacity-disabled;
  cursor: not-allowed;
}

.icon-button--danger {
  color: $color-danger-hover;
  background: $color-danger-subtle;
}

.icon-button--danger:hover:not(:disabled) {
  background: $color-danger-subtle-hover;
}

.icon-button--danger:active:not(:disabled) {
  background: $color-danger-subtle-active;
}
</style>
