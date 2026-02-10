export interface FormationPosition {
  x: number // 0-1 fractional coordinate
  y: number // 0-1 fractional coordinate
}

export interface Formation {
  name: string
  label: string
  positions: FormationPosition[] // 9 positions: GK + 8 outfield
}

export const FORMATIONS: Formation[] = [
  {
    name: '3-3-2',
    label: '3-3-2',
    positions: [
      { x: 0.50, y: 0.92 }, // GK
      { x: 0.20, y: 0.72 }, // CB-L
      { x: 0.50, y: 0.72 }, // CB-C
      { x: 0.80, y: 0.72 }, // CB-R
      { x: 0.20, y: 0.48 }, // MF-L
      { x: 0.50, y: 0.48 }, // MF-C
      { x: 0.80, y: 0.48 }, // MF-R
      { x: 0.35, y: 0.25 }, // FW-L
      { x: 0.65, y: 0.25 }, // FW-R
    ],
  },
  {
    name: '3-2-3',
    label: '3-2-3',
    positions: [
      { x: 0.50, y: 0.92 },
      { x: 0.20, y: 0.72 },
      { x: 0.50, y: 0.72 },
      { x: 0.80, y: 0.72 },
      { x: 0.35, y: 0.48 },
      { x: 0.65, y: 0.48 },
      { x: 0.20, y: 0.25 },
      { x: 0.50, y: 0.25 },
      { x: 0.80, y: 0.25 },
    ],
  },
  {
    name: '2-3-3',
    label: '2-3-3',
    positions: [
      { x: 0.50, y: 0.92 },
      { x: 0.35, y: 0.72 },
      { x: 0.65, y: 0.72 },
      { x: 0.20, y: 0.48 },
      { x: 0.50, y: 0.48 },
      { x: 0.80, y: 0.48 },
      { x: 0.20, y: 0.25 },
      { x: 0.50, y: 0.25 },
      { x: 0.80, y: 0.25 },
    ],
  },
  {
    name: '1-3-2-2',
    label: '1-3-2-2',
    positions: [
      { x: 0.50, y: 0.92 },
      { x: 0.50, y: 0.76 },
      { x: 0.20, y: 0.58 },
      { x: 0.50, y: 0.58 },
      { x: 0.80, y: 0.58 },
      { x: 0.35, y: 0.38 },
      { x: 0.65, y: 0.38 },
      { x: 0.35, y: 0.20 },
      { x: 0.65, y: 0.20 },
    ],
  },
  {
    name: '3-4-1',
    label: '3-4-1',
    positions: [
      { x: 0.50, y: 0.92 },
      { x: 0.20, y: 0.72 },
      { x: 0.50, y: 0.72 },
      { x: 0.80, y: 0.72 },
      { x: 0.15, y: 0.45 },
      { x: 0.40, y: 0.45 },
      { x: 0.60, y: 0.45 },
      { x: 0.85, y: 0.45 },
      { x: 0.50, y: 0.22 },
    ],
  },
  {
    name: '2-4-2',
    label: '2-4-2',
    positions: [
      { x: 0.50, y: 0.92 },
      { x: 0.35, y: 0.72 },
      { x: 0.65, y: 0.72 },
      { x: 0.15, y: 0.48 },
      { x: 0.40, y: 0.48 },
      { x: 0.60, y: 0.48 },
      { x: 0.85, y: 0.48 },
      { x: 0.35, y: 0.25 },
      { x: 0.65, y: 0.25 },
    ],
  },
]
