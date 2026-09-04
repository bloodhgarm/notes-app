<script setup lang="ts">
import type { Note } from '~/types/note'
defineProps<{ note: Note }>()
defineEmits<{ delete: [id: string] }>()
</script>

<template>
  <article class="card">
    <header>
      <h2>{{ note.title || 'Без названия' }}</h2>
      <NuxtLink :to="`/notes/${note.id}`">Редактировать</NuxtLink>
    </header>
    <ul v-if="note.todos.length">
      <li v-for="todo in note.todos.slice(0, 3)" :key="todo.id">
        <input type="checkbox" :checked="todo.completed" disabled /><span
          :class="{ done: todo.completed }"
          >{{ todo.text || 'Без текста' }}</span
        >
      </li>
    </ul>
    <p v-else>Задач пока нет</p>
    <button type="button" @click="$emit('delete', note.id)">Удалить</button>
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
.card a {
  color: #2563eb;
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
.card button {
  justify-self: end;
  padding: 0;
  border: 0;
  color: #b91c1c;
  background: none;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
</style>
