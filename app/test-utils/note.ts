import type { Note } from '~/types/note'

export const createTestNote = (overrides: Partial<Note> = {}): Note => {
  const note: Note = {
    id: 'note-1',
    title: 'Original',
    todos: [{ id: 'todo-1', text: 'Milk', completed: false }],
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-04T10:00:00.000Z',
    ...overrides,
  }

  return {
    ...note,
    todos: note.todos.map((todo) => ({ ...todo })),
  }
}
