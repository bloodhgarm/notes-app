export interface Todo {
  id: string
  text: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  todos: Todo[]
  createdAt: string
  updatedAt: string
}

export interface PersistedNotesState {
  schemaVersion: 1
  notes: Note[]
}
