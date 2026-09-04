<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
const notesStore = useNotesStore()
const noteToDelete = ref<string | null>(null)
onMounted(() => { notesStore.hydrate(); window.addEventListener('storage', notesStore.handleStorageEvent) })
onBeforeUnmount(() => window.removeEventListener('storage', notesStore.handleStorageEvent))
const remove = () => { if (!noteToDelete.value) return; notesStore.deleteNote(noteToDelete.value); notesStore.persistNow(); noteToDelete.value = null }
</script>

<template>
  <main class="page"><header><div><p>Мои заметки</p><h1>Задачи под контролем</h1></div><NuxtLink to="/notes/new">Создать заметку</NuxtLink></header><section v-if="notesStore.notes.length" class="grid"><NoteCard v-for="note in notesStore.notes" :key="note.id" :note="note" @delete="noteToDelete = $event" /></section><section v-else class="empty"><h2>Заметок ещё нет</h2><p>Создайте первую заметку и добавьте задачи.</p></section><BaseModal :open="Boolean(noteToDelete)" title="Удалить заметку?" @close="noteToDelete = null"><p>Заметка и все её задачи будут удалены.</p><template #footer><BaseButton @click="noteToDelete = null">Отмена</BaseButton><BaseButton variant="danger" @click="remove">Удалить</BaseButton></template></BaseModal></main>
</template>

<style scoped lang="scss">
.page { width:min(100% - 32px,1000px); margin:0 auto; padding:48px 0; }.page>header { display:flex; justify-content:space-between; gap:24px; align-items:center; margin-bottom:32px; }.page header p { margin:0 0 6px; color:#2563eb; font-weight:700; }.page h1 { margin:0; font-size:clamp(1.75rem,4vw,2.5rem); }.page>header a { padding:11px 16px; border-radius:8px; color:#fff; background:#2563eb; text-decoration:none; font-weight:600; }.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }.empty { padding:56px 24px; border:1px dashed #cbd5e1; border-radius:12px; text-align:center; color:#64748b; }.empty h2 { color:#334155; } @media(max-width:540px){.page{width:min(100% - 24px,1000px);padding-top:28px}.page>header{align-items:start;flex-direction:column}.page>header a{width:100%;text-align:center}}
</style>
