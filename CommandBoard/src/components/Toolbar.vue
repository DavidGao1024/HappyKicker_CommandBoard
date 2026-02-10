<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <label class="toolbar-label"><span class="team-dot team-dot--home"></span>主队阵型</label>
      <select :value="homeFormation" @change="$emit('homeFormation', ($event.target as HTMLSelectElement).value)">
        <option v-for="f in formations" :key="f.name" :value="f.name">{{ f.label }}</option>
      </select>
    </div>

    <div class="toolbar-section">
      <label class="toolbar-label"><span class="team-dot team-dot--away"></span>客队阵型</label>
      <select :value="awayFormation" @change="$emit('awayFormation', ($event.target as HTMLSelectElement).value)">
        <option v-for="f in formations" :key="f.name" :value="f.name">{{ f.label }}</option>
      </select>
    </div>

    <div class="toolbar-divider" />

    <div class="toolbar-section">
      <label class="toolbar-label">绘制工具</label>
      <div class="tool-buttons">
        <button
          :class="{ active: activeTool === 'arrow' }"
          title="箭头"
          @click="$emit('setTool', 'arrow')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <line x1="4" y1="20" x2="18" y2="6" stroke="currentColor" stroke-width="2" />
            <polyline points="10,5 19,5 19,14" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
        <button
          :class="{ active: activeTool === 'line' }"
          title="直线"
          @click="$emit('setTool', 'line')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
        <button
          :class="{ active: activeTool === 'pen' }"
          title="画笔"
          @click="$emit('setTool', 'pen')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="none" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
        <button
          :class="{ active: activeTool === 'eraser' }"
          title="橡皮擦"
          @click="$emit('setTool', 'eraser')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M16.24 3.56l4.95 4.94-8.49 8.49H7.76L3.56 12.8l12.68-9.24z" fill="none" stroke="currentColor" stroke-width="2" />
            <line x1="2" y1="21" x2="22" y2="21" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
        <button
          v-if="activeTool !== 'none'"
          title="取消工具"
          @click="$emit('setTool', 'none')"
          class="cancel-tool"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="toolbar-section" v-if="activeTool !== 'none' && activeTool !== 'eraser'">
      <label class="toolbar-label">颜色</label>
      <div class="color-buttons">
        <button
          v-for="color in colors"
          :key="color"
          class="color-btn"
          :class="{ active: activeColor === color }"
          :style="{ backgroundColor: color }"
          @click="$emit('setColor', color)"
        />
      </div>
    </div>

    <div class="toolbar-divider" />

    <div class="toolbar-section">
      <div class="tool-buttons">
        <button :disabled="!canUndo" title="撤销" @click="$emit('undo')">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M12.5 8c-2.65 0-5.05 1.04-6.83 2.73L2 7v9h9l-3.62-3.62A8.94 8.94 0 0 1 12.5 10c3.86 0 7.14 2.42 8.44 5.83l1.94-.83A10.96 10.96 0 0 0 12.5 8z" fill="currentColor" />
          </svg>
        </button>
        <button :disabled="!canRedo" title="重做" @click="$emit('redo')">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M11.5 8c2.65 0 5.05 1.04 6.83 2.73L22 7v9h-9l3.62-3.62A8.94 8.94 0 0 0 11.5 10c-3.86 0-7.14 2.42-8.44 5.83l-1.94-.83A10.96 10.96 0 0 1 11.5 8z" fill="currentColor" />
          </svg>
        </button>
        <button title="清除绘制" @click="$emit('clearDrawings')">清除绘制</button>
        <button title="重置全部" @click="$emit('resetAll')">重置全部</button>
        <button title="编辑球员" @click="$emit('editRoster')">编辑球员</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DrawingTool } from '@/types/drawing'
import type { Formation } from '@/types/formation'

defineProps<{
  formations: Formation[]
  homeFormation: string
  awayFormation: string
  activeTool: DrawingTool
  activeColor: string
  colors: string[]
  canUndo: boolean
  canRedo: boolean
}>()

defineEmits<{
  homeFormation: [name: string]
  awayFormation: [name: string]
  setTool: [tool: DrawingTool]
  setColor: [color: string]
  undo: []
  redo: []
  clearDrawings: []
  resetAll: []
  editRoster: []
}>()
</script>
