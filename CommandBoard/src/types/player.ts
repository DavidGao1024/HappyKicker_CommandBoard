export type Team = 'home' | 'away'

export interface Player {
  id: string
  team: Team
  name: string
  x: number
  y: number
}
