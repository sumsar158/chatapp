import type { ChatMessage, PinnedMessage, PinnedSettings } from './types'
import { id, now } from './utils'

export const createPin = (message: ChatMessage, settings: PinnedSettings): PinnedMessage => {
  const duration = settings.visibility.mode === 'timed' ? settings.visibility.durationSec : 0
  return {
    id: id('pin'),
    messageId: message.id,
    message,
    createdAt: now(),
    paused: false,
    manualPause: false,
    unblurredForOverlay: false,
    timerEndsAt: duration > 0 ? now() + duration * 1000 : null,
  }
}

export const toggleManualPause = (pin: PinnedMessage): PinnedMessage => ({
  ...pin,
  paused: !pin.paused,
  manualPause: true,
})
