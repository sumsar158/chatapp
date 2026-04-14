import { randomInt } from 'node:crypto'
import type { Server } from 'socket.io'
import { isFiltered } from './filter'
import { parseEmotes } from './emotes'
import { addMessage, getState, setStatus, trimExpiredPins } from './store'
import type { ChannelTarget, ChatMessage, ConnectionStatus, Platform } from './types'
import { id, now } from './utils'

const sampleMessages = [
  'Huge play Kappa',
  'That was clean Pog',
  'No way OMEGALUL',
  'Chat is flying EZ',
  'Pin this one please Kappa',
]

const usernames = ['streamfan', 'modbot', 'viewer42', 'hype_train', 'nightowl']

const platformColor = (platform: Platform): string =>
  platform === 'twitch' ? '9147ff' : '53fc18'

const pick = <T>(items: T[]): T => items[randomInt(0, items.length)]

export class IngestionEngine {
  private io: Server

  private channelTimers = new Map<string, NodeJS.Timeout>()

  private statusTimer: NodeJS.Timeout | null = null

  private pinTimer: NodeJS.Timeout | null = null

  constructor(io: Server) {
    this.io = io
  }

  start(): void {
    this.syncChannels(getState().settings.channels)
    this.statusTimer = setInterval(() => this.tickStatus(), 5000)
    this.pinTimer = setInterval(() => this.tickPins(), 1000)
  }

  stop(): void {
    this.channelTimers.forEach((timer) => clearInterval(timer))
    this.channelTimers.clear()
    if (this.statusTimer) clearInterval(this.statusTimer)
    if (this.pinTimer) clearInterval(this.pinTimer)
  }

  syncChannels(channels: ChannelTarget[]): void {
    const enabled = channels.filter((channel) => channel.enabled)
    const nextIds = new Set(enabled.map((channel) => channel.id))

    this.channelTimers.forEach((timer, idValue) => {
      if (!nextIds.has(idValue)) {
        clearInterval(timer)
        this.channelTimers.delete(idValue)
      }
    })

    enabled.forEach((channel) => {
      if (!this.channelTimers.has(channel.id)) {
        const timer = setInterval(() => this.emitMessage(channel), 2200 + randomInt(0, 1200))
        this.channelTimers.set(channel.id, timer)
      }
    })
  }

  private emitMessage(channel: ChannelTarget): void {
    const state = getState()
    const content = pick(sampleMessages)
    const message: ChatMessage = {
      id: id('msg'),
      platform: channel.platform,
      channel: channel.name,
      username: pick(usernames),
      avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${channel.platform}-${randomInt(0, 1_000_000)}`,
      content,
      timestamp: now(),
      filtered: isFiltered(content, state.settings.blockedWords),
      emotes: parseEmotes(content),
    }
    addMessage(message)
    this.io.emit('chat:message', message)
  }

  private tickStatus(): void {
    const previous = getState().status
    const next: ConnectionStatus[] = previous.map((item) => {
      const drift = randomInt(0, 41)
      const healthy = randomInt(0, 100) > 5
      return {
        ...item,
        healthy,
        latencyMs: healthy ? 45 + drift : 300 + drift,
        lastHeartbeat: now(),
        detail: healthy ? 'Connected' : 'Reconnecting',
      }
    })
    setStatus(next)
    this.io.emit('system:status', next)
  }

  private tickPins(): void {
    const removed = trimExpiredPins(now())
    if (removed.length) {
      removed.forEach((pin) => this.io.emit('pin:dismissed', pin.id))
      this.io.emit('pin:state', {
        activePins: getState().activePins,
        pinHistory: getState().pinHistory,
      })
    }
  }
}

export const computeOperational = (status: ConnectionStatus[]): 'Operational' | 'Degraded' | 'Down' => {
  if (status.every((item) => item.healthy)) {
    return 'Operational'
  }
  if (status.some((item) => item.healthy)) {
    return 'Degraded'
  }
  return 'Down'
}
