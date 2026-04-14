import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import {
  addChannel,
  dismissPin,
  exportBlockedWords,
  exportSettings,
  fetchState,
  importBlockedWords,
  importSettings,
  patchSettings,
  pinMessage,
  removeChannel,
  resetSettings,
  togglePinPause,
  togglePinUnblur,
} from '../lib/api'
import type { AppSettings, ChatMessage, ConnectionStatus, PinnedMessage, Platform, SystemState } from '../types'

const socket = io('/', { autoConnect: false })

type Operational = 'Operational' | 'Degraded' | 'Down'

const pushLimited = <T>(items: T[], item: T, max: number): T[] => [...items, item].slice(-max)

const toOperational = (status: ConnectionStatus[]): Operational => {
  if (status.every((item) => item.healthy)) return 'Operational'
  if (status.some((item) => item.healthy)) return 'Degraded'
  return 'Down'
}

export const useChatApp = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activePins, setActivePins] = useState<PinnedMessage[]>([])
  const [pinHistory, setPinHistory] = useState<PinnedMessage[]>([])
  const [status, setStatus] = useState<ConnectionStatus[]>([])
  const [revealedMessageIds, setRevealedMessageIds] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    fetchState().then((state) => {
      if (!mounted) return
      setSettings(state.settings)
      setMessages(state.messages)
      setActivePins(state.activePins)
      setPinHistory(state.pinHistory)
      setStatus(state.status)
      const nextFilters: Record<string, boolean> = {}
      state.settings.channels.forEach((channel) => {
        nextFilters[channel.id] = true
      })
      setFilters(nextFilters)
    })

    socket.connect()
    socket.on('chat:message', (message: ChatMessage) => {
      setMessages((prev) => pushLimited(prev, message, 400))
    })
    socket.on('system:status', (next: ConnectionStatus[]) => setStatus(next))
    socket.on('pin:added', (pin: PinnedMessage) => {
      setActivePins((prev) => [pin, ...prev.filter((item) => item.id !== pin.id)])
      setPinHistory((prev) => [pin, ...prev.filter((item) => item.id !== pin.id)].slice(0, 25))
    })
    socket.on('pin:updated', (pin: PinnedMessage) => {
      setActivePins((prev) => prev.map((item) => (item.id === pin.id ? pin : item)))
      setPinHistory((prev) => prev.map((item) => (item.id === pin.id ? pin : item)))
    })
    socket.on('pin:dismissed', (id: string) => {
      setActivePins((prev) => prev.filter((item) => item.id !== id))
    })
    socket.on('pin:state', (pinState: Pick<SystemState, 'activePins' | 'pinHistory'>) => {
      setActivePins(pinState.activePins)
      setPinHistory(pinState.pinHistory)
    })
    socket.on('settings:update', (nextSettings: AppSettings) => {
      setSettings(nextSettings)
      setFilters((prev) => {
        const next = { ...prev }
        nextSettings.channels.forEach((channel) => {
          if (!(channel.id in next)) next[channel.id] = true
        })
        return next
      })
    })

    return () => {
      mounted = false
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  const operational = useMemo(() => toOperational(status), [status])

  const visibleMessages = useMemo(() => {
    return messages.filter((message) => {
      const channelId = `${message.platform}-${message.channel}`
      return filters[channelId] ?? true
    })
  }, [messages, filters])

  const setPartialSettings = async (partial: Partial<AppSettings>) => {
    const next = await patchSettings(partial)
    setSettings(next)
  }

  const toggleMessageReveal = (id: string) => {
    setRevealedMessageIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleChannelFilter = (channelId: string) => {
    setFilters((prev) => ({ ...prev, [channelId]: !(prev[channelId] ?? true) }))
  }

  const toggleThemeAccent = async () => {
    if (!settings) return
    const accentTheme: Platform = settings.accentTheme === 'twitch' ? 'kick' : 'twitch'
    await setPartialSettings({ accentTheme })
  }

  const toggleColorMode = async () => {
    if (!settings) return
    await setPartialSettings({ colorMode: settings.colorMode === 'dark' ? 'light' : 'dark' })
  }

  const pin = async (messageId: string) => pinMessage(messageId)
  const pausePin = async (pinId: string) => togglePinPause(pinId)
  const unblurPin = async (pinId: string) => togglePinUnblur(pinId)
  const closePin = async (pinId: string) => dismissPin(pinId)

  const addManagedChannel = async (platform: Platform, name: string) => addChannel(platform, name)
  const deleteManagedChannel = async (platform: string, name: string) => removeChannel(platform, name)

  const resetAllSettings = async () => {
    const next = await resetSettings()
    setSettings(next)
  }

  const exportAllSettings = async () => {
    const payload = await exportSettings()
    return JSON.stringify(payload, null, 2)
  }

  const importAllSettings = async (raw: string) => {
    const payload = JSON.parse(raw) as SystemState
    const imported = await importSettings(payload)
    setSettings(imported.settings)
    setMessages(imported.messages)
    setActivePins(imported.activePins)
    setPinHistory(imported.pinHistory)
    setStatus(imported.status)
  }

  const exportWords = async () => {
    const payload = await exportBlockedWords()
    return JSON.stringify(payload.words, null, 2)
  }

  const importWords = async (raw: string) => {
    const words = JSON.parse(raw) as string[]
    await importBlockedWords(words)
  }

  return {
    settings,
    visibleMessages,
    activePins,
    pinHistory,
    status,
    filters,
    revealedMessageIds,
    operational,
    setPartialSettings,
    toggleMessageReveal,
    toggleChannelFilter,
    toggleThemeAccent,
    toggleColorMode,
    pin,
    pausePin,
    unblurPin,
    closePin,
    addManagedChannel,
    deleteManagedChannel,
    resetAllSettings,
    exportAllSettings,
    importAllSettings,
    exportWords,
    importWords,
  }
}
