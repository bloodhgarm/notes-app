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
@use '~/assets/styles/tokens' as *;

.link-button {
  display: inline-flex;
  align-items: center;
  min-height: $control-height-sm;
  padding: $space-1 $space-2;
  border-radius: $radius-md;
  font: inherit;
  font-weight: $font-weight-semibold;
  line-height: $line-height-control;
  text-decoration: none;
  transition:
    color $duration-fast $easing-standard,
    background-color $duration-fast $easing-standard;
}

.link-button:focus-visible {
  outline: $focus-ring-width solid $focus-ring;
  outline-offset: $focus-ring-offset;
}

.link-button:active {
  transform: translateY($pressed-offset);
}

.link-button--primary {
  color: $color-primary;
}

.link-button--primary:hover {
  color: $color-primary-hover;
  background: $color-primary-subtle;
}

.link-button--neutral {
  color: $color-text-secondary;
}

.link-button--neutral:hover {
  color: $color-text-primary;
  background: $color-surface-subtle;
}
</style>
