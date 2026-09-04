import type { Note, Todo } from '~/types/note'

export const createId = (): string => crypto.randomUUID()

export const cloneTodo = (todo: Todo): Todo => ({ ...todo })

export const cloneNote = (note: Note): Note => ({
  ...note,
  todos: note.todos.map(cloneTodo),
})
