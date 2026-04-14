export type Platform = 'twitch' | 'kick'

export interface ChannelTarget {
  id: string
  platform: Platform
  name: string
  enabled: boolean
}

export interface EmoteToken {
  provider: 'twitch' | '7tv' | 'bttv' | 'ffz'
  code: string
  url: string
}

export interface ChatMessage {
  id: string
  platform: Platform
  channel: string
  username: string
  avatarUrl: string
  content: string
  timestamp: number
  filtered: boolean
  emotes: EmoteToken[]
}

export type OverlayAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface Positioning {
  anchor: OverlayAnchor
  dockToChat: boolean
  dockSide: 'top' | 'bottom'
  offsetX: number
  offsetY: number
}

export interface BoxStyle {
  color: string
  alpha: number
  recentColors: string[]
}

export interface PinnedVisibility {
  mode: 'permanent' | 'timed'
  durationSec: number
}

export interface PinnedSettings {
  position: Positioning
  visibility: PinnedVisibility
  widthMode: 'chat-match' | 'manual'
  widthPx: number
  showAvatar: boolean
  showUsername: boolean
  showPlatform: boolean
  showChannel: boolean
  glowBorderColor: string
  fontSizePx: number
}

export interface ChatOverlaySettings {
  position: Positioning
  widthPx: number
  heightPx: number
  visible: boolean
  fontSizePx: number
  boxStyle: BoxStyle
  messageStyle: BoxStyle
  textStyle: BoxStyle
  alternateRows: {
    enabled: boolean
    style: BoxStyle
  }
}

export interface AppSettings {
  accentTheme: Platform
  colorMode: 'light' | 'dark'
  chatFontSizePx: number
  blockedWords: string[]
  channels: ChannelTarget[]
  pinned: PinnedSettings
  chatOverlay: ChatOverlaySettings
}

export interface PinnedMessage {
  id: string
  messageId: string
  message: ChatMessage
  createdAt: number
  paused: boolean
  timerEndsAt: number | null
  manualPause: boolean
  unblurredForOverlay: boolean
}

export interface ConnectionStatus {
  platform: Platform
  healthy: boolean
  latencyMs: number
  lastHeartbeat: number
  detail: string
}

export interface SystemState {
  settings: AppSettings
  messages: ChatMessage[]
  activePins: PinnedMessage[]
  pinHistory: PinnedMessage[]
  status: ConnectionStatus[]
}

export const defaultPositioning = (): Positioning => ({
  anchor: 'middle-center',
  dockToChat: false,
  dockSide: 'bottom',
  offsetX: 0,
  offsetY: 0,
})

export const defaultBoxStyle = (color: string): BoxStyle => ({
  color,
  alpha: 85,
  recentColors: [color],
})

export const createDefaultSettings = (): AppSettings => ({
  accentTheme: 'twitch',
  colorMode: 'dark',
  chatFontSizePx: 16,
  blockedWords: [],
  channels: [
    { id: 'twitch-main', platform: 'twitch', name: 'main', enabled: true },
    { id: 'kick-main', platform: 'kick', name: 'main', enabled: true },
  ],
  pinned: {
    position: defaultPositioning(),
    visibility: { mode: 'timed', durationSec: 15 },
    widthMode: 'chat-match',
    widthPx: 520,
    showAvatar: true,
    showUsername: true,
    showPlatform: true,
    showChannel: true,
    glowBorderColor: '#7c3aed',
    fontSizePx: 26,
  },
  chatOverlay: {
    position: defaultPositioning(),
    widthPx: 520,
    heightPx: 650,
    visible: true,
    fontSizePx: 20,
    boxStyle: defaultBoxStyle('#111827'),
    messageStyle: defaultBoxStyle('#1f2937'),
    textStyle: defaultBoxStyle('#ffffff'),
    alternateRows: {
      enabled: false,
      style: defaultBoxStyle('#0f172a'),
    },
  },
})
