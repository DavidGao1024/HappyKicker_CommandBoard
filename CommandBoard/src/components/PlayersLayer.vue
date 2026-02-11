<template>
  <g>
    <PlayerMarker
      v-for="player in sortedPlayers"
      :key="player.id"
      :player="player"
      :svg-el="svgEl"
      :radius="playerRadius"
      :hit-radius="playerHitRadius"
      @move="onMove"
      @drag-start="onDragStart"
      @drag-end="onDragEnd"
      @edit="$emit('edit', $event)"
    />
  </g>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { Player } from '@/types/player'
import { SVG_WIDTH } from '@/composables/usePitch'
import PlayerMarker from './PlayerMarker.vue'

const props = defineProps<{
  players: Player[]
  svgEl: SVGSVGElement | null
}>()

const emit = defineEmits<{
  move: [id: string, x: number, y: number]
  dragStart: [id: string]
  dragEnd: []
  edit: [player: Player]
}>()

const activePlayerId = ref<string | null>(null)

// Dynamic radius: smaller in portrait, larger in landscape.
const BASE_RADIUS_LANDSCAPE = 20
const BASE_RADIUS_PORTRAIT = 9
const MIN_SCREEN_RADIUS = 24
const svgScale = ref(1)
const isPortrait = ref(false)
let resizeObserver: ResizeObserver | null = null

watch(
  () => props.svgEl,
  (el, _old, onCleanup) => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (!el) return
    const update = () => {
      svgScale.value = el.clientWidth / SVG_WIDTH
      isPortrait.value = el.clientHeight > el.clientWidth
    }
    update()
    resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(el)
    onCleanup(() => resizeObserver?.disconnect())
  },
  { immediate: true },
)

onBeforeUnmount(() => resizeObserver?.disconnect())

const playerRadius = computed(() => {
  const base = isPortrait.value ? BASE_RADIUS_PORTRAIT : BASE_RADIUS_LANDSCAPE
  return Math.max(base, MIN_SCREEN_RADIUS / svgScale.value)
})
const playerHitRadius = computed(() => playerRadius.value * 2)

const sortedPlayers = computed(() => {
  // Away (red) first, home (white) last so white renders on top
  const away = props.players.filter(p => p.team === 'away')
  const home = props.players.filter(p => p.team === 'home')
  const ordered = [...away, ...home]
  if (!activePlayerId.value) return ordered
  const active = ordered.find(p => p.id === activePlayerId.value)
  if (!active) return ordered
  return [...ordered.filter(p => p.id !== activePlayerId.value), active]
})

function onDragStart(id: string) {
  activePlayerId.value = id
  emit('dragStart', id)
}

function onDragEnd() {
  activePlayerId.value = null
  emit('dragEnd')
}

function onMove(id: string, x: number, y: number) {
  emit('move', id, x, y)
}
</script>
