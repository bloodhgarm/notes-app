<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const modal = ref<HTMLElement | null>(null)
const onKeydown = (event: KeyboardEvent) => { if (event.key === 'Escape') emit('close'); if (event.key !== 'Tab') return; const nodes = [...(modal.value?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),[href]') ?? [])]; if (!nodes.length) return; const first = nodes[0]!; const last = nodes.at(-1)!; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() } }
watch(() => props.open, async (open) => { if (open) { await nextTick(); modal.value?.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),[href]')?.focus() } })
</script>
<template><Teleport to="body"><div v-if="open" class="backdrop" @mousedown.self="$emit('close')"><section ref="modal" role="dialog" aria-modal="true" :aria-label="title" class="modal" @keydown="onKeydown"><header><h2>{{ title }}</h2><button type="button" aria-label="Закрыть" @click="$emit('close')">×</button></header><div><slot /></div><footer><slot name="footer" /></footer></section></div></Teleport></template>
<style scoped lang="scss">.backdrop{position:fixed;z-index:10;inset:0;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.55)}.modal{width:min(100%,480px);border-radius:12px;background:#fff;box-shadow:0 24px 64px rgba(15,23,42,.24)}.modal header,.modal footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 20px}.modal header{border-bottom:1px solid #e5e7eb}.modal h2{margin:0;font-size:1.125rem}.modal header button{border:0;background:none;font-size:1.5rem;cursor:pointer}.modal>div{padding:20px;color:#475569}.modal footer{justify-content:end;border-top:1px solid #e5e7eb}</style>
