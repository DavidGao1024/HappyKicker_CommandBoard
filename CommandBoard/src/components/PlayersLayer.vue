<template>
  <g>
    <PlayerMarker
      v-for="player in sortedPlayers"
      :key="player.id"
      :player="player"
      :svg-el="svgEl"
      @move="onMove"
      @drag-start="onDragStart"
      @drag-end="onDragEnd"
      @edit="$emit('edit', $event)"
    />
  </g>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Player } from '@/types/player'
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

const sortedPlayers = computed(() => {
  if (!activePlayerId.value) return props.players
  const active = props.players.find(p => p.id === activePlayerId.value)
  if (!active) return props.players
  return [...props.players.filter(p => p.id !== activePlayerId.value), active]
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
