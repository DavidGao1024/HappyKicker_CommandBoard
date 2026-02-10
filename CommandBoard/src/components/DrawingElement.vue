<template>
  <g
    :class="{ 'eraser-target': eraserActive }"
    @click.stop="onErase"
  >
    <!-- Arrow -->
    <line
      v-if="element.type === 'arrow'"
      :x1="element.start.x"
      :y1="element.start.y"
      :x2="element.end.x"
      :y2="element.end.y"
      :stroke="element.color"
      stroke-width="3"
      :marker-end="`url(#arrowhead-${element.color.replace('#', '')})`"
    />

    <!-- Line -->
    <line
      v-if="element.type === 'line'"
      :x1="element.start.x"
      :y1="element.start.y"
      :x2="element.end.x"
      :y2="element.end.y"
      :stroke="element.color"
      stroke-width="3"
    />

    <!-- Path (freehand) -->
    <path
      v-if="element.type === 'path'"
      :d="pathD"
      :stroke="element.color"
      stroke-width="3"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Invisible wider hit area for eraser -->
    <line
      v-if="eraserActive && (element.type === 'arrow' || element.type === 'line')"
      :x1="element.start.x"
      :y1="element.start.y"
      :x2="element.end.x"
      :y2="element.end.y"
      stroke="transparent"
      stroke-width="12"
      style="cursor: pointer"
    />
    <path
      v-if="eraserActive && element.type === 'path'"
      :d="pathD"
      stroke="transparent"
      stroke-width="12"
      fill="none"
      style="cursor: pointer"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DrawingElement } from '@/types/drawing'

const props = defineProps<{
  element: DrawingElement
  eraserActive: boolean
}>()

const emit = defineEmits<{
  erase: [id: string]
}>()

const pathD = computed(() => {
  if (props.element.type !== 'path') return ''
  const pts = props.element.points
  if (pts.length === 0) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`
  }
  return d
})

function onErase() {
  if (props.eraserActive) {
    emit('erase', props.element.id)
  }
}
</script>

<style scoped>
.eraser-target:hover line,
.eraser-target:hover path {
  opacity: 0.5;
}
</style>
