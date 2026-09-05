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
.icon-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border: 0;
  border-radius: 6px;
  color: #475569;
  background: transparent;
  font: inherit;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.1s ease;
}

.icon-button:hover:not(:disabled) {
  background: #f1f5f9;
}

.icon-button:active:not(:disabled) {
  transform: translateY(1px);
  background: #e2e8f0;
}

.icon-button:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-button--danger {
  color: #b91c1c;
  background: #fef2f2;
}

.icon-button--danger:hover:not(:disabled) {
  background: #fee2e2;
}

.icon-button--danger:active:not(:disabled) {
  background: #fecaca;
}
</style>
