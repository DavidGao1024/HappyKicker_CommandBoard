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
      number: null,
      x: toSvgX(pos.x),
      y: toSvgY(pos.y),
      isCaptain: false,
    })
  }

  // Away team (mirrored vertically)
  for (let i = 0; i < 9; i++) {
    const pos = formation.positions[i]
    players.push({
      id: nextId(),
      team: 'away',
      name: '',
      number: null,
      x: toSvgX(pos.x),
      y: toSvgY(1 - pos.y),
      isCaptain: false,
    })
  }

  return players
}

export const STROKE_COLORS = [
  '#FFFFFF',
  '#B71C1C',
  '#000000',
  '#1565C0',
  '#F9A825',
  '#6A1B9A',
  '#E65100',
]

export const DEFAULT_HOME_STROKE = '#F9A825'
export const DEFAULT_AWAY_STROKE = '#B71C1C'
export const DEFAULT_HOME_FILL = '#1565C0'
export const DEFAULT_AWAY_FILL = '#B71C1C'

const homeStrokeColor = ref(DEFAULT_HOME_STROKE)
const awayStrokeColor = ref(DEFAULT_AWAY_STROKE)
const homeFillColor = ref(DEFAULT_HOME_FILL)
const awayFillColor = ref(DEFAULT_AWAY_FILL)

const players = ref<Player[]>(createDefaultPlayers())

export function usePlayers() {
  function updatePlayerPosition(id: string, x: number, y: number) {
    const player = players.value.find(p => p.id === id)
    if (player) {
      player.x = x
      player.y = y
    }
  }

  function updatePlayerInfo(id: string, name: string, num: number | null = null) {
    const idx = players.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      players.value[idx] = { ...players.value[idx], name, number: num }
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

  function setStrokeColor(team: Team, color: string) {
    if (team === 'home') {
      homeStrokeColor.value = color
    } else {
      awayStrokeColor.value = color
    }
  }

  function setFillColor(team: Team, color: string) {
    if (team === 'home') {
      homeFillColor.value = color
    } else {
      awayFillColor.value = color
    }
  }

  function resetAll() {
    idCounter = 0
    players.value = createDefaultPlayers()
    homeStrokeColor.value = DEFAULT_HOME_STROKE
    awayStrokeColor.value = DEFAULT_AWAY_STROKE
    homeFillColor.value = DEFAULT_HOME_FILL
    awayFillColor.value = DEFAULT_AWAY_FILL
  }

  function getSnapshot(): { players: Player[]; homeStroke: string; awayStroke: string; homeFill: string; awayFill: string } {
    return {
      players: players.value.map(p => ({ ...p })),
      homeStroke: homeStrokeColor.value,
      awayStroke: awayStrokeColor.value,
      homeFill: homeFillColor.value,
      awayFill: awayFillColor.value,
    }
  }

  function restoreSnapshot(snapshot: { players: Player[]; homeStroke: string; awayStroke: string; homeFill: string; awayFill: string }) {
    players.value = snapshot.players.map(p => ({ ...p }))
    homeStrokeColor.value = snapshot.homeStroke
    awayStrokeColor.value = snapshot.awayStroke
    homeFillColor.value = snapshot.homeFill
    awayFillColor.value = snapshot.awayFill
  }

  function setCaptain(playerId: string) {
    const targetPlayer = players.value.find(p => p.id === playerId)
    if (!targetPlayer) return

    const team = targetPlayer.team

    // 清除同队所有球员的队长标记，并设置目标球员为队长
    players.value = players.value.map(p => {
      if (p.team === team) {
        return { ...p, isCaptain: p.id === playerId }
      }
      return p
    })
  }

  function removeCaptain(playerId: string) {
    players.value = players.value.map(p =>
      p.id === playerId ? { ...p, isCaptain: false } : p
    )
  }

  return {
    players,
    homeStrokeColor,
    awayStrokeColor,
    homeFillColor,
    awayFillColor,
    updatePlayerPosition,
    updatePlayerInfo,
    applyFormationToTeam,
    setStrokeColor,
    setFillColor,
    resetAll,
    getSnapshot,
    restoreSnapshot,
    setCaptain,
    removeCaptain,
  }
}
