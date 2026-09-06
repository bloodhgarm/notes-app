<script setup lang="ts">
withDefaults(
  defineProps<{
    to: string
    tone?: 'primary' | 'neutral'
    appearance?: 'text' | 'solid'
  }>(),
  {
    tone: 'primary',
    appearance: 'text',
  },
)
</script>

<template>
  <NuxtLink
    class="link-button"
    :class="[`link-button--${tone}`, `link-button--${appearance}`]"
    :to="to"
  >
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

.link-button--solid {
  min-height: $control-height-lg;
  padding: $space-2-5 $space-4;
  border-radius: $radius-lg;
  color: $color-text-on-accent;
  background: $color-primary;
}

.link-button--solid:hover {
  color: $color-text-on-accent;
  background: $color-primary-hover;
}

.link-button--solid:active {
  background: $color-primary-active;
}
</style>
