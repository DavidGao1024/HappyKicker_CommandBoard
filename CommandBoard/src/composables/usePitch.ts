// Pitch dimensions in SVG units (1 unit = 0.1m, 9-a-side: 68m long x 52m wide)
export const PITCH_WIDTH = 520
export const PITCH_HEIGHT = 680
export const PITCH_PADDING = 30

export const SVG_WIDTH = PITCH_WIDTH + PITCH_PADDING * 2
export const SVG_HEIGHT = PITCH_HEIGHT + PITCH_PADDING * 2

export function usePitch() {
  // Convert fractional (0-1) coordinates to SVG coordinates
  function toSvgX(frac: number): number {
    return PITCH_PADDING + frac * PITCH_WIDTH
  }

  function toSvgY(frac: number): number {
    return PITCH_PADDING + frac * PITCH_HEIGHT
  }

  // Convert SVG coordinates to fractional
  function toFracX(svg: number): number {
    return (svg - PITCH_PADDING) / PITCH_WIDTH
  }

  function toFracY(svg: number): number {
    return (svg - PITCH_PADDING) / PITCH_HEIGHT
  }

  // Clamp SVG coordinates within pitch bounds
  function clampX(svg: number): number {
    return Math.max(PITCH_PADDING, Math.min(PITCH_PADDING + PITCH_WIDTH, svg))
  }

  function clampY(svg: number): number {
    return Math.max(PITCH_PADDING, Math.min(PITCH_PADDING + PITCH_HEIGHT, svg))
  }

  return { toSvgX, toSvgY, toFracX, toFracY, clampX, clampY }
}
