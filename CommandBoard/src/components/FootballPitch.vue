<template>
  <g>
    <!-- Grass background -->
    <rect
      :x="padding" :y="padding"
      :width="pitchW" :height="pitchH"
      fill="#2d8a4e"
    />

    <!-- Pitch outline -->
    <rect
      :x="padding" :y="padding"
      :width="pitchW" :height="pitchH"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Half-way line -->
    <line
      :x1="padding" :y1="centerY"
      :x2="padding + pitchW" :y2="centerY"
      stroke="white" :stroke-width="sw"
    />

    <!-- Center circle -->
    <circle
      :cx="centerX" :cy="centerY" :r="centerCircleR"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Center spot -->
    <circle :cx="centerX" :cy="centerY" r="3" fill="white" />

    <!-- Top penalty area -->
    <rect
      :x="centerX - penAreaW / 2" :y="padding"
      :width="penAreaW" :height="penAreaH"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Bottom penalty area -->
    <rect
      :x="centerX - penAreaW / 2" :y="padding + pitchH - penAreaH"
      :width="penAreaW" :height="penAreaH"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Top goal area -->
    <rect
      :x="centerX - goalAreaW / 2" :y="padding"
      :width="goalAreaW" :height="goalAreaH"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Bottom goal area -->
    <rect
      :x="centerX - goalAreaW / 2" :y="padding + pitchH - goalAreaH"
      :width="goalAreaW" :height="goalAreaH"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Top penalty spot -->
    <circle :cx="centerX" :cy="padding + penSpotDist" r="3" fill="white" />

    <!-- Bottom penalty spot -->
    <circle :cx="centerX" :cy="padding + pitchH - penSpotDist" r="3" fill="white" />

    <!-- Top penalty arc -->
    <path
      :d="topPenArc"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Bottom penalty arc -->
    <path
      :d="bottomPenArc"
      fill="none" stroke="white" :stroke-width="sw"
    />

    <!-- Corner arcs -->
    <path :d="cornerArc(padding, padding, 1, 1)" fill="none" stroke="white" :stroke-width="sw" />
    <path :d="cornerArc(padding + pitchW, padding, -1, 1)" fill="none" stroke="white" :stroke-width="sw" />
    <path :d="cornerArc(padding, padding + pitchH, 1, -1)" fill="none" stroke="white" :stroke-width="sw" />
    <path :d="cornerArc(padding + pitchW, padding + pitchH, -1, -1)" fill="none" stroke="white" :stroke-width="sw" />

    <!-- Goals (drawn outside the pitch) -->
    <rect
      :x="centerX - goalW / 2" :y="padding - goalDepth"
      :width="goalW" :height="goalDepth"
      fill="none" stroke="white" :stroke-width="sw * 0.8"
    />
    <rect
      :x="centerX - goalW / 2" :y="padding + pitchH"
      :width="goalW" :height="goalDepth"
      fill="none" stroke="white" :stroke-width="sw * 0.8"
    />
  </g>
</template>

<script setup lang="ts">
import { PITCH_WIDTH, PITCH_HEIGHT, PITCH_PADDING } from '@/composables/usePitch'

const sw = 2 // stroke width
const padding = PITCH_PADDING
const pitchW = PITCH_WIDTH
const pitchH = PITCH_HEIGHT
const centerX = padding + pitchW / 2
const centerY = padding + pitchH / 2

// 9-a-side dimensions scaled to SVG units (1 unit = 0.1m, pitch 52m wide x 68m long)
const centerCircleR = 70 // 7m radius
const penAreaW = 320   // 32m wide
const penAreaH = 100    // 10m deep
const goalAreaW = 180   // 18m wide
const goalAreaH = 55    // 5.5m deep
const penSpotDist = 90  // 9m from goal line
const penArcR = 70      // 7m radius arc
const cornerR = 10      // 1m corner arc
const goalW = 50        // 5m goal width
const goalDepth = 15    // visual depth

// Penalty arc: arc outside penalty area
function computePenArc(spotY: number, areaEdgeY: number, direction: number): string {
  const dx = Math.sqrt(penArcR * penArcR - (areaEdgeY - spotY) ** 2)
  const startX = centerX - dx
  const endX = centerX + dx
  const sweepFlag = direction > 0 ? 1 : 0
  return `M ${startX} ${areaEdgeY} A ${penArcR} ${penArcR} 0 0 ${sweepFlag} ${endX} ${areaEdgeY}`
}

const topPenArc = computePenArc(padding + penSpotDist, padding + penAreaH, 1)
const bottomPenArc = computePenArc(padding + pitchH - penSpotDist, padding + pitchH - penAreaH, 0)

function cornerArc(cx: number, cy: number, dx: number, dy: number): string {
  const x1 = cx + cornerR * dx
  const y1 = cy
  const x2 = cx
  const y2 = cy + cornerR * dy
  const sweepFlag = (dx * dy > 0) ? 0 : 1
  return `M ${x1} ${y1} A ${cornerR} ${cornerR} 0 0 ${sweepFlag} ${x2} ${y2}`
}
</script>
