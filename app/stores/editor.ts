import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { readDraft, removeDraft, writeDraft } from '~/services/draft-storage'
import { NOTES_SCHEMA_VERSION } from '~/services/notes-storage'
import type { NoteOperation, NoteHistoryState } from '~/types/history'
import type { Note, PersistedDraft, Todo } from '~/types/note'
import {
  applyOperation,
  createHistoryState,
  recordOperation,
  redoOperation,
  undoOperation,
} from '~/utils/note-history'
import { createDebouncedTask } from '~/utils/debounce'
import {
  cloneNote,
  createId,
  createNoteModel,
  hasNoteContent,
  hasSameNoteContent,
} from '~/utils/note'

const DRAFT_DELAY_MS = 350
const TEXT_HISTORY_DELAY_MS = 600

type PendingTextChange = {
  field: 'title' | `todo:${string}`
  operation: Extract<NoteOperation, { type: 'set-title' | 'set-todo-text' }>
}

export const useEditorStore = defineStore('editor', () => {
  const draft = ref<Note | null>(null)
  const originalDraft = ref<Note | null>(null)
  const sessionKey = ref<string | null>(null)
  const history = ref<NoteHistoryState>(createHistoryState())
  const pendingTextChange = ref<PendingTextChange | null>(null)

  const hasPendingTextChange = computed(() => {
    const operation = pendingTextChange.value?.operation
    return Boolean(operation && operation.previous !== operation.next)
  })
  const hasChanges = computed(
    () =>
      draft.value !== null &&
      originalDraft.value !== null &&
      !hasSameNoteContent(draft.value, originalDraft.value),
  )
  const canUndo = computed(() => hasPendingTextChange.value || history.value.undoStack.length > 0)
  const canRedo = computed(() => !hasPendingTextChange.value && history.value.redoStack.length > 0)

  const writeCurrentDraft = (): void => {
    if (!draft.value || !sessionKey.value) {
      return
    }

    if (!hasChanges.value) {
      removeDraft(sessionKey.value)
      return
    }

    writeDraft(sessionKey.value, {
      schemaVersion: NOTES_SCHEMA_VERSION,
      note: draft.value,
    })
  }

  const draftPersistTask = createDebouncedTask(writeCurrentDraft, DRAFT_DELAY_MS)

  const persistDraftNow = (): void => {
    draftPersistTask.cancel()
    writeCurrentDraft()
  }

  const scheduleDraftPersist = (): void => draftPersistTask.schedule()

  const commitPendingTextChange = (): void => {
    const pendingChange = pendingTextChange.value
    pendingTextChange.value = null

    if (!pendingChange || pendingChange.operation.previous === pendingChange.operation.next) {
      return
    }

    history.value = recordOperation(history.value, pendingChange.operation)
  }

  const textHistoryTask = createDebouncedTask(commitPendingTextChange, TEXT_HISTORY_DELAY_MS)

  const resetHistory = (): void => {
    history.value = createHistoryState()
    pendingTextChange.value = null
    textHistoryTask.cancel()
  }

  const setEditingSession = (note: Note, key: string): void => {
    draftPersistTask.cancel()
    draft.value = cloneNote(note)
    originalDraft.value = cloneNote(note)
    sessionKey.value = key
    resetHistory()
  }

  const startNew = (): void => {
    setEditingSession(createNoteModel(), 'new')
  }

  const startEditing = (note: Note): void => {
    setEditingSession(note, note.id)
  }

  const readUsableDraft = (key: string): PersistedDraft | null => {
    const storedDraft = readDraft(key)

    if (key === 'new' && storedDraft && !hasNoteContent(storedDraft.note)) {
      removeDraft(key)
      return null
    }

    return storedDraft
  }

  const getStoredDraft = (key: string): Note | null => readUsableDraft(key)?.note ?? null

  const restoreStoredDraft = (key: string): boolean => {
    const persistedDraft = readUsableDraft(key)

    if (!persistedDraft) {
      return false
    }

    draftPersistTask.cancel()
    draft.value = cloneNote(persistedDraft.note)
    sessionKey.value = key

    if (!originalDraft.value) {
      originalDraft.value = cloneNote(persistedDraft.note)
    }

    resetHistory()
    return true
  }

  const flushTextChange = (): void => {
    textHistoryTask.flush()
  }

  const scheduleTextChangeFlush = (): void => textHistoryTask.schedule()

  const queueTextChange = (change: PendingTextChange, nextDraft: Note): void => {
    if (pendingTextChange.value?.field !== change.field) {
      flushTextChange()
      pendingTextChange.value = change
    } else {
      pendingTextChange.value.operation.next = change.operation.next
    }

    draft.value = nextDraft
    scheduleTextChangeFlush()
    scheduleDraftPersist()
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
    if (!draft.value || draft.value.title === next) {
      return
    }

    queueTextChange(
      {
        field: 'title',
        operation: { type: 'set-title', previous: draft.value.title, next },
      },
      { ...draft.value, title: next },
    )
  }

  const updateTodoText = (todoId: string, next: string): void => {
    if (!draft.value) {
      return
    }

    const todo = draft.value.todos.find((item) => item.id === todoId)

    if (!todo || todo.text === next) {
      return
    }

    const field = `todo:${todoId}` as const

    queueTextChange(
      {
        field,
        operation: { type: 'set-todo-text', todoId, previous: todo.text, next },
      },
      {
        ...draft.value,
        todos: draft.value.todos.map((item) =>
          item.id === todoId ? { ...item, text: next } : item,
        ),
      },
    )
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

    draftPersistTask.cancel()
    draft.value = null
    originalDraft.value = null
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
