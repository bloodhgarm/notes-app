<script setup lang="ts">
import { computed, ref } from 'vue'

import { NOTES_STORAGE_KEY } from '~/services/notes-storage'
import type { Note } from '~/types/note'
import { getHistoryShortcut } from '~/utils/history-shortcut'
import { normalizeNoteContent } from '~/utils/note'

type ActiveDialog = 'restore' | 'cancel' | 'delete' | 'external-delete' | null

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()
const editor = useEditorStore()
const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const sessionKey = computed(() => (isNew.value ? 'new' : id.value))
const initialized = ref(false)
const missing = ref(false)
const activeDialog = ref<ActiveDialog>(null)
const validationMessage = ref('')
const hasOpenModal = computed(() => activeDialog.value !== null)

const initialize = () => {
  notesStore.hydrate()
  if (isNew.value) editor.startNew()
  else {
    const note = notesStore.getNoteById(id.value)
    if (!note) {
      missing.value = true
      initialized.value = true
      return
    }
    editor.startEditing(note)
  }
  if (editor.getStoredDraft(sessionKey.value)) activeDialog.value = 'restore'
  initialized.value = true
}
const restore = () => {
  editor.restoreStoredDraft(sessionKey.value)
  activeDialog.value = null
}
const discardStored = () => {
  editor.discardStoredDraft(sessionKey.value)
  activeDialog.value = null
}

const updateTitle = (value: string) => {
  validationMessage.value = ''
  editor.updateTitle(value)
}

const updateTodoText = (todoId: string, value: string) => {
  validationMessage.value = ''
  editor.updateTodoText(todoId, value)
}

const getValidatedDraft = (): Note | null => {
  editor.flushTextChange()
  const note = editor.draft

  if (!note || !note.title.trim()) {
    validationMessage.value = 'Введите название заметки.'
    return null
  }

  if (note.todos.some((todo) => !todo.text.trim())) {
    validationMessage.value = 'Заполните текст каждой задачи или удалите пустую.'
    return null
  }

  validationMessage.value = ''
  return normalizeNoteContent(note)
}

const save = () => {
  if (activeDialog.value === 'external-delete') return

  const note = getValidatedDraft()
  if (!note) return

  const finished = editor.finishEditing()
  if (!finished) return

  notesStore.saveNote({ ...finished, title: note.title, todos: note.todos })
  notesStore.persistNow()
  router.push('/')
}

const saveCopyAfterExternalDelete = () => {
  const note = getValidatedDraft()
  if (!note) return

  notesStore.createNote(note.title, note.todos)
  notesStore.persistNow()
  editor.discardDraft()
  activeDialog.value = null
  router.push('/')
}

const discardAndReturnToList = () => {
  editor.discardDraft()
  activeDialog.value = null
  router.push('/')
}
const remove = () => {
  if (!isNew.value) notesStore.deleteNote(id.value)
  notesStore.persistNow()
  discardAndReturnToList()
}
const onKeydown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || hasOpenModal.value) return

  const target = event.target
  const isEditableTarget =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)

  if (isEditableTarget) return

  const shortcut = getHistoryShortcut(event)
  if (!shortcut) return

  event.preventDefault()

  if (shortcut === 'redo') editor.redo()
  else editor.undo()
}

const persistDraftBeforeExit = () => {
  if (!editor.draft) return
  editor.flushTextChange()
  editor.persistDraftNow()
}

const onStorage = (event: StorageEvent) => {
  notesStore.handleStorageEvent(event)

  if (
    event.key === NOTES_STORAGE_KEY &&
    !isNew.value &&
    editor.draft &&
    !notesStore.getNoteById(id.value)
  ) {
    activeDialog.value = 'external-delete'
  }
}

useEditorLifecycle({
  initialize,
  onKeydown,
  onStorage,
  persistDraft: persistDraftBeforeExit,
})
</script>

<template>
  <main v-if="initialized" class="note-editor">
    <section v-if="missing" class="note-editor__empty">
      <h1 class="note-editor__empty-title">Заметка не найдена</h1>
      <BaseLinkButton class="note-editor__back-link" to="/">Вернуться к списку</BaseLinkButton>
    </section>
    <template v-else-if="editor.draft">
      <header class="note-editor__header">
        <BaseLinkButton class="note-editor__back-link" to="/" tone="neutral">
          ← Все заметки
        </BaseLinkButton>
        <h1 class="note-editor__title">
          {{ isNew ? 'Новая заметка' : 'Редактирование заметки' }}
        </h1>
      </header>
      <form class="note-editor__form" @submit.prevent="save">
        <label class="note-editor__field">
          Название заметки
          <BaseInput
            :model-value="editor.draft.title"
            placeholder="Например, Покупки"
            :invalid="Boolean(validationMessage) && !editor.draft.title.trim()"
            aria-describedby="editor-validation"
            @update:model-value="updateTitle"
            @blur="editor.flushTextChange"
          />
        </label>
        <p v-if="validationMessage" id="editor-validation" class="note-editor__error" role="alert">
          {{ validationMessage }}
        </p>
        <div class="note-editor__history-actions">
          <BaseButton
            type="button"
            :disabled="!editor.canUndo"
            aria-keyshortcuts="Control+Z Meta+Z"
            @click="editor.undo"
          >
            Отменить
          </BaseButton>
          <BaseButton
            type="button"
            :disabled="!editor.canRedo"
            aria-keyshortcuts="Control+Shift+Z Control+Y Meta+Shift+Z"
            @click="editor.redo"
          >
            Повторить
          </BaseButton>
        </div>
        <TodoList
          :todos="editor.draft.todos"
          :show-validation="Boolean(validationMessage)"
          @add="editor.addTodo"
          @remove="editor.removeTodo"
          @toggle="editor.toggleTodo"
          @update-text="updateTodoText"
          @flush="editor.flushTextChange"
        />
        <footer class="note-editor__actions">
          <BaseButton type="button" @click="activeDialog = 'cancel'">
            Отменить редактирование
          </BaseButton>
          <BaseButton v-if="!isNew" type="button" variant="danger" @click="activeDialog = 'delete'">
            Удалить
          </BaseButton>
          <BaseButton type="submit" variant="primary">Сохранить</BaseButton>
        </footer>
      </form>
    </template>
    <ConfirmModal
      :open="activeDialog === 'restore'"
      title="Восстановить черновик?"
      confirm-label="Восстановить"
      cancel-label="Не восстанавливать"
      confirm-variant="primary"
      @cancel="discardStored"
      @confirm="restore"
    >
      <p class="note-editor__dialog-message">Найдены несохранённые изменения этой заметки.</p>
    </ConfirmModal>
    <ConfirmModal
      :open="activeDialog === 'cancel'"
      title="Отменить редактирование?"
      confirm-label="Отменить изменения"
      cancel-label="Продолжить"
      @cancel="activeDialog = null"
      @confirm="discardAndReturnToList"
    >
      <p class="note-editor__dialog-message">Несохранённые изменения будут потеряны.</p>
    </ConfirmModal>
    <ConfirmModal
      :open="activeDialog === 'delete'"
      title="Удалить заметку?"
      confirm-label="Удалить"
      @cancel="activeDialog = null"
      @confirm="remove"
    >
      <p class="note-editor__dialog-message">Это действие нельзя отменить.</p>
    </ConfirmModal>
    <BaseModal
      :open="activeDialog === 'external-delete'"
      title="Заметка удалена в другой вкладке"
      :closable="false"
      :close-on-escape="false"
      :close-on-backdrop="false"
    >
      <p class="note-editor__dialog-message">
        Можно сохранить текущие изменения как новую заметку или вернуться к списку.
      </p>
      <template #footer>
        <BaseButton @click="discardAndReturnToList">Вернуться к списку</BaseButton>
        <BaseButton variant="primary" @click="saveCopyAfterExternalDelete">
          Сохранить как новую
        </BaseButton>
      </template>
    </BaseModal>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/tokens' as *;

.note-editor {
  @include page-container($editor-max-width);
  padding: $space-10 0;
}
.note-editor__title,
.note-editor__empty-title {
  margin: $space-4 0 $space-7;
}
.note-editor__form {
  display: grid;
  gap: $space-6;
}
.note-editor__field {
  display: grid;
  gap: $space-2;
  font-weight: $font-weight-bold;
}
.note-editor__history-actions,
.note-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2-5;
}
.note-editor__actions {
  justify-content: flex-end;
}
.note-editor__error {
  margin: 0;
  color: $color-danger-hover;
}
@media (max-width: $breakpoint-mobile-max) {
  .note-editor {
    padding-top: $space-6;
  }
  .note-editor__actions > * {
    flex: 1;
  }
}
</style>
