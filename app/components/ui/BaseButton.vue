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
.button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.1s ease;
}
.button:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.button:not(:disabled):active {
  transform: translateY(1px);
}
.button--primary {
  color: #fff;
  background: #2563eb;
}
.button--primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.button--primary:active:not(:disabled) {
  background: #1e40af;
}
.button--secondary {
  color: #1f2937;
  border-color: #d1d5db;
  background: #fff;
}
.button--secondary:hover:not(:disabled) {
  border-color: #94a3b8;
  background: #f8fafc;
}
.button--secondary:active:not(:disabled) {
  background: #f1f5f9;
}
.button--danger {
  color: #fff;
  background: #dc2626;
}
.button--danger:hover:not(:disabled) {
  background: #b91c1c;
}
.button--danger:active:not(:disabled) {
  background: #991b1b;
}
</style>
