<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
const notesStore = useNotesStore()
const noteToDelete = ref<string | null>(null)
onMounted(() => {
  notesStore.hydrate()
  window.addEventListener('storage', notesStore.handleStorageEvent)
})
onBeforeUnmount(() => window.removeEventListener('storage', notesStore.handleStorageEvent))
const remove = () => {
  if (!noteToDelete.value) return
  notesStore.deleteNote(noteToDelete.value)
  notesStore.persistNow()
  noteToDelete.value = null
}
</script>

<template>
  <main class="page">
    <header>
      <div>
        <p>Мои заметки</p>
        <h1>Задачи под контролем</h1>
      </div>
      <NuxtLink to="/notes/new">Создать заметку</NuxtLink>
    </header>
    <section v-if="notesStore.notes.length" class="grid">
      <NoteCard
        v-for="note in notesStore.notes"
        :key="note.id"
        :note="note"
        @delete="noteToDelete = $event"
      />
    </section>
    <section v-else class="empty">
      <h2>Заметок ещё нет</h2>
      <p>Создайте первую заметку и добавьте задачи.</p>
    </section>
    <BaseModal :open="Boolean(noteToDelete)" title="Удалить заметку?" @close="noteToDelete = null"
      ><p>Заметка и все её задачи будут удалены.</p>
      <template #footer
        ><BaseButton @click="noteToDelete = null">Отмена</BaseButton
        ><BaseButton variant="danger" @click="remove">Удалить</BaseButton></template
      ></BaseModal
    >
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.page {
  width: min(100% - $page-inline-offset, $page-max-width);
  margin: 0 auto;
  padding: $space-12 0;
}
.page > header {
  display: flex;
  justify-content: space-between;
  gap: $space-6;
  align-items: center;
  margin-bottom: $space-8;
}
.page header p {
  margin: 0 0 $space-1-5;
  color: $color-primary;
  font-weight: $font-weight-bold;
}
.page h1 {
  margin: 0;
  font-size: clamp(
    $font-size-page-title-min,
    $font-size-page-title-fluid,
    $font-size-page-title-max
  );
}
.page > header a {
  padding: $space-2-5 $space-4;
  border-radius: $radius-lg;
  color: $color-text-on-accent;
  background: $color-primary;
  text-decoration: none;
  font-weight: $font-weight-semibold;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax($card-min-width, 1fr));
  gap: $space-4;
}
.empty {
  padding: $space-14 $space-6;
  border: $border-width dashed $color-border-control;
  border-radius: $radius-xl;
  text-align: center;
  color: $color-text-muted;
}
.empty h2 {
  color: $color-text-primary;
}
@media (max-width: $breakpoint-mobile-max) {
  .page {
    width: min(100% - $page-inline-offset-mobile, $page-max-width);
    padding-top: $space-7;
  }
  .page > header {
    align-items: start;
    flex-direction: column;
  }
  .page > header a {
    width: 100%;
    text-align: center;
  }
}
</style>
