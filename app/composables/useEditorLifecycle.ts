import { onBeforeUnmount, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

interface EditorLifecycleOptions {
  initialize: () => void
  onKeydown: (event: KeyboardEvent) => void
  onStorage: (event: StorageEvent) => void
  persistDraft: () => void
}

export const useEditorLifecycle = ({
  initialize,
  onKeydown,
  onStorage,
  persistDraft,
}: EditorLifecycleOptions): void => {
  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') persistDraft()
  }

  onMounted(() => {
    initialize()
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('storage', onStorage)
    window.addEventListener('pagehide', persistDraft)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeRouteLeave(persistDraft)

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('pagehide', persistDraft)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
