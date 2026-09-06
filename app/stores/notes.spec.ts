import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NOTES_STORAGE_KEY } from '~/services/notes-storage'
import { createMemoryStorage } from '~/test-utils/storage'

import { useNotesStore } from './notes'

describe('notes store', () => {
  const storage = createMemoryStorage()

  beforeEach(() => {
    vi.useFakeTimers()
    storage.clear()
    vi.stubGlobal('window', { localStorage: storage })
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('creates, saves and deletes a note', () => {
    const store = useNotesStore()
    const createdNote = store.createNote('Shopping')

    expect(store.notes).toHaveLength(1)
    expect(store.getNoteById(createdNote.id)?.title).toBe('Shopping')

    store.saveNote({
      ...createdNote,
      title: 'Weekend shopping',
    })
    expect(store.getNoteById(createdNote.id)?.title).toBe('Weekend shopping')

    store.deleteNote(createdNote.id)
    expect(store.notes).toEqual([])
  })

  it('persists a batch of changes after the debounce delay', () => {
    const store = useNotesStore()
    store.createNote('First')
    store.createNote('Second')

    expect(storage.getItem(NOTES_STORAGE_KEY)).toBeNull()

    vi.advanceTimersByTime(300)

    expect(JSON.parse(storage.getItem(NOTES_STORAGE_KEY) ?? '').notes).toHaveLength(2)
  })

  it('hydrates notes only once', () => {
    storage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        notes: [
          {
            id: 'note-1',
            title: 'Stored note',
            todos: [],
            createdAt: '2026-09-04T10:00:00.000Z',
            updatedAt: '2026-09-04T10:00:00.000Z',
          },
        ],
      }),
    )
    const store = useNotesStore()

    store.hydrate()
    store.hydrate()

    expect(store.notes).toHaveLength(1)
    expect(store.notes[0]?.title).toBe('Stored note')
  })

  it('synchronizes deletion from another tab on a storage event', () => {
    const store = useNotesStore()
    const note = store.createNote('Shared note')
    store.persistNow()

    storage.setItem(NOTES_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, notes: [] }))
    store.handleStorageEvent({ key: NOTES_STORAGE_KEY } as StorageEvent)

    expect(store.getNoteById(note.id)).toBeUndefined()
    expect(store.notes).toEqual([])
  })
})
