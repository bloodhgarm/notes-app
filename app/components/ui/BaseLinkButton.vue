<script setup lang="ts">
withDefaults(
  defineProps<{
    to: string
    tone?: 'primary' | 'neutral'
  }>(),
  {
    tone: 'primary',
  },
)
</script>

<template>
  <NuxtLink class="link-button" :class="`link-button--${tone}`" :to="to">
    <slot />
  </NuxtLink>
</template>

<style scoped lang="scss">
.link-button {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 6px;
  font: inherit;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.link-button:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

.link-button:active {
  transform: translateY(1px);
}

.link-button--primary {
  color: #2563eb;
}

.link-button--primary:hover {
  color: #1d4ed8;
  background: #eff6ff;
}

.link-button--neutral {
  color: #475569;
}

.link-button--neutral:hover {
  color: #1e293b;
  background: #f1f5f9;
}
</style>
