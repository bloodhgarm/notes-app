import type { Todo } from '~/types/note'

export type NoteOperation =
  | { type: 'set-title'; previous: string; next: string }
  | { type: 'set-todo-text'; todoId: string; previous: string; next: string }
  | { type: 'toggle-todo'; todoId: string; previous: boolean; next: boolean }
  | { type: 'add-todo'; todo: Todo; index: number }
  | { type: 'remove-todo'; todo: Todo; index: number }

export interface NoteHistoryState {
  undoStack: NoteOperation[]
  redoStack: NoteOperation[]
}
