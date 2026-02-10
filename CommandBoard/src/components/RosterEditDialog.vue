<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="$emit('close')">
      <div class="roster-dialog">
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
              <input
                type="text"
                class="roster-name"
                :value="localData[p.id]"
                maxlength="10"
                placeholder="姓名"
                @input="onNameChange(p.id, $event)"
              />
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
              <input
                type="text"
                class="roster-name"
                :value="localData[p.id]"
                maxlength="10"
                placeholder="姓名"
                @input="onNameChange(p.id, $event)"
              />
            </div>
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
import { computed, watch, reactive } from 'vue'
import type { Player } from '@/types/player'

const props = defineProps<{
  visible: boolean
  players: Player[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [changes: { id: string; name: string }[]]
}>()

const localData = reactive<Record<string, string>>({})

const homePlayers = computed(() => props.players.filter(p => p.team === 'home'))
const awayPlayers = computed(() => props.players.filter(p => p.team === 'away'))

watch(() => props.visible, (v) => {
  if (v) {
    for (const p of props.players) {
      localData[p.id] = p.name
    }
  }
})

function onNameChange(id: string, e: Event) {
  localData[id] = (e.target as HTMLInputElement).value
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
