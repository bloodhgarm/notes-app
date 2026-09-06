import { describe, expect, it } from 'vitest'

import { createTestNote } from '~/test-utils/note'

import { createNoteModel, hasNoteContent, hasSameNoteContent, normalizeNoteContent } from './note'

const note = createTestNote({
  title: '  Shopping  ',
  todos: [{ id: 'todo-1', text: '  Milk  ', completed: false }],
})

describe('note utilities', () => {
  it('creates an independent note model', () => {
    const todos = [{ id: 'todo-1', text: 'Milk', completed: false }]
    const createdNote = createNoteModel('Shopping', todos)

    expect(createdNote.id).toBeTruthy()
    expect(createdNote.createdAt).toBe(createdNote.updatedAt)
    expect(createdNote.todos).not.toBe(todos)
  })

  it('detects a title or todo as meaningful content', () => {
    expect(hasNoteContent({ ...note, title: ' ', todos: [] })).toBe(false)
    expect(
      hasNoteContent({
        ...note,
        title: ' ',
        todos: [{ ...note.todos[0]!, text: ' ' }],
      }),
    ).toBe(false)
    expect(hasNoteContent({ ...note, todos: [] })).toBe(true)
    expect(hasNoteContent({ ...note, title: ' ', todos: note.todos })).toBe(true)
  })

  it('trims user-entered content without mutating the source', () => {
    const normalized = normalizeNoteContent(note)

    expect(normalized.title).toBe('Shopping')
    expect(normalized.todos[0]?.text).toBe('Milk')
    expect(note.title).toBe('  Shopping  ')
    expect(normalized.todos).not.toBe(note.todos)
  })

  it('compares only editable note content', () => {
    const sameContent = {
      ...note,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }

    expect(hasSameNoteContent(note, sameContent)).toBe(true)
    expect(hasSameNoteContent(note, { ...sameContent, title: 'Other title' })).toBe(false)
    expect(
      hasSameNoteContent(note, {
        ...sameContent,
        todos: [{ ...sameContent.todos[0]!, completed: true }],
      }),
    ).toBe(false)
  })
})
