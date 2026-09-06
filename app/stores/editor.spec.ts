import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestNote } from '~/test-utils/note'
import { createMemoryStorage } from '~/test-utils/storage'

import { useEditorStore } from './editor'

describe('editor store', () => {
  const storage = createMemoryStorage()

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
    editor.startEditing(createTestNote())

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

  it('makes pending text immediately undoable before the debounce delay', () => {
    const editor = useEditorStore()
    editor.startEditing(createTestNote())

    editor.updateTitle('Immediate change')

    expect(editor.canUndo).toBe(true)
    editor.undo()
    expect(editor.draft?.title).toBe('Original')
    expect(editor.canRedo).toBe(true)
  })

  it('disables redo for pending text and preserves it if the text returns to its original value', () => {
    const editor = useEditorStore()
    editor.startEditing(createTestNote())
    editor.updateTitle('First change')
    editor.undo()
    expect(editor.canRedo).toBe(true)

    editor.updateTitle('Branched change')
    expect(editor.canRedo).toBe(false)

    editor.updateTitle('Original')
    expect(editor.canRedo).toBe(true)
    editor.flushTextChange()
    expect(editor.canRedo).toBe(true)

    editor.redo()
    expect(editor.draft?.title).toBe('First change')
  })

  it('records add, toggle and remove as reversible operations', () => {
    const editor = useEditorStore()
    editor.startEditing(createTestNote())

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
    editor.startEditing(createTestNote())
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

  it('persists a new draft only when it has a title or a todo with text', () => {
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
    expect(editor.getStoredDraft('new')).toBeNull()

    const todoId = editor.draft?.todos[0]?.id
    expect(todoId).toBeTruthy()
    editor.updateTodoText(todoId!, 'Draft task')
    editor.persistDraftNow()
    expect(editor.getStoredDraft('new')?.todos).toHaveLength(1)

    editor.updateTodoText(todoId!, '   ')
    editor.persistDraftNow()
    expect(editor.getStoredDraft('new')).toBeNull()
  })

  it('removes a draft when the editor returns to its original content', () => {
    const editor = useEditorStore()
    editor.startEditing(createTestNote())
    editor.updateTitle('Changed title')
    editor.persistDraftNow()
    expect(editor.getStoredDraft('note-1')?.title).toBe('Changed title')

    editor.updateTitle('Original')
    editor.persistDraftNow()

    expect(editor.getStoredDraft('note-1')).toBeNull()
  })

  it('removes a draft after undo restores the original content', () => {
    const editor = useEditorStore()
    editor.startEditing(createTestNote())
    editor.updateTitle('Changed title')
    editor.persistDraftNow()

    editor.undo()
    editor.persistDraftNow()

    expect(editor.getStoredDraft('note-1')).toBeNull()
  })

  it('clears history and stored draft after finishing an edit', () => {
    const editor = useEditorStore()
    editor.startEditing(createTestNote())
    editor.toggleTodo('todo-1')
    editor.persistDraftNow()

    expect(editor.canUndo).toBe(true)
    expect(editor.finishEditing()).not.toBeNull()
    expect(editor.draft).toBeNull()
    expect(editor.canUndo).toBe(false)
    expect(editor.getStoredDraft('note-1')).toBeNull()
  })
})
