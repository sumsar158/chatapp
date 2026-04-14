import { useMemo, useState } from 'react'
import { ChatFeed } from '../components/ChatFeed'
import { PinnedControls } from '../components/PinnedControls'
import type { AppSettings, ChatMessage, PinnedMessage } from '../types'

interface MainPageProps {
  settings: AppSettings
  messages: ChatMessage[]
  filters: Record<string, boolean>
  revealedIds: string[]
  activePins: PinnedMessage[]
  pinHistory: PinnedMessage[]
  onToggleFilter: (channelId: string) => void
  onSettingsPatch: (partial: Partial<AppSettings>) => Promise<void>
  onPin: (messageId: string) => Promise<void>
  onReveal: (messageId: string) => void
  onPausePin: (pinId: string) => Promise<void>
  onUnblurPin: (pinId: string) => Promise<void>
  onDismissPin: (pinId: string) => Promise<void>
}

export const MainPage = ({
  settings,
  messages,
  filters,
  revealedIds,
  activePins,
  pinHistory,
  onToggleFilter,
  onSettingsPatch,
  onPin,
  onReveal,
  onPausePin,
  onUnblurPin,
  onDismissPin,
}: MainPageProps) => {
  const [ratio, setRatio] = useState(65)

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `${ratio}% 6px ${100 - ratio}%`,
    }),
    [ratio],
  )

  const startDrag = () => {
    const onMove = (event: MouseEvent) => {
      const width = window.innerWidth
      const next = Math.min(80, Math.max(30, (event.clientX / width) * 100))
      setRatio(next)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <main className="split-view" style={gridStyle}>
      <ChatFeed
        messages={messages}
        channels={settings.channels}
        filters={filters}
        revealedIds={revealedIds}
        fontSizePx={settings.chatFontSizePx}
        onToggleFilter={onToggleFilter}
        onFontSizeChange={(size) => onSettingsPatch({ chatFontSizePx: size })}
        onPin={onPin}
        onReveal={onReveal}
      />
      <div className="split-handle" onMouseDown={startDrag} />
      <PinnedControls
        activePins={activePins}
        pinHistory={pinHistory}
        onPause={onPausePin}
        onUnblur={onUnblurPin}
        onDismiss={onDismissPin}
      />
    </main>
  )
}
