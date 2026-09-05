<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { NOTES_STORAGE_KEY } from '~/services/notes-storage'
import type { Note } from '~/types/note'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()
const editor = useEditorStore()
const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const initialized = ref(false)
const missing = ref(false)
const restorePrompt = ref(false)
const cancelPrompt = ref(false)
const deletePrompt = ref(false)
const externalDeletionPrompt = ref(false)
const validationMessage = ref('')

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
  if (editor.getStoredDraft(isNew.value ? 'new' : id.value)) restorePrompt.value = true
  initialized.value = true
}
const restore = () => {
  editor.restoreStoredDraft(isNew.value ? 'new' : id.value)
  restorePrompt.value = false
}
const discardStored = () => {
  editor.discardStoredDraft(isNew.value ? 'new' : id.value)
  restorePrompt.value = false
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
  return {
    ...note,
    title: note.title.trim(),
    todos: note.todos.map((todo) => ({ ...todo, text: todo.text.trim() })),
  }
}

const save = () => {
  if (externalDeletionPrompt.value) return

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
  externalDeletionPrompt.value = false
  router.push('/')
}

const leaveAfterExternalDelete = () => {
  editor.discardDraft()
  externalDeletionPrompt.value = false
  router.push('/')
}
const cancel = () => {
  editor.discardDraft()
  cancelPrompt.value = false
  router.push('/')
}
const remove = () => {
  if (!isNew.value) notesStore.deleteNote(id.value)
  notesStore.persistNow()
  editor.discardDraft()
  deletePrompt.value = false
  router.push('/')
}
const onKeydown = (event: KeyboardEvent) => {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    (event.target as HTMLElement | null)?.isContentEditable
  )
    return
  event.preventDefault()
  if (event.shiftKey) editor.redo()
  else editor.undo()
}

const persistDraftBeforeExit = () => {
  if (!editor.draft) return
  editor.flushTextChange()
  editor.persistDraftNow()
}

const onVisibilityChange = () => {
  if (document.visibilityState === 'hidden') persistDraftBeforeExit()
}

const onStorage = (event: StorageEvent) => {
  notesStore.handleStorageEvent(event)

  if (
    event.key === NOTES_STORAGE_KEY &&
    !isNew.value &&
    editor.draft &&
    !notesStore.getNoteById(id.value)
  ) {
    cancelPrompt.value = false
    deletePrompt.value = false
    externalDeletionPrompt.value = true
  }
}

onMounted(() => {
  initialize()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('storage', onStorage)
  window.addEventListener('pagehide', persistDraftBeforeExit)
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onBeforeUnmount(() => {
  persistDraftBeforeExit()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('pagehide', persistDraftBeforeExit)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <main v-if="initialized" class="editor-page">
    <section v-if="missing" class="empty">
      <h1>Заметка не найдена</h1>
      <BaseLinkButton to="/">Вернуться к списку</BaseLinkButton>
    </section>
    <template v-else-if="editor.draft"
      ><header>
        <BaseLinkButton to="/" tone="neutral">← Все заметки</BaseLinkButton>
        <h1>{{ isNew ? 'Новая заметка' : 'Редактирование заметки' }}</h1>
      </header>
      <form @submit.prevent="save">
        <label
          >Название заметки<BaseInput
            :model-value="editor.draft.title"
            placeholder="Например, Покупки"
            :invalid="Boolean(validationMessage) && !editor.draft.title.trim()"
            aria-describedby="editor-validation"
            @update:model-value="updateTitle"
            @blur="editor.flushTextChange"
        /></label>
        <p v-if="validationMessage" id="editor-validation" class="error" role="alert">
          {{ validationMessage }}
        </p>
        <div class="toolbar">
          <BaseButton type="button" :disabled="!editor.canUndo" @click="editor.undo"
            >Отменить</BaseButton
          ><BaseButton type="button" :disabled="!editor.canRedo" @click="editor.redo"
            >Повторить</BaseButton
          >
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
        <footer class="actions">
          <BaseButton type="button" @click="cancelPrompt = true">Отменить редактирование</BaseButton
          ><BaseButton v-if="!isNew" type="button" variant="danger" @click="deletePrompt = true"
            >Удалить</BaseButton
          ><BaseButton type="submit" variant="primary">Сохранить</BaseButton>
        </footer>
      </form></template
    >
    <BaseModal :open="restorePrompt" title="Восстановить черновик?" @close="discardStored"
      ><p>Найдены несохранённые изменения этой заметки.</p>
      <template #footer
        ><BaseButton @click="discardStored">Не восстанавливать</BaseButton
        ><BaseButton variant="primary" @click="restore">Восстановить</BaseButton></template
      ></BaseModal
    ><BaseModal :open="cancelPrompt" title="Отменить редактирование?" @close="cancelPrompt = false"
      ><p>Несохранённые изменения будут потеряны.</p>
      <template #footer
        ><BaseButton @click="cancelPrompt = false">Продолжить</BaseButton
        ><BaseButton variant="danger" @click="cancel">Отменить изменения</BaseButton></template
      ></BaseModal
    ><BaseModal :open="deletePrompt" title="Удалить заметку?" @close="deletePrompt = false"
      ><p>Это действие нельзя отменить.</p>
      <template #footer
        ><BaseButton @click="deletePrompt = false">Отмена</BaseButton
        ><BaseButton variant="danger" @click="remove">Удалить</BaseButton></template
      ></BaseModal
    >
    <BaseModal
      :open="externalDeletionPrompt"
      title="Заметка удалена в другой вкладке"
      :closable="false"
      :close-on-escape="false"
      :close-on-backdrop="false"
    >
      <p>Можно сохранить текущие изменения как новую заметку или вернуться к списку.</p>
      <template #footer>
        <BaseButton @click="leaveAfterExternalDelete">Вернуться к списку</BaseButton>
        <BaseButton variant="primary" @click="saveCopyAfterExternalDelete">
          Сохранить как новую
        </BaseButton>
      </template>
    </BaseModal>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.editor-page {
  width: min(100% - $page-inline-offset, $editor-max-width);
  margin: 0 auto;
  padding: $space-10 0;
}
.editor-page h1 {
  margin: $space-4 0 $space-7;
}
.editor-page form {
  display: grid;
  gap: $space-6;
}
.editor-page label {
  display: grid;
  gap: $space-2;
  font-weight: $font-weight-bold;
}
.toolbar,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2-5;
}
.actions {
  justify-content: flex-end;
}
.error {
  margin: 0;
  color: $color-danger-hover;
}
@media (max-width: $breakpoint-mobile-max) {
  .editor-page {
    width: min(100% - $page-inline-offset-mobile, $editor-max-width);
    padding-top: $space-6;
  }
  .actions > * {
    flex: 1;
  }
}
</style>
