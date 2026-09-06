import type { Note, Todo } from '~/types/note'

export const createId = (): string => crypto.randomUUID()

const cloneTodo = (todo: Todo): Todo => ({ ...todo })

export const cloneNote = (note: Note): Note => ({
  ...note,
  todos: note.todos.map(cloneTodo),
})

export const createNoteModel = (title = '', todos: Todo[] = []): Note => {
  const timestamp = new Date().toISOString()

  return {
    id: createId(),
    title,
    todos: todos.map(cloneTodo),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export const hasNoteContent = (note: Note): boolean =>
  Boolean(note.title.trim()) || note.todos.some((todo) => Boolean(todo.text.trim()))

export const hasSameNoteContent = (left: Note, right: Note): boolean =>
  left.title === right.title &&
  left.todos.length === right.todos.length &&
  left.todos.every((todo, index) => {
    const otherTodo = right.todos[index]

    return (
      otherTodo !== undefined &&
      todo.id === otherTodo.id &&
      todo.text === otherTodo.text &&
      todo.completed === otherTodo.completed
    )
  })

export const normalizeNoteContent = (note: Note): Note => ({
  ...note,
  title: note.title.trim(),
  todos: note.todos.map((todo) => ({ ...todo, text: todo.text.trim() })),
})
