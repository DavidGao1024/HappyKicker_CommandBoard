<template>
  <g
    class="player-marker"
    :data-team="player.team"
    :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
    @pointerdown.stop.prevent="onPointerDown"
    @pointermove.stop="onPointerMove"
    @pointerup.stop="onPointerUp"
    @pointercancel.stop="onPointerUp"
  >
    <!-- Invisible larger hit area for easier dragging -->
    <circle
      :cx="player.x"
      :cy="player.y"
      :r="props.hitRadius"
      fill="white"
      fill-opacity="0"
      pointer-events="all"
      stroke="none"
    />
    <circle
      :cx="player.x"
      :cy="player.y"
      :r="props.radius"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="2 * props.radius / 14"
    />
    <!-- Number inside circle -->
    <text
      v-if="player.number != null"
      :x="player.x"
      :y="player.y"
      text-anchor="middle"
      dominant-baseline="central"
      :fill="'#000000'"
      :font-size="numberFontSize"
      font-weight="bold"
      font-family="Arial, sans-serif"
      pointer-events="none"
      style="user-select: none"
    >
      {{ player.number }}
    </text>
    <!-- Name below circle -->
    <text
      v-if="player.name"
      :x="player.x"
      :y="player.y + props.radius + nameOffset"
      text-anchor="middle"
      dominant-baseline="hanging"
      :fill="nameColor"
      :font-size="nameFontSize"
      font-weight="bold"
      font-family="Arial, sans-serif"
      pointer-events="none"
      style="user-select: none"
    >
      {{ displayName }}
    </text>
  </g>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Player } from '@/types/player'
import { usePitch } from '@/composables/usePitch'

const props = defineProps<{
  player: Player
  svgEl: SVGSVGElement | null
  radius: number
  hitRadius: number
}>()

const emit = defineEmits<{
  move: [id: string, x: number, y: number]
  dragStart: [id: string]
  dragEnd: []
  edit: [player: Player]
}>()

const { clampX, clampY } = usePitch()

const displayName = computed(() => {
  const name = props.player.name
  if (name.length <= 3) return name
  return name.slice(0, 3)
})

const numberFontSize = computed(() => {
  return Math.round(props.radius * 0.9)
})

const nameFontSize = computed(() => {
  return Math.round(props.radius * 0.65)
})

const nameOffset = computed(() => {
  return Math.round(props.radius * 0.35)
})

const fillColor = computed(() =>
  props.player.team === 'home' ? '#FFFFFF' : '#E53935'
)
const strokeColor = computed(() =>
  props.player.team === 'home' ? '#333333' : '#B71C1C'
)
const nameColor = computed(() =>
  props.player.team === 'home' ? '#FFFFFF' : '#E53935'
)

const isDragging = ref(false)
let hasMoved = false

function getSvgPoint(e: PointerEvent): { x: number; y: number } | null {
  const svg = props.svgEl
  if (!svg) return null
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const svgPt = pt.matrixTransform(ctm.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  isDragging.value = true
  hasMoved = false
  emit('dragStart', props.player.id)
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  hasMoved = true
  const pt = getSvgPoint(e)
  if (pt) {
    emit('move', props.player.id, clampX(pt.x), clampY(pt.y))
  }
}

function onPointerUp(_e: PointerEvent) {
  if (!isDragging.value) return
  isDragging.value = false
  emit('dragEnd')

  if (!hasMoved) {
    emit('edit', props.player)
  }
}
</script>
