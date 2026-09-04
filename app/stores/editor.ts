import { computed, ref } from 'vue'

import { readDraft, removeDraft, writeDraft } from '~/services/draft-storage'
import { NOTES_SCHEMA_VERSION } from '~/services/notes-storage'
import type { NoteOperation, NoteHistoryState } from '~/types/history'
import type { Note, Todo } from '~/types/note'
import {
  applyOperation,
  createHistoryState,
  recordOperation,
  redoOperation,
  undoOperation,
} from '~/utils/note-history'
import { cloneNote, createId } from '~/utils/note'

const DRAFT_DELAY_MS = 350
const TEXT_HISTORY_DELAY_MS = 600

type PendingTextChange = {
  field: 'title' | `todo:${string}`
  operation: Extract<NoteOperation, { type: 'set-title' | 'set-todo-text' }>
}

let draftTimeout: ReturnType<typeof setTimeout> | undefined
let textHistoryTimeout: ReturnType<typeof setTimeout> | undefined

export const useEditorStore = defineStore('editor', () => {
  const draft = ref<Note | null>(null)
  const sourceUpdatedAt = ref<string | null>(null)
  const sessionKey = ref<string | null>(null)
  const history = ref<NoteHistoryState>(createHistoryState())
  const pendingTextChange = ref<PendingTextChange | null>(null)

  const canUndo = computed(() => history.value.undoStack.length > 0)
  const canRedo = computed(() => history.value.redoStack.length > 0)

  const persistDraftNow = (): void => {
    if (draftTimeout) {
      clearTimeout(draftTimeout)
      draftTimeout = undefined
    }

    if (!draft.value || !sessionKey.value) {
      return
    }

    writeDraft(sessionKey.value, {
      schemaVersion: NOTES_SCHEMA_VERSION,
      note: draft.value,
      sourceUpdatedAt: sourceUpdatedAt.value,
    })
  }

  const scheduleDraftPersist = (): void => {
    if (draftTimeout) {
      clearTimeout(draftTimeout)
    }

    draftTimeout = setTimeout(persistDraftNow, DRAFT_DELAY_MS)
  }

  const resetHistory = (): void => {
    history.value = createHistoryState()
    pendingTextChange.value = null

    if (textHistoryTimeout) {
      clearTimeout(textHistoryTimeout)
      textHistoryTimeout = undefined
    }
  }

  const startNew = (): void => {
    const timestamp = new Date().toISOString()

    draft.value = {
      id: createId(),
      title: '',
      todos: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    sourceUpdatedAt.value = null
    sessionKey.value = 'new'
    resetHistory()
  }

  const startEditing = (note: Note): void => {
    draft.value = cloneNote(note)
    sourceUpdatedAt.value = note.updatedAt
    sessionKey.value = note.id
    resetHistory()
  }

  const getStoredDraft = (key: string): Note | null => readDraft(key)?.note ?? null

  const restoreStoredDraft = (key: string): boolean => {
    const persistedDraft = readDraft(key)

    if (!persistedDraft) {
      return false
    }

    draft.value = cloneNote(persistedDraft.note)
    sourceUpdatedAt.value = persistedDraft.sourceUpdatedAt
    sessionKey.value = key
    resetHistory()
    return true
  }

  const flushTextChange = (): void => {
    if (textHistoryTimeout) {
      clearTimeout(textHistoryTimeout)
      textHistoryTimeout = undefined
    }

    const pendingChange = pendingTextChange.value
    pendingTextChange.value = null

    if (!pendingChange || pendingChange.operation.previous === pendingChange.operation.next) {
      return
    }

    history.value = recordOperation(history.value, pendingChange.operation)
  }

  const scheduleTextChangeFlush = (): void => {
    if (textHistoryTimeout) {
      clearTimeout(textHistoryTimeout)
    }

    textHistoryTimeout = setTimeout(flushTextChange, TEXT_HISTORY_DELAY_MS)
  }

  const recordAndApply = (operation: NoteOperation): void => {
    if (!draft.value) {
      return
    }

    flushTextChange()
    draft.value = applyOperation(draft.value, operation)
    history.value = recordOperation(history.value, operation)
    scheduleDraftPersist()
  }

  const updateTitle = (next: string): void => {
    if (!draft.value) {
      return
    }

    if (pendingTextChange.value?.field !== 'title') {
      flushTextChange()
      pendingTextChange.value = {
        field: 'title',
        operation: { type: 'set-title', previous: draft.value.title, next },
      }
    } else {
      pendingTextChange.value.operation.next = next
    }

    draft.value = { ...draft.value, title: next }
    scheduleTextChangeFlush()
    scheduleDraftPersist()
  }

  const updateTodoText = (todoId: string, next: string): void => {
    if (!draft.value) {
      return
    }

    const todo = draft.value.todos.find((item) => item.id === todoId)

    if (!todo) {
      return
    }

    const field = `todo:${todoId}` as const

    if (pendingTextChange.value?.field !== field) {
      flushTextChange()
      pendingTextChange.value = {
        field,
        operation: { type: 'set-todo-text', todoId, previous: todo.text, next },
      }
    } else {
      pendingTextChange.value.operation.next = next
    }

    draft.value = {
      ...draft.value,
      todos: draft.value.todos.map((item) => (item.id === todoId ? { ...item, text: next } : item)),
    }
    scheduleTextChangeFlush()
    scheduleDraftPersist()
  }

  const addTodo = (): void => {
    if (!draft.value) {
      return
    }

    const todo: Todo = { id: createId(), text: '', completed: false }
    recordAndApply({ type: 'add-todo', todo, index: draft.value.todos.length })
  }

  const removeTodo = (todoId: string): void => {
    if (!draft.value) {
      return
    }

    const index = draft.value.todos.findIndex((todo) => todo.id === todoId)
    const todo = draft.value.todos[index]

    if (!todo) {
      return
    }

    recordAndApply({ type: 'remove-todo', todo, index })
  }

  const toggleTodo = (todoId: string): void => {
    const todo = draft.value?.todos.find((item) => item.id === todoId)

    if (!todo) {
      return
    }

    recordAndApply({
      type: 'toggle-todo',
      todoId,
      previous: todo.completed,
      next: !todo.completed,
    })
  }

  const undo = (): void => {
    if (!draft.value) {
      return
    }

    flushTextChange()
    const result = undoOperation(draft.value, history.value)
    draft.value = result.note
    history.value = result.history
    scheduleDraftPersist()
  }

  const redo = (): void => {
    if (!draft.value) {
      return
    }

    flushTextChange()
    const result = redoOperation(draft.value, history.value)
    draft.value = result.note
    history.value = result.history
    scheduleDraftPersist()
  }

  const discardDraft = (): void => {
    if (sessionKey.value) {
      removeDraft(sessionKey.value)
    }

    draft.value = null
    sourceUpdatedAt.value = null
    sessionKey.value = null
    resetHistory()
  }

  const discardStoredDraft = (key: string): void => {
    removeDraft(key)
  }

  const finishEditing = (): Note | null => {
    flushTextChange()

    if (!draft.value) {
      return null
    }

    const finishedNote = cloneNote(draft.value)
    discardDraft()
    return finishedNote
  }

  return {
    canRedo,
    canUndo,
    discardDraft,
    discardStoredDraft,
    draft,
    finishEditing,
    flushTextChange,
    getStoredDraft,
    redo,
    removeTodo,
    restoreStoredDraft,
    startEditing,
    startNew,
    toggleTodo,
    undo,
    updateTitle,
    updateTodoText,
    addTodo,
    persistDraftNow,
  }
})
