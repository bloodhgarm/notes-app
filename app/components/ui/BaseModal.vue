<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    closeOnEscape?: boolean
    closeOnBackdrop?: boolean
    closable?: boolean
  }>(),
  {
    closeOnEscape: true,
    closeOnBackdrop: true,
    closable: true,
  },
)
const emit = defineEmits<{ close: [] }>()
const modal = ref<HTMLElement | null>(null)
const titleId = `modal-title-${useId()}`
const descriptionId = `modal-description-${useId()}`
let returnFocus: HTMLElement | null = null

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const close = (): void => {
  if (props.closable) emit('close')
}

const onBackdropMouseDown = (): void => {
  if (props.closeOnBackdrop && props.closable) emit('close')
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && props.closable) {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return
  const nodes = [...(modal.value?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])].filter(
    (node) => node.getAttribute('aria-hidden') !== 'true' && node.offsetParent !== null,
  )
  if (!nodes.length) {
    event.preventDefault()
    modal.value?.focus()
    return
  }
  const first = nodes[0]!
  const last = nodes.at(-1)!
  if (!modal.value?.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      const initialFocusTarget = modal.value?.querySelector<HTMLElement>(focusableSelector)
      if (initialFocusTarget) initialFocusTarget.focus()
      else modal.value?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      returnFocus?.focus()
      returnFocus = null
    }
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>
<template>
  <Teleport to="body"
    ><div v-if="open" class="backdrop" @mousedown.self="onBackdropMouseDown">
      <section
        ref="modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        class="modal"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <header>
          <h2 :id="titleId">{{ title }}</h2>
          <BaseIconButton v-if="closable" label="Закрыть" @click="close">
            <span aria-hidden="true">×</span>
          </BaseIconButton>
        </header>
        <div :id="descriptionId"><slot /></div>
        <footer><slot name="footer" /></footer>
      </section></div
  ></Teleport>
</template>
<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.backdrop {
  position: fixed;
  z-index: $z-index-modal;
  inset: 0;
  display: grid;
  place-items: center;
  padding: $space-5;
  background: $color-backdrop;
}
.modal {
  width: min(100%, $modal-max-width);
  border-radius: $radius-xl;
  background: $color-surface-raised;
  box-shadow: $shadow-modal;
}
.modal header,
.modal footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-3;
  padding: $space-4-5 $space-5;
}
.modal header {
  border-bottom: $border-width solid $color-border-default;
}
.modal h2 {
  margin: 0;
  font-size: $font-size-heading-sm;
}
.modal > div {
  padding: $space-5;
  color: $color-text-secondary;
}
.modal footer {
  justify-content: end;
  border-top: $border-width solid $color-border-default;
}
</style>
