import type { AppSettings, SystemState } from '../types'

const asJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const fetchState = async (): Promise<SystemState & { operational: string }> =>
  asJson(await fetch('/api/state'))

export const patchSettings = async (settings: Partial<AppSettings>): Promise<AppSettings> =>
  asJson(
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }),
  )

export const pinMessage = async (messageId: string): Promise<void> => {
  await asJson(
    await fetch('/api/messages/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    }),
  )
}

export const togglePinPause = async (pinId: string): Promise<void> => {
  await asJson(await fetch(`/api/pins/${pinId}/pause`, { method: 'POST' }))
}

export const togglePinUnblur = async (pinId: string): Promise<void> => {
  await asJson(await fetch(`/api/pins/${pinId}/unblur`, { method: 'POST' }))
}

export const dismissPin = async (pinId: string): Promise<void> => {
  await asJson(await fetch(`/api/pins/${pinId}`, { method: 'DELETE' }))
}

export const addChannel = async (platform: 'twitch' | 'kick', name: string): Promise<void> => {
  await asJson(
    await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, name }),
    }),
  )
}

export const removeChannel = async (platform: string, name: string): Promise<void> => {
  await asJson(await fetch(`/api/channels/${platform}/${name}`, { method: 'DELETE' }))
}

export const resetSettings = async (): Promise<AppSettings> =>
  asJson(await fetch('/api/settings/reset', { method: 'POST' }))

export const exportSettings = async (): Promise<SystemState> =>
  asJson(await fetch('/api/settings/export'))

export const importSettings = async (payload: SystemState): Promise<SystemState> =>
  asJson(
    await fetch('/api/settings/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )

export const exportBlockedWords = async (): Promise<{ words: string[] }> =>
  asJson(await fetch('/api/blocked-words/export'))

export const importBlockedWords = async (words: string[]): Promise<void> => {
  await asJson(
    await fetch('/api/blocked-words/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words }),
    }),
  )
}
