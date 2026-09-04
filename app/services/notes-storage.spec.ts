import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  NOTES_SCHEMA_VERSION,
  NOTES_STORAGE_KEY,
  readNotes,
  writeNotes,
} from './notes-storage'

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

describe('notes storage', () => {
  const storage = createStorage()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('window', { localStorage: storage })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns an empty current schema for an empty storage', () => {
    expect(readNotes()).toEqual({ schemaVersion: NOTES_SCHEMA_VERSION, notes: [] })
  })

  it('writes notes with the schema version and reads them back', () => {
    const notes = [
      {
        id: 'note-1',
        title: 'Shopping',
        todos: [{ id: 'todo-1', text: 'Milk', completed: false }],
        createdAt: '2026-09-04T10:00:00.000Z',
        updatedAt: '2026-09-04T10:00:00.000Z',
      },
    ]

    writeNotes(notes)

    expect(JSON.parse(storage.getItem(NOTES_STORAGE_KEY) ?? '')).toEqual({
      schemaVersion: NOTES_SCHEMA_VERSION,
      notes,
    })
    expect(readNotes()).toEqual({ schemaVersion: NOTES_SCHEMA_VERSION, notes })
  })

  it('ignores malformed or incompatible stored data', () => {
    storage.setItem(NOTES_STORAGE_KEY, '{not-json')
    expect(readNotes().notes).toEqual([])

    storage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, notes: [] }),
    )
    expect(readNotes().notes).toEqual([])
  })
})
