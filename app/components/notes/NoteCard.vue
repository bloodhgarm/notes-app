<script setup lang="ts">
import type { Note } from '~/types/note'
defineProps<{ note: Note }>()
defineEmits<{ delete: [id: string] }>()
</script>

<template>
  <article class="card">
    <header>
      <h2>{{ note.title || 'Без названия' }}</h2>
      <BaseLinkButton :to="`/notes/${note.id}`">Редактировать</BaseLinkButton>
    </header>
    <ul v-if="note.todos.length">
      <li v-for="todo in note.todos.slice(0, 3)" :key="todo.id">
        <BaseCheckbox :model-value="todo.completed" disabled aria-label="Статус задачи" /><span
          :class="{ done: todo.completed }"
          >{{ todo.text || 'Без текста' }}</span
        >
      </li>
    </ul>
    <p v-else>Задач пока нет</p>
    <BaseButton class="card__delete" variant="danger" @click="$emit('delete', note.id)">
      Удалить
    </BaseButton>
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
.card header {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
}
.card h2 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: $font-size-heading-sm;
}
.card ul {
  display: grid;
  gap: $space-2-5;
  margin: 0;
  padding: 0;
  list-style: none;
}
.card li {
  display: flex;
  gap: $space-2-5;
  align-items: center;
  color: $color-text-secondary;
}
.done {
  text-decoration: line-through;
  opacity: $opacity-completed;
}
.card p {
  margin: 0;
  color: $color-text-muted;
}
.card__delete {
  justify-self: end;
}
</style>
