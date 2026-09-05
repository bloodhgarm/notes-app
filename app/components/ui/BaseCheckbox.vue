<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{ modelValue: boolean; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="base-checkbox" :class="{ 'base-checkbox--disabled': disabled }">
    <input
      v-bind="$attrs"
      class="base-checkbox__input"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="base-checkbox__control" aria-hidden="true">✓</span>
  </label>
</template>

<style scoped lang="scss">
.base-checkbox {
  position: relative;
  display: inline-flex;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  cursor: pointer;
}
.base-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}
.base-checkbox__control {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border: 1px solid #c0c4cc;
  border-radius: 4px;
  color: transparent;
  background: #fff;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}
.base-checkbox:hover:not(.base-checkbox--disabled) .base-checkbox__control {
  border-color: #409eff;
}
.base-checkbox__input:checked + .base-checkbox__control {
  border-color: #409eff;
  color: #fff;
  background: #409eff;
}
.base-checkbox__input:focus-visible + .base-checkbox__control {
  outline: 3px solid rgba(64, 159, 255, 0.3);
  outline-offset: 2px;
}
.base-checkbox--disabled {
  cursor: not-allowed;
}
.base-checkbox--disabled .base-checkbox__control {
  border-color: #dcdfe6;
  color: #c0c4cc;
  background: #f2f6fc;
}
.base-checkbox--disabled .base-checkbox__input:checked + .base-checkbox__control {
  border-color: #a0cfff;
  color: #fff;
  background: #a0cfff;
}
</style>
