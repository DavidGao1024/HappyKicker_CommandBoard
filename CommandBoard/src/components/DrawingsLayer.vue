<template>
  <g>
    <!-- Arrow marker definition -->
    <defs>
      <marker
        v-for="color in markerColors"
        :key="color"
        :id="'arrowhead-' + color.replace('#', '')"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" :fill="color" />
      </marker>
    </defs>

    <DrawingElement
      v-for="drawing in drawings"
      :key="drawing.id"
      :element="drawing"
      :eraser-active="eraserActive"
      @erase="$emit('erase', $event)"
    />

    <!-- Current drawing preview -->
    <DrawingElement
      v-if="currentDrawing"
      :element="currentDrawing"
      :eraser-active="false"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DrawingElement as DrawingElementType } from '@/types/drawing'
import { DRAWING_COLORS } from '@/composables/useDrawing'
import DrawingElement from './DrawingElement.vue'

defineProps<{
  drawings: DrawingElementType[]
  currentDrawing: DrawingElementType | null
  eraserActive: boolean
}>()

defineEmits<{
  erase: [id: string]
}>()

const markerColors = computed(() => DRAWING_COLORS)
</script>
