type HistoryShortcut = 'undo' | 'redo'

type HistoryShortcutEvent = Pick<
  KeyboardEvent,
  'altKey' | 'code' | 'ctrlKey' | 'isComposing' | 'key' | 'metaKey' | 'shiftKey'
>

export const getHistoryShortcut = (event: HistoryShortcutEvent): HistoryShortcut | null => {
  if (event.altKey || event.isComposing || event.ctrlKey === event.metaKey) {
    return null
  }

  const eventKey = event.key.toLowerCase()
  const key =
    eventKey === 'z' || eventKey === 'y'
      ? eventKey
      : event.code === 'KeyZ'
        ? 'z'
        : event.code === 'KeyY'
          ? 'y'
          : eventKey

  if (event.metaKey) {
    if (key !== 'z') return null
    return event.shiftKey ? 'redo' : 'undo'
  }

  if (key === 'y' && !event.shiftKey) {
    return 'redo'
  }

  if (key === 'z') {
    return event.shiftKey ? 'redo' : 'undo'
  }

  return null
}
