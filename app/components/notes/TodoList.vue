<script setup lang="ts">
import type { Todo } from '~/types/note'

defineProps<{
  todos: Todo[]
  showValidation?: boolean
}>()

defineEmits<{
  add: []
  remove: [todoId: string]
  toggle: [todoId: string]
  'update-text': [todoId: string, value: string]
  flush: []
}>()
</script>

<template>
  <section class="todo-list" aria-labelledby="todo-list-title">
    <div class="todo-list__heading">
      <h2 id="todo-list-title">Задачи</h2>
      <BaseButton variant="secondary" @click="$emit('add')">Добавить задачу</BaseButton>
    </div>
    <ul v-if="todos.length">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        :invalid="showValidation && !todo.text.trim()"
        @toggle="$emit('toggle', todo.id)"
        @update-text="$emit('update-text', todo.id, $event)"
        @remove="$emit('remove', todo.id)"
        @flush="$emit('flush')"
      />
    </ul>
    <p v-else class="todo-list__empty">Добавьте первую задачу.</p>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.todo-list {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.todo-list__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.todo-list h2 {
  margin: 0;
  font-size: 1.125rem;
}

.todo-list ul {
  display: grid;
  gap: 6px;
  margin: 14px -6px 0;
  padding: 0;
  list-style: none;
}

.todo-list__empty {
  margin: 20px 0 0;
  color: #64748b;
}

@media (max-width: $breakpoint-mobile-max) {
  .todo-list__heading {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
