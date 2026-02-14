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
            </div>
          </div>
          <div class="roster-team">
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
        v-for="name in filteredNames"
        :key="name"
        class="roster-dropdown-item"
        @click="selectName(activeDropdown, name)"
      >
        {{ name }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, reactive, ref } from 'vue'
import type { Player } from '@/types/player'
import { ROSTER_NAMES } from '@/data/roster'

const props = defineProps<{
  visible: boolean
  players: Player[]
  positionLabels: Record<string, string>
}>()

const emit = defineEmits<{
  close: []
  confirm: [changes: { id: string; name: string }[]]
}>()

const localData = reactive<Record<string, string>>({})
const activeDropdown = ref<string | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const homePlayers = computed(() => props.players.filter(p => p.team === 'home'))
const awayPlayers = computed(() => props.players.filter(p => p.team === 'away'))

const filteredNames = computed(() => ROSTER_NAMES)

watch(() => props.visible, (v) => {
  if (v) {
    for (const p of props.players) {
      localData[p.id] = p.name
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
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
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

function onConfirm() {
  const changes: { id: string; name: string }[] = []
  for (const p of props.players) {
    const name = localData[p.id]
    if (name !== undefined && name !== p.name) {
      changes.push({ id: p.id, name })
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
</style>
