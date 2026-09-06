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
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

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

const lockPageScroll = (): void => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  previousBodyOverflow = document.body.style.overflow
  previousBodyPaddingRight = document.body.style.paddingRight

  if (scrollbarWidth > 0) {
    const currentPaddingRight = Number.parseFloat(
      window.getComputedStyle(document.body).paddingRight,
    )
    document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
  }

  document.body.style.overflow = 'hidden'
}

const unlockPageScroll = (): void => {
  document.body.style.overflow = previousBodyOverflow
  document.body.style.paddingRight = previousBodyPaddingRight
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
    if (typeof document === 'undefined') return

    if (open) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      const initialFocusTarget = modal.value?.querySelector<HTMLElement>(focusableSelector)
      if (initialFocusTarget) initialFocusTarget.focus()
      else modal.value?.focus()
      lockPageScroll()
    } else {
      unlockPageScroll()
      const focusTarget = returnFocus
      returnFocus = null
      await nextTick()
      focusTarget?.focus()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    unlockPageScroll()
  }
})
</script>
<template>
  <Teleport to="body">
    <div v-if="open" class="base-modal__backdrop" @mousedown.self="onBackdropMouseDown">
      <section
        ref="modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        class="base-modal"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <header class="base-modal__header">
          <h2 :id="titleId" class="base-modal__title">{{ title }}</h2>
          <BaseIconButton v-if="closable" label="Закрыть" @click="close">
            <span class="base-modal__close-icon" aria-hidden="true">×</span>
          </BaseIconButton>
        </header>
        <div :id="descriptionId" class="base-modal__content"><slot /></div>
        <footer class="base-modal__footer"><slot name="footer" /></footer>
      </section>
    </div>
  </Teleport>
</template>
<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.base-modal__backdrop {
  position: fixed;
  z-index: $z-index-modal;
  inset: 0;
  display: grid;
  place-items: center;
  padding: $space-5;
  background: $color-backdrop;
}
.base-modal {
  width: min(100%, $modal-max-width);
  border-radius: $radius-xl;
  background: $color-surface-raised;
  box-shadow: $shadow-modal;
}
.base-modal__header,
.base-modal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-3;
  padding: $space-4-5 $space-5;
}
.base-modal__header {
  border-bottom: $border-width solid $color-border-default;
}
.base-modal__title {
  margin: 0;
  font-size: $font-size-heading-sm;
}
.base-modal__content {
  padding: $space-5;
  color: $color-text-secondary;
}
.base-modal__footer {
  justify-content: end;
  border-top: $border-width solid $color-border-default;
}
</style>
