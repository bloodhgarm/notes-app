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
      <h2 id="todo-list-title" class="todo-list__title">Задачи</h2>
      <BaseButton variant="secondary" @click="$emit('add')">Добавить задачу</BaseButton>
    </div>
    <ul v-if="todos.length" class="todo-list__items">
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
  padding: $space-5;
  border: $border-width solid $color-border-default;
  border-radius: $radius-xl;
  background: $color-surface-raised;
}

.todo-list__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
}

.todo-list__title {
  margin: 0;
  font-size: $font-size-heading-sm;
}

.todo-list__items {
  display: grid;
  gap: $space-1-5;
  margin: $space-3-5 (-$space-1-5) 0;
  padding: 0;
  list-style: none;
}

.todo-list__empty {
  margin: $space-5 0 0;
  color: $color-text-muted;
}

@media (max-width: $breakpoint-mobile-max) {
  .todo-list__heading {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
