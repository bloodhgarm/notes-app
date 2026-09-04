import { describe, expect, it } from 'vitest'

import type { Note } from '~/types/note'

import {
  HISTORY_LIMIT,
  createHistoryState,
  recordOperation,
  redoOperation,
  undoOperation,
} from './note-history'

const note: Note = {
  id: 'note-1',
  title: 'Original',
  todos: [{ id: 'todo-1', text: 'Milk', completed: false }],
  createdAt: '2026-09-04T10:00:00.000Z',
  updatedAt: '2026-09-04T10:00:00.000Z',
}

describe('note history', () => {
  it('undoes and redoes a text change', () => {
    const history = recordOperation(createHistoryState(), {
      type: 'set-title',
      previous: 'Original',
      next: 'Updated',
    })
    const changedNote = { ...note, title: 'Updated' }

    const undone = undoOperation(changedNote, history)
    expect(undone.note.title).toBe('Original')
    expect(undone.history.redoStack).toHaveLength(1)

    const redone = redoOperation(undone.note, undone.history)
    expect(redone.note.title).toBe('Updated')
  })

  it('restores a removed todo at its original position', () => {
    const removedTodo = note.todos[0]!
    const history = recordOperation(createHistoryState(), {
      type: 'remove-todo',
      todo: removedTodo,
      index: 0,
    })

    expect(undoOperation({ ...note, todos: [] }, history).note.todos).toEqual([removedTodo])
  })

  it('clears redo history after a new operation', () => {
    const initialHistory = recordOperation(createHistoryState(), {
      type: 'set-title',
      previous: 'Original',
      next: 'First',
    })
    const undone = undoOperation({ ...note, title: 'First' }, initialHistory)
    const history = recordOperation(undone.history, {
      type: 'set-title',
      previous: 'Original',
      next: 'Second',
    })

    expect(history.redoStack).toEqual([])
  })

  it('keeps no more than fifty operation entries', () => {
    let history = createHistoryState()

    for (let index = 0; index <= HISTORY_LIMIT; index += 1) {
      history = recordOperation(history, {
        type: 'set-title',
        previous: String(index),
        next: String(index + 1),
      })
    }

    expect(history.undoStack).toHaveLength(HISTORY_LIMIT)
  })
})
