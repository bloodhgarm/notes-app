import { defineStore } from 'pinia'
import { ref } from 'vue'

import { NOTES_STORAGE_KEY, readNotes, writeNotes } from '~/services/notes-storage'
import type { Note } from '~/types/note'
import { cloneNote, createId } from '~/utils/note'

const PERSIST_DELAY_MS = 300

let persistTimeout: ReturnType<typeof setTimeout> | undefined

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const isHydrated = ref(false)

  const persistNow = (): void => {
    if (persistTimeout) {
      clearTimeout(persistTimeout)
      persistTimeout = undefined
    }

    writeNotes(notes.value)
  }

  const schedulePersist = (): void => {
    if (persistTimeout) {
      clearTimeout(persistTimeout)
    }

    persistTimeout = setTimeout(persistNow, PERSIST_DELAY_MS)
  }

  const hydrate = (): void => {
    if (isHydrated.value) {
      return
    }

    notes.value = readNotes().notes.map(cloneNote)
    isHydrated.value = true
  }

  const getNoteById = (id: string): Note | undefined =>
    notes.value.find((note) => note.id === id)

  const createNote = (title: string, todos: Note['todos'] = []): Note => {
    const timestamp = new Date().toISOString()
    const note: Note = {
      id: createId(),
      title,
      todos: todos.map((todo) => ({ ...todo })),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    notes.value.unshift(note)
    schedulePersist()

    return cloneNote(note)
  }

  const saveNote = (note: Note): void => {
    const nextNote: Note = {
      ...cloneNote(note),
      updatedAt: new Date().toISOString(),
    }
    const index = notes.value.findIndex((currentNote) => currentNote.id === note.id)

    if (index === -1) {
      notes.value.unshift(nextNote)
    } else {
      notes.value.splice(index, 1, nextNote)
    }

    schedulePersist()
  }

  const deleteNote = (id: string): void => {
    const index = notes.value.findIndex((note) => note.id === id)

    if (index === -1) {
      return
    }

    notes.value.splice(index, 1)
    schedulePersist()
  }

  const syncFromStorage = (): void => {
    notes.value = readNotes().notes.map(cloneNote)
  }

  const handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === NOTES_STORAGE_KEY) {
      syncFromStorage()
    }
  }

  return {
    notes,
    isHydrated,
    createNote,
    deleteNote,
    getNoteById,
    handleStorageEvent,
    hydrate,
    persistNow,
    saveNote,
    syncFromStorage,
  }
})
