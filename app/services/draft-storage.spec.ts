import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestNote } from '~/test-utils/note'
import { createMemoryStorage } from '~/test-utils/storage'
import type { PersistedDraft } from '~/types/note'

import { readDraft, removeDraft, writeDraft } from './draft-storage'

const note = createTestNote({
  title: 'Draft title',
  todos: [],
})

describe('draft storage', () => {
  const storage = createMemoryStorage()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('window', { localStorage: storage })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('writes, reads and removes a versioned draft', () => {
    const draft: PersistedDraft = {
      schemaVersion: 1,
      note,
    }

    writeDraft(note.id, draft)
    expect(readDraft(note.id)).toEqual(draft)

    removeDraft(note.id)
    expect(readDraft(note.id)).toBeNull()
  })

  it('ignores malformed and incompatible drafts', () => {
    storage.setItem('notes-app:draft:note-1', '{broken-json')
    expect(readDraft(note.id)).toBeNull()

    storage.setItem('notes-app:draft:note-1', JSON.stringify({ schemaVersion: 99, note }))
    expect(readDraft(note.id)).toBeNull()
  })

  it('never stores an empty new-note draft', () => {
    const key = 'notes-app:draft:new'
    storage.setItem(key, 'stale-value')

    writeDraft('new', {
      schemaVersion: 1,
      note: { ...note, title: '', todos: [] },
    })

    expect(storage.getItem(key)).toBeNull()
    expect(readDraft('new')).toBeNull()
  })
})
