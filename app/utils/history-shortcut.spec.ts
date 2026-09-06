import { describe, expect, it } from 'vitest'

import { getHistoryShortcut } from './history-shortcut'

const keyboardEvent = (
  overrides: Partial<Parameters<typeof getHistoryShortcut>[0]> = {},
): Parameters<typeof getHistoryShortcut>[0] => ({
  altKey: false,
  code: '',
  ctrlKey: false,
  isComposing: false,
  key: '',
  metaKey: false,
  shiftKey: false,
  ...overrides,
})

describe('history keyboard shortcuts', () => {
  it.each([
    ['Windows/Linux Ctrl+Z', { ctrlKey: true, key: 'z' }, 'undo'],
    ['Windows/Linux Ctrl+Shift+Z', { ctrlKey: true, shiftKey: true, key: 'Z' }, 'redo'],
    ['Windows/Linux Ctrl+Y', { ctrlKey: true, key: 'y' }, 'redo'],
    ['macOS Cmd+Z', { metaKey: true, key: 'z' }, 'undo'],
    ['macOS Cmd+Shift+Z', { metaKey: true, shiftKey: true, key: 'Z' }, 'redo'],
    ['localized Ctrl+Z', { ctrlKey: true, key: 'я', code: 'KeyZ' }, 'undo'],
    ['localized Ctrl+Y', { ctrlKey: true, key: 'н', code: 'KeyY' }, 'redo'],
    ['localized Cmd+Shift+Z', { metaKey: true, shiftKey: true, key: 'Я', code: 'KeyZ' }, 'redo'],
  ] as const)('maps %s to %s', (_name, modifiers, action) => {
    expect(getHistoryShortcut(keyboardEvent(modifiers))).toBe(action)
  })

  it.each([
    { key: 'z' },
    { ctrlKey: true, metaKey: true, key: 'z' },
    { ctrlKey: true, altKey: true, key: 'z' },
    { ctrlKey: true, isComposing: true, key: 'z' },
    { metaKey: true, key: 'y' },
    { ctrlKey: true, shiftKey: true, key: 'y' },
  ])('ignores unsupported or unsafe combination %#', (event) => {
    expect(getHistoryShortcut(keyboardEvent(event))).toBeNull()
  })
})
