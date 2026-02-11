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
          />
        </div>
        <div class="roster-pick">
          <label>快速选择</label>
          <div class="roster-pick-grid">
            <button
              v-for="name in filteredRoster"
              :key="name"
              class="roster-pick-btn"
              :class="{ selected: localName === name }"
              @click="pickName(name)"
            >
              {{ name }}
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
import { ROSTER_NAMES } from '@/data/roster'

const props = defineProps<{
  visible: boolean
  player: Player | null
  positionLabel: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [id: string, name: string]
}>()

const localName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const filteredRoster = computed(() => {
  const q = localName.value.trim()
  if (!q) return ROSTER_NAMES
  return ROSTER_NAMES.filter(n => n.includes(q))
})

watch(() => props.player, (p) => {
  if (p) {
    localName.value = p.name
    nextTick(() => nameInput.value?.select())
  }
})

function pickName(name: string) {
  localName.value = name
}

function onConfirm() {
  if (props.player) {
    emit('confirm', props.player.id, localName.value)
  }
  emit('close')
}
</script>
