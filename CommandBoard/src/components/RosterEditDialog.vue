<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="$emit('close')">
      <div class="roster-dialog" @click="closeDropdown">
        <h3>编辑球员</h3>
        <div class="roster-teams">
          <div class="roster-team">
            <div class="roster-team-header">
              <span class="team-dot team-dot--home"></span>
              主队
            </div>
            <div
              v-for="(p, i) in homePlayers"
              :key="p.id"
              class="roster-row"
            >
              <span class="roster-index">{{ i + 1 }}</span>
              <span class="roster-pos-label">{{ positionLabels[p.id] || '--' }}</span>
              <div class="roster-input-wrapper">
                <input
                  ref="inputRefs[p.id]"
                  type="text"
                  class="roster-name"
                  :value="localData[p.id]"
                  maxlength="10"
                  placeholder="点击选择"
                  readonly
                  @click.stop="toggleDropdown(p.id, $event)"
                />
              </div>
              <label class="switch" @click.stop="toggleCaptain(p.id)">
                <input type="checkbox" :checked="localCaptains[p.id]" @click.stop.prevent />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="roster-team" v-if="showAwayTeam">
            <div class="roster-team-header">
              <span class="team-dot team-dot--away"></span>
              客队
            </div>
            <div
              v-for="(p, i) in awayPlayers"
              :key="p.id"
              class="roster-row"
            >
              <span class="roster-index">{{ i + 1 }}</span>
              <span class="roster-pos-label">{{ positionLabels[p.id] || '--' }}</span>
              <div class="roster-input-wrapper">
                <input
                  ref="inputRefs[p.id]"
                  type="text"
                  class="roster-name"
                  :value="localData[p.id]"
                  maxlength="10"
                  placeholder="点击选择"
                  readonly
                  @click.stop="toggleDropdown(p.id, $event)"
                />
              </div>
              <label class="switch" @click.stop="toggleCaptain(p.id)">
                <input type="checkbox" :checked="localCaptains[p.id]" @click.stop.prevent />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn-confirm" @click="onConfirm">确定</button>
        </div>
      </div>
    </div>

    <!-- 下拉列表单独一层 -->
    <div
      v-if="activeDropdown && dropdownStyle"
      class="roster-dropdown-teleport"
      :style="dropdownStyle"
      @click.stop
    >
      <div
        v-for="entry in filteredNames"
        :key="entry.name"
        class="roster-dropdown-item"
        @click="selectName(activeDropdown, entry.name)"
      >
        <span v-if="entry.number != null" class="roster-dropdown-num">{{ entry.number }}</span>
        {{ entry.name }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, reactive, ref } from 'vue'
import type { Player } from '@/types/player'
import { ROSTER } from '@/data/roster'

const props = defineProps<{
  visible: boolean
  players: Player[]
  positionLabels: Record<string, string>
  showAwayTeam: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [changes: { id: string; name: string; number: number | null; isCaptain: boolean }[]]
}>()

const localData = reactive<Record<string, string>>({})
const localCaptains = reactive<Record<string, boolean>>({})
const activeDropdown = ref<string | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const homePlayers = computed(() => props.players.filter(p => p.team === 'home'))
const awayPlayers = computed(() => props.players.filter(p => p.team === 'away'))

const filteredNames = computed(() => ROSTER)

watch(() => props.visible, (v) => {
  if (v) {
    for (const p of props.players) {
      localData[p.id] = p.name
      localCaptains[p.id] = p.isCaptain
    }
    activeDropdown.value = null
  }
})

function toggleDropdown(id: string, e: MouseEvent) {
  if (activeDropdown.value === id) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = id
    const input = e.target as HTMLInputElement
    const rect = input.getBoundingClientRect()

    // 计算下拉列表高度，确保不会覆盖当前行的开关
    const dropdownMaxHeight = 350
    const spaceBelow = window.innerHeight - rect.bottom - 4
    const shouldShowAbove = spaceBelow < dropdownMaxHeight && rect.top > dropdownMaxHeight

    dropdownStyle.value = {
      position: 'fixed',
      top: shouldShowAbove ? `${rect.top - Math.min(dropdownMaxHeight, rect.top) - 4}px` : `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }
}

function closeDropdown() {
  activeDropdown.value = null
}

function selectName(id: string, name: string) {
  // 如果该球员已在其他位置，先清除老位置
  for (const playerId in localData) {
    if (localData[playerId] === name && playerId !== id) {
      localData[playerId] = ''
    }
  }
  // 设置新位置
  localData[id] = name
  activeDropdown.value = null
}

function toggleCaptain(id: string) {
  closeDropdown()

  const currentValue = localCaptains[id]
  const targetPlayer = props.players.find(p => p.id === id)
  if (!targetPlayer) return

  const team = targetPlayer.team

  // 如果当前是关闭状态，要打开它
  if (!currentValue) {
    // 清除同队所有球员的队长状态
    Object.keys(localCaptains).forEach(playerId => {
      const player = props.players.find(p => p.id === playerId)
      if (player && player.team === team) {
        localCaptains[playerId] = false
      }
    })
    // 设置当前球员为队长
    localCaptains[id] = true
  } else {
    // 如果当前是打开状态，关闭它
    localCaptains[id] = false
  }
}

function onConfirm() {
  const changes: { id: string; name: string; number: number | null; isCaptain: boolean }[] = []
  for (const p of props.players) {
    const name = localData[p.id]
    const isCaptain = localCaptains[p.id] ?? false
    const nameChanged = name !== undefined && name !== p.name
    const captainChanged = isCaptain !== p.isCaptain

    if (nameChanged || captainChanged) {
      const num = ROSTER.find(e => e.name === name)?.number ?? null
      changes.push({ id: p.id, name: name ?? p.name, number: num, isCaptain })
    }
  }
  emit('confirm', changes)
  emit('close')
}
</script>

<style scoped>
.roster-input-wrapper {
  position: relative;
  flex: 1;
}

.roster-dropdown-teleport {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 350px;
  overflow-y: auto;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.roster-dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  color: #333;
}

.roster-dropdown-item:hover {
  background: #f0f0f0;
}

.roster-dropdown-num {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  font-size: 11px;
  text-align: center;
  margin-right: 6px;
  flex-shrink: 0;
}

.roster-captain-checkbox {
  margin-left: 8px;
  cursor: pointer;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin-left: 8px;
  z-index: 1;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:focus + .slider {
  box-shadow: 0 0 1px #4CAF50;
}
</style>
