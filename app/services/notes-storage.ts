import type { Note, PersistedNotesState, Todo } from '~/types/note'

import { readStorageItem, writeStorageItem } from './browser-storage'
import { isRecord } from './storage-validation'

export const NOTES_SCHEMA_VERSION = 1 as const
export const NOTES_STORAGE_KEY = 'notes-app:notes'

const isTodo = (value: unknown): value is Todo => {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.completed === 'boolean'
  )
}

export const isNote = (value: unknown): value is Note => {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    Array.isArray(value.todos) &&
    value.todos.every(isTodo) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

const createEmptyState = (): PersistedNotesState => ({
  schemaVersion: NOTES_SCHEMA_VERSION,
  notes: [],
})

const isPersistedNotesState = (value: unknown): value is PersistedNotesState => {
  if (!isRecord(value)) return false

  return (
    value.schemaVersion === NOTES_SCHEMA_VERSION &&
    Array.isArray(value.notes) &&
    value.notes.every(isNote)
  )
}

export const readNotes = (): PersistedNotesState => {
  return readStorageItem(NOTES_STORAGE_KEY, isPersistedNotesState) ?? createEmptyState()
}

export const writeNotes = (notes: Note[]): void => {
  const state: PersistedNotesState = {
    schemaVersion: NOTES_SCHEMA_VERSION,
    notes,
  }

  writeStorageItem(NOTES_STORAGE_KEY, state)
}
