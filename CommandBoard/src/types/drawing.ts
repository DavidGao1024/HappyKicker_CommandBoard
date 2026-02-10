export type DrawingTool = 'arrow' | 'line' | 'pen' | 'eraser' | 'none'

export type DrawingColor = string

export interface Point {
  x: number
  y: number
}

export interface DrawingArrow {
  type: 'arrow'
  id: string
  color: string
  start: Point
  end: Point
}

export interface DrawingLine {
  type: 'line'
  id: string
  color: string
  start: Point
  end: Point
}

export interface DrawingPath {
  type: 'path'
  id: string
  color: string
  points: Point[]
}

export type DrawingElement = DrawingArrow | DrawingLine | DrawingPath
