import { ref } from 'vue'
import type { Player, Team } from '@/types/player'
import { usePitch } from './usePitch'
import { FORMATIONS } from '@/types/formation'

const { toSvgX, toSvgY } = usePitch()

let idCounter = 0
function nextId(): string {
  return `p${++idCounter}`
}

function createDefaultPlayers(): Player[] {
  const formation = FORMATIONS[0] // default 3-3-2
  const players: Player[] = []

  // Home team
  for (let i = 0; i < 9; i++) {
    const pos = formation.positions[i]
    players.push({
      id: nextId(),
      team: 'home',
      name: '',
      x: toSvgX(pos.x),
      y: toSvgY(pos.y),
    })
  }

  // Away team (mirrored vertically)
  for (let i = 0; i < 9; i++) {
    const pos = formation.positions[i]
    players.push({
      id: nextId(),
      team: 'away',
      name: '',
      x: toSvgX(pos.x),
      y: toSvgY(1 - pos.y),
    })
  }

  return players
}

const players = ref<Player[]>(createDefaultPlayers())

export function usePlayers() {
  function updatePlayerPosition(id: string, x: number, y: number) {
    const player = players.value.find(p => p.id === id)
    if (player) {
      player.x = x
      player.y = y
    }
  }

  function updatePlayerInfo(id: string, name: string) {
    const player = players.value.find(p => p.id === id)
    if (player) {
      player.name = name
    }
  }

  function applyFormationToTeam(team: Team, formationName: string) {
    const formation = FORMATIONS.find(f => f.name === formationName)
    if (!formation) return

    const teamPlayers = players.value.filter(p => p.team === team)
    teamPlayers.forEach((player, i) => {
      const pos = formation.positions[i]
      if (!pos) return
      if (team === 'home') {
        player.x = toSvgX(pos.x)
        player.y = toSvgY(pos.y)
      } else {
        // Mirror vertically for away team
        player.x = toSvgX(pos.x)
        player.y = toSvgY(1 - pos.y)
      }
    })
  }

  function resetAll() {
    idCounter = 0
    players.value = createDefaultPlayers()
  }

  function getSnapshot(): Player[] {
    return players.value.map(p => ({ ...p }))
  }

  function restoreSnapshot(snapshot: Player[]) {
    players.value = snapshot.map(p => ({ ...p }))
  }

  return {
    players,
    updatePlayerPosition,
    updatePlayerInfo,
    applyFormationToTeam,
    resetAll,
    getSnapshot,
    restoreSnapshot,
  }
}
