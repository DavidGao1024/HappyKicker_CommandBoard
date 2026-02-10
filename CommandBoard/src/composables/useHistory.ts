import { ref, computed } from 'vue'
import type { Player } from '@/types/player'
import type { DrawingElement } from '@/types/drawing'

interface Snapshot {
  players: Player[]
  drawings: DrawingElement[]
}

const undoStack = ref<Snapshot[]>([])
const redoStack = ref<Snapshot[]>([])

export function useHistory() {
  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function pushState(snapshot: Snapshot) {
    undoStack.value.push(snapshot)
    redoStack.value = []
    // Limit stack size
    if (undoStack.value.length > 50) {
      undoStack.value.shift()
    }
  }

  function undo(currentSnapshot: Snapshot): Snapshot | null {
    const prev = undoStack.value.pop()
    if (!prev) return null
    redoStack.value.push(currentSnapshot)
    return prev
  }

  function redo(currentSnapshot: Snapshot): Snapshot | null {
    const next = redoStack.value.pop()
    if (!next) return null
    undoStack.value.push(currentSnapshot)
    return next
  }

  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
  }

  return { canUndo, canRedo, pushState, undo, redo, clearHistory }
}
