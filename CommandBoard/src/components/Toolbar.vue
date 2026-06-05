<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <label class="toolbar-label"><span class="team-dot team-dot--home" :style="{ backgroundColor: homeFillColor, borderColor: homeStrokeColor }"></span>主队阵型</label>
      <select :value="homeFormation" @change="$emit('homeFormation', ($event.target as HTMLSelectElement).value)">
        <option v-for="f in formations" :key="f.name" :value="f.name">{{ f.label }}</option>
      </select>
      <div class="team-colors">
        <div class="color-dropdown">
          <span class="color-dropdown-label">底</span>
          <div class="color-trigger-wrapper">
            <button
              class="color-trigger color-trigger--fill"
              :style="{ backgroundColor: homeFillColor }"
              @click.stop="toggleDropdown('homeFill')"
            />
            <div v-if="activeDropdown === 'homeFill'" class="color-dropdown-panel" @click.stop>
              <button
                v-for="color in strokeColors"
                :key="color"
                class="color-option color-option--fill"
                :class="{ active: homeFillColor === color }"
                :style="{ backgroundColor: color }"
                @click="selectColor('setHomeFillColor', color)"
              />
            </div>
          </div>
        </div>
        <div class="color-dropdown">
          <span class="color-dropdown-label">边</span>
          <div class="color-trigger-wrapper">
            <button
              class="color-trigger color-trigger--ring"
              :style="{ borderColor: homeStrokeColor }"
              @click.stop="toggleDropdown('homeStroke')"
            />
            <div v-if="activeDropdown === 'homeStroke'" class="color-dropdown-panel" @click.stop>
              <button
                v-for="color in strokeColors"
                :key="color"
                class="color-option color-option--ring"
                :class="{ active: homeStrokeColor === color }"
                :style="{ borderColor: color }"
                @click="selectColor('setHomeStrokeColor', color)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="toolbar-section">
      <label class="toolbar-label"><span class="team-dot team-dot--away" :style="{ backgroundColor: awayFillColor, borderColor: awayStrokeColor }"></span>客队阵型</label>
      <select :value="awayFormation" @change="$emit('awayFormation', ($event.target as HTMLSelectElement).value)">
        <option v-for="f in formations" :key="f.name" :value="f.name">{{ f.label }}</option>
      </select>
      <div class="team-colors">
        <div class="color-dropdown">
          <span class="color-dropdown-label">底</span>
          <div class="color-trigger-wrapper">
            <button
              class="color-trigger color-trigger--fill"
              :style="{ backgroundColor: awayFillColor }"
              @click.stop="toggleDropdown('awayFill')"
            />
            <div v-if="activeDropdown === 'awayFill'" class="color-dropdown-panel" @click.stop>
              <button
                v-for="color in strokeColors"
                :key="color"
                class="color-option color-option--fill"
                :class="{ active: awayFillColor === color }"
                :style="{ backgroundColor: color }"
                @click="selectColor('setAwayFillColor', color)"
              />
            </div>
          </div>
        </div>
        <div class="color-dropdown">
          <span class="color-dropdown-label">边</span>
          <div class="color-trigger-wrapper">
            <button
              class="color-trigger color-trigger--ring"
              :style="{ borderColor: awayStrokeColor }"
              @click.stop="toggleDropdown('awayStroke')"
            />
            <div v-if="activeDropdown === 'awayStroke'" class="color-dropdown-panel" @click.stop>
              <button
                v-for="color in strokeColors"
                :key="color"
                class="color-option color-option--ring"
                :class="{ active: awayStrokeColor === color }"
                :style="{ borderColor: color }"
                @click="selectColor('setAwayStrokeColor', color)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="toolbar-section">
      <button
        class="toggle-show-btn"
        :title="showAwayTeam ? '点击仅显示本方' : '点击显示双方'"
        @click="$emit('toggleShowAway')"
      >
        {{ showAwayTeam ? '双方' : '本方' }}
      </button>
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
        <button title="保存/分享" @click="$emit('saveScreenshot')">保存/分享</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
  showAwayTeam: boolean
  homeStrokeColor: string
  awayStrokeColor: string
  homeFillColor: string
  awayFillColor: string
  strokeColors: string[]
}>()

const emit = defineEmits<{
  homeFormation: [name: string]
  awayFormation: [name: string]
  setTool: [tool: DrawingTool]
  setColor: [color: string]
  undo: []
  redo: []
  clearDrawings: []
  resetAll: []
  editRoster: []
  saveScreenshot: []
  toggleShowAway: []
  setHomeStrokeColor: [color: string]
  setAwayStrokeColor: [color: string]
  setHomeFillColor: [color: string]
  setAwayFillColor: [color: string]
}>()

const activeDropdown = ref<string | null>(null)

function toggleDropdown(key: string) {
  activeDropdown.value = activeDropdown.value === key ? null : key
}

function selectColor(eventName: 'setHomeStrokeColor' | 'setAwayStrokeColor' | 'setHomeFillColor' | 'setAwayFillColor', color: string) {
  switch (eventName) {
    case 'setHomeStrokeColor':
      emit('setHomeStrokeColor', color)
      break
    case 'setAwayStrokeColor':
      emit('setAwayStrokeColor', color)
      break
    case 'setHomeFillColor':
      emit('setHomeFillColor', color)
      break
    case 'setAwayFillColor':
      emit('setAwayFillColor', color)
      break
  }
  activeDropdown.value = null
}

function closeDropdown() {
  activeDropdown.value = null
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.team-colors {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.color-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
}
.color-trigger-wrapper {
  position: relative;
}
.color-dropdown-label {
  font-size: 11px;
  color: #666;
}
.color-trigger {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  background: transparent;
}
.color-trigger--fill {
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.color-trigger--ring {
  border: 4px solid;
  background: transparent;
}
.color-dropdown-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  max-width: 90vw;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}
.color-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  background: transparent;
}
.color-option--fill {
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.color-option--fill.active {
  transform: scale(1.25);
}
.color-option--ring {
  border: 4px solid;
  background: transparent;
}
.color-option--ring.active {
  transform: scale(1.25);
}
</style>
