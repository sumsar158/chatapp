import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChatMessage, ChannelTarget } from '../types'

interface ChatFeedProps {
  messages: ChatMessage[]
  channels: ChannelTarget[]
  filters: Record<string, boolean>
  revealedIds: string[]
  fontSizePx: number
  onToggleFilter: (channelId: string) => void
  onFontSizeChange: (size: number) => void
  onPin: (messageId: string) => void
  onReveal: (messageId: string) => void
}

export const ChatFeed = ({
  messages,
  channels,
  filters,
  revealedIds,
  fontSizePx,
  onToggleFilter,
  onFontSizeChange,
  onPin,
  onReveal,
}: ChatFeedProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const node = containerRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, paused])

  const onScroll = () => {
    const node = containerRef.current
    if (!node) return
    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 40
    setPaused(!nearBottom)
  }

  const rows = useMemo(() => messages.slice(-300), [messages])

  return (
    <section className="chat-card">
      <div className="chat-controls">
        <div className="filter-row">
          {channels.map((channel) => (
            <button
              key={channel.id}
              className={filters[channel.id] === false ? 'off' : ''}
              onClick={() => onToggleFilter(channel.id)}
            >
              {channel.platform}:{channel.name}
            </button>
          ))}
        </div>
        <label>
          Font
          <input
            type="range"
            min={12}
            max={30}
            value={fontSizePx}
            onChange={(event) => onFontSizeChange(Number(event.target.value))}
          />
        </label>
        {paused ? <span className="paused-pill">Paused</span> : <span className="paused-pill live">Live</span>}
      </div>

      <div className="chat-list" ref={containerRef} onScroll={onScroll}>
        {rows.map((message) => {
          const blurred = message.filtered && !revealedIds.includes(message.id)
          return (
            <article key={message.id} className="chat-item" style={{ fontSize: `${fontSizePx}px` }}>
              <button className="pin" onClick={() => onPin(message.id)}>
                Pin
              </button>
              <img src={message.avatarUrl} alt="" />
              <div>
                <div className="meta">
                  <strong>{message.username}</strong>
                  <span>{message.platform}</span>
                  <span>#{message.channel}</span>
                </div>
                <button className={`message ${blurred ? 'blurred' : ''}`} onClick={() => onReveal(message.id)}>
                  {message.content}{' '}
                  {message.emotes.map((emote) => (
                    <img key={`${message.id}-${emote.code}`} src={emote.url} alt={emote.code} title={emote.provider} />
                  ))}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
