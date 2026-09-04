<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }>(), { variant: 'secondary', disabled: false })
</script>

<template><button class="button" :class="`button--${variant}`" type="button" :disabled="disabled"><slot /></button></template>

<style scoped lang="scss">
.button { min-height: 40px; padding: 0 16px; border: 1px solid transparent; border-radius: 8px; font: inherit; font-weight: 600; cursor: pointer; }.button:focus-visible { outline: 3px solid rgba(37,99,235,.35); outline-offset: 2px; }.button:disabled { opacity: .5; cursor: not-allowed; }.button--primary { color:#fff; background:#2563eb; }.button--secondary { color:#1f2937; border-color:#d1d5db; background:#fff; }.button--danger { color:#fff; background:#dc2626; }
</style>
