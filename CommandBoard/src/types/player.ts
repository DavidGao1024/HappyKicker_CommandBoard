export type Team = 'home' | 'away'

export interface Player {
  id: string
  team: Team
  name: string
  number: number | null
  x: number
  y: number
  isCaptain: boolean
}
