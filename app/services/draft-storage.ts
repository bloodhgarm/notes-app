import { isNote, NOTES_SCHEMA_VERSION } from '~/services/notes-storage'
import type { PersistedDraft } from '~/types/note'
import { hasNoteContent } from '~/utils/note'

import { readStorageItem, removeStorageItem, writeStorageItem } from './browser-storage'
import { isRecord } from './storage-validation'

const DRAFT_STORAGE_PREFIX = 'notes-app:draft:'

const getDraftKey = (sessionKey: string): string => `${DRAFT_STORAGE_PREFIX}${sessionKey}`

const isPersistedDraft = (value: unknown): value is PersistedDraft => {
  if (!isRecord(value)) return false

  return value.schemaVersion === NOTES_SCHEMA_VERSION && isNote(value.note)
}

export const readDraft = (sessionKey: string): PersistedDraft | null =>
  readStorageItem(getDraftKey(sessionKey), isPersistedDraft)

export const writeDraft = (sessionKey: string, draft: PersistedDraft): void => {
  if (sessionKey === 'new' && !hasNoteContent(draft.note)) {
    removeStorageItem(getDraftKey(sessionKey))
    return
  }

  writeStorageItem(getDraftKey(sessionKey), draft)
}

export const removeDraft = (sessionKey: string): void => {
  removeStorageItem(getDraftKey(sessionKey))
}
