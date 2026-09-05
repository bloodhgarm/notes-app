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
.card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}
.card header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.card h2 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 1.125rem;
}
.card ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.card li {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #475569;
}
.done {
  text-decoration: line-through;
  opacity: 0.7;
}
.card p {
  margin: 0;
  color: #64748b;
}
.card__delete {
  justify-self: end;
}
</style>
