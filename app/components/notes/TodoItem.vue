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
      <span class="todo-item__remove-icon" aria-hidden="true">×</span>
    </BaseIconButton>
  </li>
</template>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.todo-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: $space-2-5;
  align-items: center;
  padding: $space-1-5;
  border-radius: $radius-lg;
  transition: background-color $duration-fast $easing-standard;
}

.todo-item:hover,
.todo-item:focus-within {
  background: $color-surface-page;
}

.todo-item--checked :deep(.base-input) {
  color: $color-text-muted;
  text-decoration: line-through;
}
</style>
