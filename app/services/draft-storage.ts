import { isNote, NOTES_SCHEMA_VERSION } from '~/services/notes-storage'
import type { PersistedDraft } from '~/types/note'

const DRAFT_STORAGE_PREFIX = 'notes-app:draft:'

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

const getDraftKey = (sessionKey: string): string => `${DRAFT_STORAGE_PREFIX}${sessionKey}`

export const readDraft = (sessionKey: string): PersistedDraft | null => {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  try {
    const rawDraft = storage.getItem(getDraftKey(sessionKey))

    if (!rawDraft) {
      return null
    }

    const draft: unknown = JSON.parse(rawDraft)

    if (!draft || typeof draft !== 'object') {
      return null
    }

    const persistedDraft = draft as PersistedDraft

    if (
      persistedDraft.schemaVersion !== NOTES_SCHEMA_VERSION ||
      !isNote(persistedDraft.note) ||
      (persistedDraft.sourceUpdatedAt !== null &&
        typeof persistedDraft.sourceUpdatedAt !== 'string')
    ) {
      return null
    }

    return persistedDraft
  } catch {
    return null
  }
}

export const writeDraft = (sessionKey: string, draft: PersistedDraft): void => {
  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(getDraftKey(sessionKey), JSON.stringify(draft))
  } catch {
    // The editing session remains available in memory if storage is unavailable.
  }
}

export const removeDraft = (sessionKey: string): void => {
  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(getDraftKey(sessionKey))
  } catch {
    // There is no recovery action if storage cannot be modified.
  }
}
