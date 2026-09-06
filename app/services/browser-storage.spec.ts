import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createMemoryStorage } from '~/test-utils/storage'

import { readStorageItem, removeStorageItem, writeStorageItem } from './browser-storage'

describe('browser storage', () => {
  const storage = createMemoryStorage()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('window', { localStorage: storage })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('reads only values accepted by the validator', () => {
    storage.setItem('value', JSON.stringify({ valid: true }))
    const isValid = (value: unknown): value is { valid: true } =>
      typeof value === 'object' && value !== null && (value as { valid?: unknown }).valid === true

    expect(readStorageItem('value', isValid)).toEqual({ valid: true })
    expect(readStorageItem('value', (_value: unknown): _value is never => false)).toBeNull()
  })

  it('writes and removes serialized values', () => {
    writeStorageItem('value', { title: 'Note' })
    expect(storage.getItem('value')).toBe('{"title":"Note"}')

    removeStorageItem('value')
    expect(storage.getItem('value')).toBeNull()
  })

  it('fails safely when storage is unavailable or contains invalid JSON', () => {
    storage.setItem('value', '{invalid-json')
    expect(readStorageItem('value', (_value: unknown): _value is unknown => true)).toBeNull()

    vi.stubGlobal('window', {})
    expect(readStorageItem('value', (_value: unknown): _value is unknown => true)).toBeNull()
    expect(() => writeStorageItem('value', true)).not.toThrow()
    expect(() => removeStorageItem('value')).not.toThrow()
  })
})
