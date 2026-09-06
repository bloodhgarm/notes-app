<script setup lang="ts">
import type { Note } from '~/types/note'
defineProps<{ note: Note }>()
defineEmits<{ delete: [id: string] }>()
</script>

<template>
  <article class="card">
    <header class="card__header">
      <h2 class="card__title">{{ note.title || 'Без названия' }}</h2>
    </header>
    <ul v-if="note.todos.length" class="card__todos">
      <li v-for="todo in note.todos.slice(0, 3)" :key="todo.id" class="card__todo">
        <BaseCheckbox :model-value="todo.completed" disabled aria-label="Статус задачи" />
        <span class="card__todo-text" :class="{ 'card__todo-text--completed': todo.completed }">
          {{ todo.text || 'Без текста' }}
        </span>
      </li>
    </ul>
    <p v-else class="card__empty">Задач пока нет</p>
    <div class="card__actions">
      <BaseLinkButton class="card__edit" :to="`/notes/${note.id}`">Редактировать</BaseLinkButton>
      <BaseButton class="card__delete" variant="danger" @click="$emit('delete', note.id)">
        Удалить
      </BaseButton>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.card {
  display: grid;
  gap: $space-4;
  padding: $space-5;
  border: $border-width solid $color-border-default;
  border-radius: $radius-xl;
  background: $color-surface-raised;
}
.card__header {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
}
.card__title {
  min-width: 0;
  margin: 0;
  display: -webkit-box;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: $font-size-heading-sm;
}
.card__todos {
  display: grid;
  gap: $space-2-5;
  margin: 0;
  padding: 0;
  list-style: none;
}
.card__todo {
  display: flex;
  min-width: 0;
  gap: $space-2-5;
  align-items: center;
  color: $color-text-secondary;
}
.card__todo-text {
  min-width: 0;
  overflow-wrap: anywhere;
}
.card__todo-text--completed {
  text-decoration: line-through;
  opacity: $opacity-completed;
}
.card__empty {
  margin: 0;
  color: $color-text-muted;
}
.card__actions {
  display: flex;
  gap: $space-2;
  align-items: center;
  justify-content: flex-end;
}
</style>
