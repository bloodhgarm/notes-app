import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Note, PersistedDraft } from '~/types/note'

import { readDraft, removeDraft, writeDraft } from './draft-storage'

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

const note: Note = {
  id: 'note-1',
  title: 'Draft title',
  todos: [],
  createdAt: '2026-09-04T10:00:00.000Z',
  updatedAt: '2026-09-04T10:00:00.000Z',
}

describe('draft storage', () => {
  const storage = createStorage()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('window', { localStorage: storage })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('writes, reads and removes a versioned draft', () => {
    const draft: PersistedDraft = {
      schemaVersion: 1,
      note,
      sourceUpdatedAt: note.updatedAt,
    }

    writeDraft(note.id, draft)
    expect(readDraft(note.id)).toEqual(draft)

    removeDraft(note.id)
    expect(readDraft(note.id)).toBeNull()
  })

  it('ignores malformed and incompatible drafts', () => {
    storage.setItem('notes-app:draft:note-1', '{broken-json')
    expect(readDraft(note.id)).toBeNull()

    storage.setItem(
      'notes-app:draft:note-1',
      JSON.stringify({ schemaVersion: 99, note, sourceUpdatedAt: note.updatedAt }),
    )
    expect(readDraft(note.id)).toBeNull()
  })
})
