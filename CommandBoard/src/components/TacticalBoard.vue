<template>
  <div class="tactical-board">
    <Toolbar
      :formations="formations"
      :home-formation="homeFormation"
      :away-formation="awayFormation"
      :active-tool="activeTool"
      :active-color="activeColor"
      :colors="DRAWING_COLORS"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @home-formation="onHomeFormation"
      @away-formation="onAwayFormation"
      @set-tool="setTool"
      @set-color="(c) => (activeColor = c)"
      @undo="onUndo"
      @redo="onRedo"
      @clear-drawings="onClearDrawings"
      @reset-all="onResetAll"
      @edit-roster="rosterDialogVisible = true"
    />

    <div class="pitch-container">
      <svg
        ref="svgRef"
        :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`"
        class="pitch-svg"
        :class="{
          'drawing-mode': activeTool !== 'none' && activeTool !== 'eraser',
          'eraser-mode': activeTool === 'eraser',
        }"
        @pointerdown="onSvgPointerDown"
        @pointermove="onSvgPointerMove"
        @pointerup="onSvgPointerUp"
      >
        <FootballPitch />
        <DrawingsLayer
          :drawings="drawings"
          :current-drawing="currentDrawing"
          :eraser-active="activeTool === 'eraser'"
          @erase="onErase"
        />
        <PlayersLayer
          :players="players"
          :svg-el="svgRef"
          @move="onPlayerMove"
          @drag-start="onPlayerDragStart"
          @drag-end="onPlayerDragEnd"
          @edit="onEditPlayer"
        />
      </svg>
    </div>

    <PlayerEditDialog
      :visible="editDialogVisible"
      :player="editingPlayer"
      :position-label="editingPlayer ? positionLabelMap[editingPlayer.id] ?? '' : ''"
      @close="editDialogVisible = false"
      @confirm="onEditConfirm"
    />

    <RosterEditDialog
      :visible="rosterDialogVisible"
      :players="players"
      :position-labels="positionLabelMap"
      @close="rosterDialogVisible = false"
      @confirm="onRosterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SVG_WIDTH, SVG_HEIGHT } from '@/composables/usePitch'
import { usePlayers } from '@/composables/usePlayers'
import { useFormations } from '@/composables/useFormations'
import { useDrawing, DRAWING_COLORS } from '@/composables/useDrawing'
import { useHistory } from '@/composables/useHistory'
import type { Player } from '@/types/player'
import { FORMATIONS } from '@/types/formation'
import FootballPitch from './FootballPitch.vue'
import PlayersLayer from './PlayersLayer.vue'
import DrawingsLayer from './DrawingsLayer.vue'
import Toolbar from './Toolbar.vue'
import PlayerEditDialog from './PlayerEditDialog.vue'
import RosterEditDialog from './RosterEditDialog.vue'

const svgRef = ref<SVGSVGElement | null>(null)

const {
  players,
  updatePlayerPosition,
  updatePlayerInfo,
  applyFormationToTeam,
  resetAll: resetPlayers,
  getSnapshot: getPlayersSnapshot,
  restoreSnapshot: restorePlayersSnapshot,
} = usePlayers()

const { formations, homeFormation, awayFormation } = useFormations()

const {
  activeTool,
  activeColor,
  drawings,
  currentDrawing,
  setTool,
  startDrawing,
  continueDrawing,
  finishDrawing,
  eraseDrawing,
  clearDrawings,
  getSnapshot: getDrawingsSnapshot,
  restoreSnapshot: restoreDrawingsSnapshot,
} = useDrawing()

const { canUndo, canRedo, pushState, undo, redo, clearHistory } = useHistory()

// --- Snapshot helpers ---
function takeSnapshot() {
  return { players: getPlayersSnapshot(), drawings: getDrawingsSnapshot() }
}

function restoreFromSnapshot(snap: { players: Player[]; drawings: ReturnType<typeof getDrawingsSnapshot> }) {
  restorePlayersSnapshot(snap.players)
  restoreDrawingsSnapshot(snap.drawings)
}

// --- Player drag ---
let playerDragSnapshot: ReturnType<typeof takeSnapshot> | null = null

function onPlayerDragStart(_id: string) {
  playerDragSnapshot = takeSnapshot()
}

function onPlayerMove(id: string, x: number, y: number) {
  updatePlayerPosition(id, x, y)
}

function onPlayerDragEnd() {
  if (playerDragSnapshot) {
    pushState(playerDragSnapshot)
    playerDragSnapshot = null
  }
}

// --- Formation changes ---
function onHomeFormation(name: string) {
  pushState(takeSnapshot())
  homeFormation.value = name
  applyFormationToTeam('home', name)
}

function onAwayFormation(name: string) {
  pushState(takeSnapshot())
  awayFormation.value = name
  applyFormationToTeam('away', name)
}

// --- Drawing ---
let isDrawingActive = false

function getSvgPoint(e: PointerEvent): { x: number; y: number } | null {
  const svg = svgRef.value
  if (!svg) return null
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const svgPt = pt.matrixTransform(ctm.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

function onSvgPointerDown(e: PointerEvent) {
  if (activeTool.value === 'none' || activeTool.value === 'eraser') return
  if (e.button !== 0) return

  const pt = getSvgPoint(e)
  if (!pt) return

  isDrawingActive = true
  startDrawing(pt)
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
}

function onSvgPointerMove(e: PointerEvent) {
  if (!isDrawingActive) return
  const pt = getSvgPoint(e)
  if (!pt) return
  continueDrawing(pt)
}

function onSvgPointerUp(_e: PointerEvent) {
  if (!isDrawingActive) return
  isDrawingActive = false
  const snap = takeSnapshot()
  const element = finishDrawing()
  if (element) {
    // Push the snapshot from BEFORE the drawing was added
    pushState(snap)
  }
}

function onErase(id: string) {
  pushState(takeSnapshot())
  eraseDrawing(id)
}

// --- Actions ---
function onUndo() {
  const snap = undo(takeSnapshot())
  if (snap) restoreFromSnapshot(snap)
}

function onRedo() {
  const snap = redo(takeSnapshot())
  if (snap) restoreFromSnapshot(snap)
}

function onClearDrawings() {
  if (drawings.value.length === 0) return
  pushState(takeSnapshot())
  clearDrawings()
}

function onResetAll() {
  pushState(takeSnapshot())
  resetPlayers()
  clearDrawings()
  clearHistory()
  homeFormation.value = formations[0].name
  awayFormation.value = formations[0].name
}

// --- Player edit ---
const editDialogVisible = ref(false)
const editingPlayer = ref<Player | null>(null)

// Compute position label map: player id → position abbreviation
const positionLabelMap = computed(() => {
  const map: Record<string, string> = {}
  const homeF = FORMATIONS.find(f => f.name === homeFormation.value)
  const awayF = FORMATIONS.find(f => f.name === awayFormation.value)
  const home = players.value.filter(p => p.team === 'home')
  const away = players.value.filter(p => p.team === 'away')
  home.forEach((p, i) => { map[p.id] = homeF?.positionLabels[i] ?? '' })
  away.forEach((p, i) => { map[p.id] = awayF?.positionLabels[i] ?? '' })
  return map
})

function onEditPlayer(player: Player) {
  editingPlayer.value = player
  editDialogVisible.value = true
}

function onEditConfirm(id: string, name: string) {
  pushState(takeSnapshot())
  updatePlayerInfo(id, name)
}

// --- Roster edit ---
const rosterDialogVisible = ref(false)

function onRosterConfirm(changes: { id: string; name: string }[]) {
  if (changes.length === 0) return
  pushState(takeSnapshot())
  for (const c of changes) {
    updatePlayerInfo(c.id, c.name)
  }
}
</script>
