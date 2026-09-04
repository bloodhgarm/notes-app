import type { Note, PersistedNotesState, Todo } from '~/types/note'

export const NOTES_SCHEMA_VERSION = 1 as const
export const NOTES_STORAGE_KEY = 'notes-app:notes'

const isTodo = (value: unknown): value is Todo => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const todo = value as Todo

  return (
    typeof todo.id === 'string' &&
    typeof todo.text === 'string' &&
    typeof todo.completed === 'boolean'
  )
}

const isNote = (value: unknown): value is Note => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const note = value as Note

  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    Array.isArray(note.todos) &&
    note.todos.every(isTodo) &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  )
}

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readNotes = (): PersistedNotesState => {
  const storage = getStorage()

  if (!storage) {
    return { schemaVersion: NOTES_SCHEMA_VERSION, notes: [] }
  }

  try {
    const rawState = storage.getItem(NOTES_STORAGE_KEY)

    if (!rawState) {
      return { schemaVersion: NOTES_SCHEMA_VERSION, notes: [] }
    }

    const parsedState: unknown = JSON.parse(rawState)

    if (!parsedState || typeof parsedState !== 'object') {
      return { schemaVersion: NOTES_SCHEMA_VERSION, notes: [] }
    }

    const state = parsedState as PersistedNotesState

    if (
      state.schemaVersion !== NOTES_SCHEMA_VERSION ||
      !Array.isArray(state.notes) ||
      !state.notes.every(isNote)
    ) {
      return { schemaVersion: NOTES_SCHEMA_VERSION, notes: [] }
    }

    return state
  } catch {
    return { schemaVersion: NOTES_SCHEMA_VERSION, notes: [] }
  }
}

export const writeNotes = (notes: Note[]): void => {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const state: PersistedNotesState = {
    schemaVersion: NOTES_SCHEMA_VERSION,
    notes,
  }

  try {
    storage.setItem(NOTES_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Local storage can be unavailable or full. The in-memory store remains usable.
  }
}
