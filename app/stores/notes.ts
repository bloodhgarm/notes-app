import { defineStore } from 'pinia'
import { ref } from 'vue'

import { NOTES_STORAGE_KEY, readNotes, writeNotes } from '~/services/notes-storage'
import type { Note } from '~/types/note'
import { createDebouncedTask } from '~/utils/debounce'
import { cloneNote, createNoteModel } from '~/utils/note'

const PERSIST_DELAY_MS = 300

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const isHydrated = ref(false)
  const writeCurrentNotes = (): void => writeNotes(notes.value)
  const persistTask = createDebouncedTask(writeCurrentNotes, PERSIST_DELAY_MS)

  const persistNow = (): void => {
    persistTask.cancel()
    writeCurrentNotes()
  }

  const schedulePersist = (): void => persistTask.schedule()
  const loadNotes = (): void => {
    notes.value = readNotes().notes.map(cloneNote)
  }

  const hydrate = (): void => {
    if (isHydrated.value) {
      return
    }

    loadNotes()
    isHydrated.value = true
  }

  const getNoteById = (id: string): Note | undefined => notes.value.find((note) => note.id === id)

  const createNote = (title: string, todos: Note['todos'] = []): Note => {
    const note = createNoteModel(title, todos)

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

  const handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === NOTES_STORAGE_KEY) {
      loadNotes()
    }
  }

  return {
    notes,
    createNote,
    deleteNote,
    getNoteById,
    handleStorageEvent,
    hydrate,
    persistNow,
    saveNote,
  }
})
