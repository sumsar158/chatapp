import { useMemo, useState } from 'react'
import type { AppSettings, OverlayAnchor, Platform } from '../types'

interface SettingsPageProps {
  settings: AppSettings
  onSettingsPatch: (partial: Partial<AppSettings>) => Promise<void>
  onAddChannel: (platform: Platform, name: string) => Promise<void>
  onRemoveChannel: (platform: string, name: string) => Promise<void>
  onResetAll: () => Promise<void>
  onExportAll: () => Promise<string>
  onImportAll: (raw: string) => Promise<void>
  onExportWords: () => Promise<string>
  onImportWords: (raw: string) => Promise<void>
}

const anchors: OverlayAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

const uniqueRecent = (colors: string[], candidate: string): string[] => [candidate, ...colors.filter((item) => item !== candidate)].slice(0, 5)

export const SettingsPage = ({
  settings,
  onSettingsPatch,
  onAddChannel,
  onRemoveChannel,
  onResetAll,
  onExportAll,
  onImportAll,
  onExportWords,
  onImportWords,
}: SettingsPageProps) => {
  const [channelName, setChannelName] = useState('')
  const [channelPlatform, setChannelPlatform] = useState<Platform>('twitch')
  const [rawText, setRawText] = useState('')

  const blockedWordsText = useMemo(() => settings.blockedWords.join(', '), [settings.blockedWords])

  const patchPinned = (next: AppSettings['pinned']) => onSettingsPatch({ pinned: next })
  const patchChatOverlay = (next: AppSettings['chatOverlay']) => onSettingsPatch({ chatOverlay: next })

  return (
    <main className="settings-page">
      <details open>
        <summary>Channel Manager</summary>
        <div className="section-body">
          <div className="inline-form">
            <select value={channelPlatform} onChange={(event) => setChannelPlatform(event.target.value as Platform)}>
              <option value="twitch">Twitch</option>
              <option value="kick">Kick</option>
            </select>
            <input value={channelName} onChange={(event) => setChannelName(event.target.value)} placeholder="channel name" />
            <button
              onClick={async () => {
                if (!channelName.trim()) return
                await onAddChannel(channelPlatform, channelName.trim())
                setChannelName('')
              }}
            >
              Add
            </button>
          </div>
          {settings.channels.map((channel) => (
            <div key={channel.id} className="row">
              <span>{channel.platform}:{channel.name}</span>
              <button onClick={() => onRemoveChannel(channel.platform, channel.name)}>Remove</button>
            </div>
          ))}
        </div>
      </details>

      <details>
        <summary>Profanity Filter</summary>
        <div className="section-body">
          <textarea
            value={blockedWordsText}
            onChange={(event) =>
              onSettingsPatch({ blockedWords: event.target.value.split(',').map((word) => word.trim()).filter(Boolean) })
            }
          />
          <div className="button-row">
            <button onClick={async () => setRawText(await onExportWords())}>Export blocked words</button>
            <button onClick={async () => onImportWords(rawText)}>Import blocked words</button>
          </div>
        </div>
      </details>

      <details>
        <summary>Pinned Message Settings</summary>
        <div className="section-body">
          <label>
            Anchor
            <select value={settings.pinned.position.anchor} onChange={(event) => patchPinned({ ...settings.pinned, position: { ...settings.pinned.position, anchor: event.target.value as OverlayAnchor } })}>
              {anchors.map((anchor) => (
                <option key={anchor}>{anchor}</option>
              ))}
            </select>
          </label>
          <label><input type="checkbox" checked={settings.pinned.position.dockToChat} onChange={(event) => patchPinned({ ...settings.pinned, position: { ...settings.pinned.position, dockToChat: event.target.checked } })} /> Dock to chat</label>
          <div className="nudge-grid">
            <button onClick={() => patchPinned({ ...settings.pinned, position: { ...settings.pinned.position, offsetY: settings.pinned.position.offsetY - 1 } })}>↑1</button>
            <button onClick={() => patchPinned({ ...settings.pinned, position: { ...settings.pinned.position, offsetY: settings.pinned.position.offsetY + 1 } })}>↓1</button>
            <button onClick={() => patchPinned({ ...settings.pinned, position: { ...settings.pinned.position, offsetX: settings.pinned.position.offsetX - 1 } })}>←1</button>
            <button onClick={() => patchPinned({ ...settings.pinned, position: { ...settings.pinned.position, offsetX: settings.pinned.position.offsetX + 1 } })}>→1</button>
            <button onClick={() => patchPinned({ ...settings.pinned, position: { ...settings.pinned.position, offsetX: 0, offsetY: 0 } })}>Center</button>
          </div>
          <label>
            Visibility
            <select value={settings.pinned.visibility.mode} onChange={(event) => patchPinned({ ...settings.pinned, visibility: { ...settings.pinned.visibility, mode: event.target.value as 'permanent' | 'timed' } })}>
              <option value="permanent">Permanent</option>
              <option value="timed">Timed</option>
            </select>
          </label>
          <label>
            Duration (sec)
            <input type="number" value={settings.pinned.visibility.durationSec} onChange={(event) => patchPinned({ ...settings.pinned, visibility: { ...settings.pinned.visibility, durationSec: Number(event.target.value) } })} />
          </label>
          <label>
            Width mode
            <select value={settings.pinned.widthMode} onChange={(event) => patchPinned({ ...settings.pinned, widthMode: event.target.value as 'chat-match' | 'manual' })}>
              <option value="chat-match">Auto match chat</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <label>
            Manual width
            <input type="number" value={settings.pinned.widthPx} onChange={(event) => patchPinned({ ...settings.pinned, widthPx: Number(event.target.value) })} />
          </label>
          <div className="toggle-grid">
            <label><input type="checkbox" checked={settings.pinned.showAvatar} onChange={(event) => patchPinned({ ...settings.pinned, showAvatar: event.target.checked })} /> Profile</label>
            <label><input type="checkbox" checked={settings.pinned.showUsername} onChange={(event) => patchPinned({ ...settings.pinned, showUsername: event.target.checked })} /> Username</label>
            <label><input type="checkbox" checked={settings.pinned.showPlatform} onChange={(event) => patchPinned({ ...settings.pinned, showPlatform: event.target.checked })} /> Platform</label>
            <label><input type="checkbox" checked={settings.pinned.showChannel} onChange={(event) => patchPinned({ ...settings.pinned, showChannel: event.target.checked })} /> Channel</label>
          </div>
          <label>
            Glow border
            <input type="color" value={settings.pinned.glowBorderColor} onChange={(event) => patchPinned({ ...settings.pinned, glowBorderColor: event.target.value })} />
          </label>
          <button onClick={() => patchPinned({ ...settings.pinned, glowBorderColor: '#7c3aed' })}>Reset border color</button>
          <label>
            Font size
            <input type="number" value={settings.pinned.fontSizePx} onChange={(event) => patchPinned({ ...settings.pinned, fontSizePx: Number(event.target.value) })} />
          </label>
          <button onClick={() => patchPinned({ ...settings.pinned, fontSizePx: 26, widthPx: 520 })}>Reset font/width</button>
        </div>
      </details>

      <details>
        <summary>OBS Chat Location & Size</summary>
        <div className="section-body">
          <label>
            Anchor
            <select value={settings.chatOverlay.position.anchor} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, position: { ...settings.chatOverlay.position, anchor: event.target.value as OverlayAnchor } })}>
              {anchors.map((anchor) => (
                <option key={anchor}>{anchor}</option>
              ))}
            </select>
          </label>
          <label>
            Width
            <input type="number" value={settings.chatOverlay.widthPx} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, widthPx: Number(event.target.value) })} />
          </label>
          <label>
            Height
            <input type="number" value={settings.chatOverlay.heightPx} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, heightPx: Number(event.target.value) })} />
          </label>
          <label><input type="checkbox" checked={settings.chatOverlay.visible} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, visible: event.target.checked })} /> Show chat overlay</label>
          <button onClick={() => patchChatOverlay({ ...settings.chatOverlay, widthPx: 520, heightPx: 650, position: { ...settings.chatOverlay.position, offsetX: 0, offsetY: 0 } })}>Reset location & size</button>
        </div>
      </details>

      <details>
        <summary>OBS Chat Visual Styling</summary>
        <div className="section-body">
          <label>
            Font size
            <input type="number" value={settings.chatOverlay.fontSizePx} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, fontSizePx: Number(event.target.value) })} />
          </label>
          <button onClick={() => patchChatOverlay({ ...settings.chatOverlay, fontSizePx: 20 })}>Reset font</button>

          <label>
            Box color
            <input
              type="color"
              value={settings.chatOverlay.boxStyle.color}
              onChange={(event) =>
                patchChatOverlay({
                  ...settings.chatOverlay,
                  boxStyle: {
                    ...settings.chatOverlay.boxStyle,
                    color: event.target.value,
                    recentColors: uniqueRecent(settings.chatOverlay.boxStyle.recentColors, event.target.value),
                  },
                })
              }
            />
          </label>
          <label>
            Box transparency
            <input type="range" min={0} max={100} value={settings.chatOverlay.boxStyle.alpha} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, boxStyle: { ...settings.chatOverlay.boxStyle, alpha: Number(event.target.value) } })} />
          </label>
          <button onClick={() => patchChatOverlay({ ...settings.chatOverlay, boxStyle: { ...settings.chatOverlay.boxStyle, color: '#111827', alpha: 85 } })}>Reset box style</button>

          <label><input type="checkbox" checked={settings.chatOverlay.alternateRows.enabled} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, alternateRows: { ...settings.chatOverlay.alternateRows, enabled: event.target.checked } })} /> Alternate row background</label>
          {settings.chatOverlay.alternateRows.enabled && (
            <>
              <label>
                Alternate row color
                <input type="color" value={settings.chatOverlay.alternateRows.style.color} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, alternateRows: { ...settings.chatOverlay.alternateRows, style: { ...settings.chatOverlay.alternateRows.style, color: event.target.value, recentColors: uniqueRecent(settings.chatOverlay.alternateRows.style.recentColors, event.target.value) } } })} />
              </label>
              <label>
                Alternate row transparency
                <input type="range" min={0} max={100} value={settings.chatOverlay.alternateRows.style.alpha} onChange={(event) => patchChatOverlay({ ...settings.chatOverlay, alternateRows: { ...settings.chatOverlay.alternateRows, style: { ...settings.chatOverlay.alternateRows.style, alpha: Number(event.target.value) } } })} />
              </label>
            </>
          )}
        </div>
      </details>

      <details>
        <summary>System & Data</summary>
        <div className="section-body">
          <button onClick={onResetAll}>Reset defaults</button>
          <button onClick={async () => setRawText(await onExportAll())}>Export all settings</button>
          <button onClick={async () => onImportAll(rawText)}>Import all settings</button>
          <textarea value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Paste exported settings or blocked words payload" />
        </div>
      </details>
    </main>
  )
}
