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
  <main class="notes-page">
    <header class="notes-page__header">
      <div class="notes-page__intro">
        <p class="notes-page__eyebrow">Мои заметки</p>
        <h1 class="notes-page__title">Задачи под контролем</h1>
      </div>
      <BaseLinkButton class="notes-page__create" to="/notes/new" appearance="solid">
        Создать заметку
      </BaseLinkButton>
    </header>
    <section v-if="notesStore.notes.length" class="notes-page__grid">
      <NoteCard
        v-for="note in notesStore.notes"
        :key="note.id"
        :note="note"
        @delete="noteToDelete = $event"
      />
    </section>
    <section v-else class="notes-page__empty">
      <h2 class="notes-page__empty-title">Заметок ещё нет</h2>
      <p class="notes-page__empty-text">Создайте первую заметку и добавьте задачи.</p>
    </section>
    <ConfirmModal
      :open="Boolean(noteToDelete)"
      title="Удалить заметку?"
      confirm-label="Удалить"
      @cancel="noteToDelete = null"
      @confirm="remove"
    >
      <p class="notes-page__delete-message">Заметка и все её задачи будут удалены.</p>
    </ConfirmModal>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/tokens' as *;

.notes-page {
  @include page-container($page-max-width);
  padding: $space-12 0;
}
.notes-page__header {
  position: sticky;
  z-index: $z-index-sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  gap: $space-6;
  align-items: center;
  padding: $space-4 0;
  margin: (-$space-4) 0 $space-4;
  border-bottom: $border-width solid $color-border-default;
  background: $color-surface-page;
}
.notes-page__eyebrow {
  margin: 0 0 $space-1-5;
  color: $color-primary;
  font-weight: $font-weight-bold;
}
.notes-page__title {
  margin: 0;
  font-size: clamp(
    $font-size-page-title-min,
    $font-size-page-title-fluid,
    $font-size-page-title-max
  );
}
.notes-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-4;
}
.notes-page__empty {
  padding: $space-14 $space-6;
  border: $border-width dashed $color-border-control;
  border-radius: $radius-xl;
  text-align: center;
  color: $color-text-muted;
}
.notes-page__empty-title {
  color: $color-text-primary;
}
@media (max-width: $breakpoint-mobile-max) {
  .notes-page {
    padding-top: $space-7;
  }
  .notes-page__header {
    align-items: start;
    flex-direction: column;
  }
  .notes-page__create {
    width: 100%;
    justify-content: center;
    text-align: center;
  }
}
</style>
