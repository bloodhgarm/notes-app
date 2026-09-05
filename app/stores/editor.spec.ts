import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Note } from '~/types/note'

import { useEditorStore } from './editor'

const createStorage = (): Storage => {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

const createNote = (): Note => ({
  id: 'note-1',
  title: 'Original',
  todos: [{ id: 'todo-1', text: 'Milk', completed: false }],
  createdAt: '2026-09-04T10:00:00.000Z',
  updatedAt: '2026-09-04T10:00:00.000Z',
})

describe('editor store', () => {
  const storage = createStorage()

  beforeEach(() => {
    vi.useFakeTimers()
    storage.clear()
    vi.stubGlobal('window', { localStorage: storage })
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('groups continuous typing in one undo entry', () => {
    const editor = useEditorStore()
    editor.startEditing(createNote())

    editor.updateTitle('N')
    editor.updateTitle('Ne')
    editor.updateTitle('New title')
    vi.advanceTimersByTime(600)

    editor.undo()
    expect(editor.draft?.title).toBe('Original')
    expect(editor.canUndo).toBe(false)

    editor.redo()
    expect(editor.draft?.title).toBe('New title')
  })

  it('records add, toggle and remove as reversible operations', () => {
    const editor = useEditorStore()
    editor.startEditing(createNote())

    editor.toggleTodo('todo-1')
    expect(editor.draft?.todos[0]?.completed).toBe(true)
    editor.undo()
    expect(editor.draft?.todos[0]?.completed).toBe(false)

    editor.addTodo()
    const addedTodoId = editor.draft?.todos[1]?.id
    expect(addedTodoId).toBeTruthy()
    editor.removeTodo(addedTodoId!)
    expect(editor.draft?.todos).toHaveLength(1)
    editor.undo()
    expect(editor.draft?.todos).toHaveLength(2)
  })

  it('persists and restores a draft after the debounce delay', () => {
    const editor = useEditorStore()
    editor.startEditing(createNote())
    editor.updateTitle('Stored draft')

    vi.advanceTimersByTime(350)
    expect(editor.getStoredDraft('note-1')?.title).toBe('Stored draft')

    setActivePinia(createPinia())
    const restoredEditor = useEditorStore()
    expect(restoredEditor.restoreStoredDraft('note-1')).toBe(true)
    expect(restoredEditor.draft?.title).toBe('Stored draft')
    expect(restoredEditor.canUndo).toBe(false)
  })

  it('does not persist an untouched empty new note', () => {
    const editor = useEditorStore()
    editor.startNew()

    editor.persistDraftNow()

    expect(editor.getStoredDraft('new')).toBeNull()
    expect(storage.getItem('notes-app:draft:new')).toBeNull()
  })

  it('persists a new draft only when it has a title or a todo', () => {
    const editor = useEditorStore()
    editor.startNew()
    editor.updateTitle('Draft title')
    editor.persistDraftNow()
    expect(editor.getStoredDraft('new')?.title).toBe('Draft title')

    editor.updateTitle('')
    editor.persistDraftNow()
    expect(editor.getStoredDraft('new')).toBeNull()

    editor.addTodo()
    editor.persistDraftNow()
    expect(editor.getStoredDraft('new')?.todos).toHaveLength(1)
  })

  it('clears history and stored draft after finishing an edit', () => {
    const editor = useEditorStore()
    editor.startEditing(createNote())
    editor.toggleTodo('todo-1')
    editor.persistDraftNow()

    expect(editor.canUndo).toBe(true)
    expect(editor.finishEditing()).not.toBeNull()
    expect(editor.draft).toBeNull()
    expect(editor.canUndo).toBe(false)
    expect(editor.getStoredDraft('note-1')).toBeNull()
  })
})
