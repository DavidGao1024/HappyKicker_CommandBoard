import { ref, computed } from 'vue'
import type { DrawingTool, DrawingElement, Point } from '@/types/drawing'

let drawingIdCounter = 0
function nextDrawingId(): string {
  return `d${++drawingIdCounter}`
}

const activeTool = ref<DrawingTool>('none')
const activeColor = ref('#FFD700')
const drawings = ref<DrawingElement[]>([])
const currentDrawing = ref<DrawingElement | null>(null)

export const DRAWING_COLORS = [
  '#FFD700', // gold
  '#FF4444', // red
  '#4488FF', // blue
  '#44FF44', // green
  '#FFFFFF', // white
  '#FF8800', // orange
]

export function useDrawing() {
  const isDrawing = computed(() => activeTool.value !== 'none')

  function setTool(tool: DrawingTool) {
    activeTool.value = tool
    currentDrawing.value = null
  }

  function startDrawing(point: Point) {
    const tool = activeTool.value
    if (tool === 'none' || tool === 'eraser') return

    const id = nextDrawingId()
    if (tool === 'arrow') {
      currentDrawing.value = {
        type: 'arrow',
        id,
        color: activeColor.value,
        start: { ...point },
        end: { ...point },
      }
    } else if (tool === 'line') {
      currentDrawing.value = {
        type: 'line',
        id,
        color: activeColor.value,
        start: { ...point },
        end: { ...point },
      }
    } else if (tool === 'pen') {
      currentDrawing.value = {
        type: 'path',
        id,
        color: activeColor.value,
        points: [{ ...point }],
      }
    }
  }

  function continueDrawing(point: Point) {
    if (!currentDrawing.value) return

    if (currentDrawing.value.type === 'arrow' || currentDrawing.value.type === 'line') {
      currentDrawing.value.end = { ...point }
    } else if (currentDrawing.value.type === 'path') {
      currentDrawing.value.points.push({ ...point })
    }
  }

  function finishDrawing(): DrawingElement | null {
    if (!currentDrawing.value) return null

    // Don't add zero-length drawings
    if (currentDrawing.value.type === 'path' && currentDrawing.value.points.length < 2) {
      currentDrawing.value = null
      return null
    }
    if (
      (currentDrawing.value.type === 'arrow' || currentDrawing.value.type === 'line') &&
      currentDrawing.value.start.x === currentDrawing.value.end.x &&
      currentDrawing.value.start.y === currentDrawing.value.end.y
    ) {
      currentDrawing.value = null
      return null
    }

    const element = currentDrawing.value
    drawings.value.push(element)
    currentDrawing.value = null
    return element
  }

  function eraseDrawing(id: string) {
    drawings.value = drawings.value.filter(d => d.id !== id)
  }

  function clearDrawings() {
    drawings.value = []
    currentDrawing.value = null
  }

  function getSnapshot(): DrawingElement[] {
    return drawings.value.map(d => {
      if (d.type === 'path') {
        return { ...d, points: d.points.map(p => ({ ...p })) }
      }
      return { ...d, start: { ...d.start }, end: { ...d.end } }
    }) as DrawingElement[]
  }

  function restoreSnapshot(snapshot: DrawingElement[]) {
    drawings.value = snapshot.map(d => {
      if (d.type === 'path') {
        return { ...d, points: d.points.map(p => ({ ...p })) }
      }
      return { ...d, start: { ...d.start }, end: { ...d.end } }
    }) as DrawingElement[]
    currentDrawing.value = null
  }

  return {
    activeTool,
    activeColor,
    drawings,
    currentDrawing,
    isDrawing,
    setTool,
    startDrawing,
    continueDrawing,
    finishDrawing,
    eraseDrawing,
    clearDrawings,
    getSnapshot,
    restoreSnapshot,
  }
}
