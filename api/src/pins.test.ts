import { describe, expect, it } from 'vitest'
import { createPin, toggleManualPause } from './pins'
import type { ChatMessage } from './types'

const message: ChatMessage = {
  id: 'm1',
  platform: 'twitch',
  channel: 'main',
  username: 'tester',
  avatarUrl: 'https://example.com/avatar.png',
  content: 'hello',
  timestamp: Date.now(),
  filtered: false,
  emotes: [],
}

describe('pin rules', () => {
  it('keeps timer paused manually once toggled', () => {
    const pin = createPin(message, {
      position: {
        anchor: 'middle-center',
        dockToChat: false,
        dockSide: 'bottom',
        offsetX: 0,
        offsetY: 0,
      },
      visibility: { mode: 'timed', durationSec: 10 },
      widthMode: 'chat-match',
      widthPx: 500,
      showAvatar: true,
      showUsername: true,
      showPlatform: true,
      showChannel: true,
      glowBorderColor: '#fff',
      fontSizePx: 24,
    })

    const paused = toggleManualPause(pin)
    expect(paused.manualPause).toBe(true)
    expect(paused.paused).toBe(true)
    expect(paused.timerEndsAt).toBe(pin.timerEndsAt)
  })
})
