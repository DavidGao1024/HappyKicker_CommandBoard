<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="$emit('close')">
      <div class="dialog">
        <h3>编辑球员</h3>
        <div class="dialog-field">
          <label>姓名</label>
          <input
            type="text"
            v-model="localName"
            maxlength="10"
            placeholder="输入姓名"
            ref="nameInput"
            @keydown.enter="onConfirm"
          />
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
import { ref, watch, nextTick } from 'vue'
import type { Player } from '@/types/player'

const props = defineProps<{
  visible: boolean
  player: Player | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [id: string, name: string]
}>()

const localName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

watch(() => props.player, (p) => {
  if (p) {
    localName.value = p.name
    nextTick(() => nameInput.value?.select())
  }
})

function onConfirm() {
  if (props.player) {
    emit('confirm', props.player.id, localName.value)
  }
  emit('close')
}
</script>
