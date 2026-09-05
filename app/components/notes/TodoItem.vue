<script setup lang="ts">
import type { Todo } from '~/types/note'

defineProps<{
  todo: Todo
  invalid?: boolean
}>()

defineEmits<{
  toggle: []
  'update-text': [value: string]
  remove: []
  flush: []
}>()
</script>

<template>
  <li class="todo-item" :class="{ 'todo-item--checked': todo.completed }">
    <BaseCheckbox
      :id="`todo-${todo.id}`"
      :model-value="todo.completed"
      :aria-label="`Отметить задачу ${todo.text || ''}`"
      @update:model-value="$emit('toggle')"
    />
    <BaseInput
      :model-value="todo.text"
      placeholder="Текст задачи"
      :invalid="invalid"
      :aria-label="`Текст задачи ${todo.text || ''}`"
      @update:model-value="$emit('update-text', $event)"
      @blur="$emit('flush')"
    />
    <BaseIconButton
      variant="danger"
      :label="`Удалить задачу ${todo.text || 'без текста'}`"
      @click="$emit('remove')"
    >
      <span aria-hidden="true">×</span>
    </BaseIconButton>
  </li>
</template>

<style scoped lang="scss">
.todo-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.todo-item:hover,
.todo-item:focus-within {
  background: #f8fafc;
}

.todo-item--checked :deep(.base-input) {
  color: #64748b;
  text-decoration: line-through;
}
</style>
