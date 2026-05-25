<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="$emit('close')">
      <div class="dialog">
        <h3>编辑球员</h3>
        <div class="dialog-field">
          <label>位置</label>
          <span class="position-label">{{ positionLabel || '--' }}</span>
        </div>
        <div class="dialog-field">
          <label>姓名</label>
          <input
            type="text"
            v-model="localName"
            maxlength="10"
            placeholder="输入姓名或从下方选择"
            ref="nameInput"
            @keydown.enter="onConfirm"
            @click="localName = ''"
          />
        </div>
        <div class="dialog-field captain-field">
          <label>队长</label>
          <label class="switch">
            <input type="checkbox" v-model="localIsCaptain" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="roster-pick" v-show="!hideRoster">
          <label>快速选择</label>
          <div class="roster-pick-grid">
            <button
              v-for="entry in filteredRoster"
              :key="entry.name"
              class="roster-pick-btn"
              :class="{ selected: localName === entry.name }"
              @click="pickName(entry.name)"
            >
              <span v-if="entry.number != null" class="roster-num">{{ entry.number }}</span>
              {{ entry.name }}
            </button>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn-confirm" @click="onConfirm">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Player } from '@/types/player'
import { ROSTER } from '@/data/roster'

const props = defineProps<{
  visible: boolean
  player: Player | null
  positionLabel: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [id: string, name: string, number: number | null, isCaptain: boolean]
}>()

const localName = ref('')
const localIsCaptain = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)
const hideRoster = ref(false)

const filteredRoster = computed(() => {
  const q = localName.value.trim()
  if (!q) return ROSTER
  return ROSTER.filter(e => e.name.includes(q))
})

watch(() => props.player, (p) => {
  if (p) {
    localName.value = p.name
    localIsCaptain.value = p.isCaptain
    hideRoster.value = false
    nextTick(() => nameInput.value?.select())
  }
})

const pickedNumber = ref<number | null>(null)

function pickName(name: string) {
  hideRoster.value = true
  localName.value = name
  const entry = ROSTER.find(e => e.name === name)
  pickedNumber.value = entry?.number ?? null
  nextTick(() => onConfirm())
}

function onConfirm() {
  if (props.player) {
    const num = pickedNumber.value ?? ROSTER.find(e => e.name === localName.value)?.number ?? null
    emit('confirm', props.player.id, localName.value, num, localIsCaptain.value)
  }
  emit('close')
}
</script>

<style scoped>
.roster-num {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  font-size: 10px;
  text-align: center;
  margin-right: 2px;
  flex-shrink: 0;
}

.captain-field {
  justify-content: flex-start;
}

.captain-field label:first-child {
  margin-right: 12px;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin: 0;
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