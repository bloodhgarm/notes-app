<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel: string
    cancelLabel?: string
    confirmVariant?: 'primary' | 'danger'
  }>(),
  {
    cancelLabel: 'Отмена',
    confirmVariant: 'danger',
  },
)

defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="$emit('cancel')">
    <slot />

    <template #footer>
      <BaseButton @click="$emit('cancel')">{{ cancelLabel }}</BaseButton>
      <BaseButton :variant="confirmVariant" @click="$emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
