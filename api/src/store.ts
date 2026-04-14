import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDefaultSettings, type AppSettings, type ChannelTarget, type ChatMessage, type ConnectionStatus, type PinnedMessage, type SystemState } from './types'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_FILE = path.resolve(rootDir, 'data', 'state.json')

const defaultStatus: ConnectionStatus[] = [
  {
    platform: 'twitch',
    healthy: true,
    latencyMs: 60,
    lastHeartbeat: Date.now(),
    detail: 'Connected',
  },
  {
    platform: 'kick',
    healthy: true,
    latencyMs: 70,
    lastHeartbeat: Date.now(),
    detail: 'Connected',
  },
]

const trimMessages = <T>(items: T[], limit: number): T[] => items.slice(-limit)

const ensureFile = (): void => {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial: SystemState = {
      settings: createDefaultSettings(),
      messages: [],
      activePins: [],
      pinHistory: [],
      status: defaultStatus,
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2))
  }
}

const load = (): SystemState => {
  ensureFile()
  const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as SystemState
  return {
    ...parsed,
    settings: {
      ...createDefaultSettings(),
      ...parsed.settings,
      channels: parsed.settings?.channels ?? createDefaultSettings().channels,
      blockedWords: parsed.settings?.blockedWords ?? [],
    },
    messages: parsed.messages ?? [],
    activePins: parsed.activePins ?? [],
    pinHistory: parsed.pinHistory ?? [],
    status: parsed.status?.length ? parsed.status : defaultStatus,
  }
}

let state = load()

const persist = (): void => {
  state = {
    ...state,
    messages: trimMessages(state.messages, 400),
    pinHistory: trimMessages(state.pinHistory, 25),
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2))
}

export const getState = (): SystemState => state

export const addMessage = (message: ChatMessage): void => {
  state.messages.push(message)
  state.messages = trimMessages(state.messages, 400)
  persist()
}

export const setChannels = (channels: ChannelTarget[]): void => {
  state.settings.channels = channels
  persist()
}

export const setStatus = (status: ConnectionStatus[]): void => {
  state.status = status
  persist()
}

export const updateSettings = (partial: Partial<AppSettings>): AppSettings => {
  state.settings = {
    ...state.settings,
    ...partial,
  }
  persist()
  return state.settings
}

export const resetSettings = (): AppSettings => {
  state.settings = createDefaultSettings()
  persist()
  return state.settings
}

export const upsertPin = (pin: PinnedMessage): void => {
  state.activePins = [pin, ...state.activePins.filter((item) => item.id !== pin.id)]
  state.pinHistory = [pin, ...state.pinHistory.filter((item) => item.id !== pin.id)].slice(0, 25)
  persist()
}

export const updatePin = (pinId: string, updater: (pin: PinnedMessage) => PinnedMessage): PinnedMessage | null => {
  const pin = state.activePins.find((item) => item.id === pinId)
  if (!pin) {
    return null
  }
  const updated = updater(pin)
  state.activePins = state.activePins.map((item) => (item.id === pinId ? updated : item))
  state.pinHistory = state.pinHistory.map((item) => (item.id === pinId ? updated : item))
  persist()
  return updated
}

export const dismissPin = (pinId: string): boolean => {
  const before = state.activePins.length
  state.activePins = state.activePins.filter((item) => item.id !== pinId)
  persist()
  return before !== state.activePins.length
}

export const trimExpiredPins = (nowTs: number): PinnedMessage[] => {
  const removed: PinnedMessage[] = []
  state.activePins = state.activePins.filter((pin) => {
    if (pin.paused || pin.manualPause || pin.timerEndsAt === null) {
      return true
    }
    const keep = pin.timerEndsAt > nowTs
    if (!keep) {
      removed.push(pin)
    }
    return keep
  })
  if (removed.length) {
    persist()
  }
  return removed
}

export const importState = (next: SystemState): SystemState => {
  state = {
    ...next,
    messages: trimMessages(next.messages ?? [], 400),
    pinHistory: trimMessages(next.pinHistory ?? [], 25),
    activePins: next.activePins ?? [],
  }
  persist()
  return state
}
