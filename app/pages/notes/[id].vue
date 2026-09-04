<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
const validationMessage = ref('')

const initialize = () => {
  notesStore.hydrate()
  if (isNew.value) editor.startNew()
  else {
    const note = notesStore.getNoteById(id.value)
    if (!note) { missing.value = true; initialized.value = true; return }
    editor.startEditing(note)
  }
  if (editor.getStoredDraft(isNew.value ? 'new' : id.value)) restorePrompt.value = true
  initialized.value = true
}
const restore = () => { editor.restoreStoredDraft(isNew.value ? 'new' : id.value); restorePrompt.value = false }
const discardStored = () => { editor.discardStoredDraft(isNew.value ? 'new' : id.value); restorePrompt.value = false }
const save = () => {
  editor.flushTextChange()
  const note = editor.draft
  if (!note || !note.title.trim()) { validationMessage.value = 'Введите название заметки.'; return }
  if (note.todos.some((todo) => !todo.text.trim())) { validationMessage.value = 'Заполните текст каждой задачи или удалите пустую.'; return }
  const finished = editor.finishEditing()
  if (!finished) return
  notesStore.saveNote({ ...finished, title: finished.title.trim(), todos: finished.todos.map((todo) => ({ ...todo, text: todo.text.trim() })) })
  notesStore.persistNow()
  router.push('/')
}
const cancel = () => { editor.discardDraft(); cancelPrompt.value = false; router.push('/') }
const remove = () => { if (!isNew.value) notesStore.deleteNote(id.value); notesStore.persistNow(); editor.discardDraft(); deletePrompt.value = false; router.push('/') }
const onKeydown = (event: KeyboardEvent) => {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || (event.target as HTMLElement | null)?.isContentEditable) return
  event.preventDefault()
  if (event.shiftKey) editor.redo(); else editor.undo()
}
onMounted(() => { initialize(); window.addEventListener('keydown', onKeydown); window.addEventListener('storage', notesStore.handleStorageEvent) })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKeydown); window.removeEventListener('storage', notesStore.handleStorageEvent) })
</script>

<template>
  <main v-if="initialized" class="editor-page">
    <section v-if="missing" class="empty"><h1>Заметка не найдена</h1><NuxtLink to="/">Вернуться к списку</NuxtLink></section>
    <template v-else-if="editor.draft"><header><NuxtLink to="/">← Все заметки</NuxtLink><h1>{{ isNew ? 'Новая заметка' : 'Редактирование заметки' }}</h1></header><form @submit.prevent="save"><label>Название заметки<input :value="editor.draft.title" placeholder="Например, Покупки" @input="editor.updateTitle(($event.target as HTMLInputElement).value)" @blur="editor.flushTextChange"></label><p v-if="validationMessage" class="error">{{ validationMessage }}</p><div class="toolbar"><BaseButton type="button" :disabled="!editor.canUndo" @click="editor.undo">Отменить</BaseButton><BaseButton type="button" :disabled="!editor.canRedo" @click="editor.redo">Повторить</BaseButton></div><section class="todos"><div class="todos__heading"><h2>Задачи</h2><BaseButton type="button" variant="secondary" @click="editor.addTodo">Добавить задачу</BaseButton></div><ul><li v-for="todo in editor.draft.todos" :key="todo.id"><input :id="`todo-${todo.id}`" type="checkbox" :checked="todo.completed" :aria-label="`Отметить задачу ${todo.text || ''}`" @change="editor.toggleTodo(todo.id)"><input :value="todo.text" placeholder="Текст задачи" :class="{ completed: todo.completed }" @input="editor.updateTodoText(todo.id, ($event.target as HTMLInputElement).value)" @blur="editor.flushTextChange"><button type="button" :aria-label="`Удалить задачу ${todo.text || ''}`" @click="editor.removeTodo(todo.id)">×</button></li></ul><p v-if="!editor.draft.todos.length" class="muted">Добавьте первую задачу.</p></section><footer class="actions"><BaseButton type="button" @click="cancelPrompt = true">Отменить редактирование</BaseButton><BaseButton v-if="!isNew" type="button" variant="danger" @click="deletePrompt = true">Удалить</BaseButton><BaseButton type="submit" variant="primary">Сохранить</BaseButton></footer></form></template>
    <BaseModal :open="restorePrompt" title="Восстановить черновик?" @close="discardStored"><p>Найдены несохранённые изменения этой заметки.</p><template #footer><BaseButton @click="discardStored">Не восстанавливать</BaseButton><BaseButton variant="primary" @click="restore">Восстановить</BaseButton></template></BaseModal><BaseModal :open="cancelPrompt" title="Отменить редактирование?" @close="cancelPrompt = false"><p>Несохранённые изменения будут потеряны.</p><template #footer><BaseButton @click="cancelPrompt = false">Продолжить</BaseButton><BaseButton variant="danger" @click="cancel">Отменить изменения</BaseButton></template></BaseModal><BaseModal :open="deletePrompt" title="Удалить заметку?" @close="deletePrompt = false"><p>Это действие нельзя отменить.</p><template #footer><BaseButton @click="deletePrompt = false">Отмена</BaseButton><BaseButton variant="danger" @click="remove">Удалить</BaseButton></template></BaseModal>
  </main>
</template>

<style scoped lang="scss">
.editor-page { width:min(100% - 32px,760px); margin:0 auto; padding:40px 0; }.editor-page header>a,.empty a { color:#2563eb; }.editor-page h1 { margin:16px 0 28px; }.editor-page form { display:grid; gap:24px; }.editor-page label { display:grid; gap:8px; font-weight:700; }.editor-page input[type=text],.editor-page label>input { width:100%; min-height:44px; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font:inherit; }.editor-page input:focus-visible { outline:3px solid rgba(37,99,235,.3); border-color:#2563eb; }.toolbar,.actions { display:flex; flex-wrap:wrap; gap:10px; }.todos { padding:20px; border:1px solid #e2e8f0; border-radius:12px; background:#fff; }.todos__heading { display:flex; align-items:center; justify-content:space-between; gap:16px; }.todos h2 { margin:0; font-size:1.125rem; }.todos ul { display:grid; gap:10px; margin:20px 0 0; padding:0; list-style:none; }.todos li { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; }.todos li input[type=text],.todos li input:not([type]) { min-width:0; }.todos li button { width:36px; height:36px; border:0; border-radius:6px; color:#b91c1c; background:#fee2e2; font-size:1.4rem; cursor:pointer; }.completed { color:#64748b; text-decoration:line-through; }.actions { justify-content:flex-end; }.muted,.error { margin:0; color:#64748b; }.error { color:#b91c1c; } @media(max-width:540px){.editor-page{width:min(100% - 24px,760px);padding-top:24px}.todos__heading{align-items:start;flex-direction:column}.todos__heading .button{width:100%}.actions>*{flex:1}}
</style>
