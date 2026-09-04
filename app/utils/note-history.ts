import type { NoteOperation, NoteHistoryState } from '~/types/history'
import type { Note } from '~/types/note'
import { cloneNote } from '~/utils/note'

export const HISTORY_LIMIT = 50

const updateTodo = (
  note: Note,
  todoId: string,
  update: (todo: Note['todos'][number]) => Note['todos'][number],
): Note => ({
  ...note,
  todos: note.todos.map((todo) => (todo.id === todoId ? update(todo) : todo)),
})

export const applyOperation = (note: Note, operation: NoteOperation): Note => {
  switch (operation.type) {
    case 'set-title':
      return { ...note, title: operation.next }
    case 'set-todo-text':
      return updateTodo(note, operation.todoId, (todo) => ({ ...todo, text: operation.next }))
    case 'toggle-todo':
      return updateTodo(note, operation.todoId, (todo) => ({ ...todo, completed: operation.next }))
    case 'add-todo': {
      const todos = [...note.todos]
      todos.splice(operation.index, 0, { ...operation.todo })
      return { ...note, todos }
    }
    case 'remove-todo':
      return {
        ...note,
        todos: note.todos.filter((todo) => todo.id !== operation.todo.id),
      }
  }
}

export const revertOperation = (note: Note, operation: NoteOperation): Note => {
  switch (operation.type) {
    case 'set-title':
      return { ...note, title: operation.previous }
    case 'set-todo-text':
      return updateTodo(note, operation.todoId, (todo) => ({ ...todo, text: operation.previous }))
    case 'toggle-todo':
      return updateTodo(note, operation.todoId, (todo) => ({ ...todo, completed: operation.previous }))
    case 'add-todo':
      return {
        ...note,
        todos: note.todos.filter((todo) => todo.id !== operation.todo.id),
      }
    case 'remove-todo': {
      const todos = [...note.todos]
      todos.splice(operation.index, 0, { ...operation.todo })
      return { ...note, todos }
    }
  }
}

export const createHistoryState = (): NoteHistoryState => ({
  undoStack: [],
  redoStack: [],
})

export const recordOperation = (
  history: NoteHistoryState,
  operation: NoteOperation,
): NoteHistoryState => ({
  undoStack: [...history.undoStack, operation].slice(-HISTORY_LIMIT),
  redoStack: [],
})

export const undoOperation = (
  note: Note,
  history: NoteHistoryState,
): { note: Note; history: NoteHistoryState } => {
  const operation = history.undoStack.at(-1)

  if (!operation) {
    return { note: cloneNote(note), history }
  }

  return {
    note: revertOperation(note, operation),
    history: {
      undoStack: history.undoStack.slice(0, -1),
      redoStack: [...history.redoStack, operation],
    },
  }
}

export const redoOperation = (
  note: Note,
  history: NoteHistoryState,
): { note: Note; history: NoteHistoryState } => {
  const operation = history.redoStack.at(-1)

  if (!operation) {
    return { note: cloneNote(note), history }
  }

  return {
    note: applyOperation(note, operation),
    history: {
      undoStack: [...history.undoStack, operation].slice(-HISTORY_LIMIT),
      redoStack: history.redoStack.slice(0, -1),
    },
  }
}
