import type { AppSettings, ChatMessage, PinnedMessage } from '../types'

interface OverlayPreviewPageProps {
  settings: AppSettings
  messages: ChatMessage[]
  activePins: PinnedMessage[]
}

export const OverlayPreviewPage = ({ settings, messages, activePins }: OverlayPreviewPageProps) => {
  const pinned = activePins[0]

  return (
    <main className="overlay-preview-grid">
      <section className="overlay-frame" style={{ width: settings.chatOverlay.widthPx, height: settings.chatOverlay.heightPx }}>
        <h2>Chat Overlay Preview</h2>
        {!settings.chatOverlay.visible && <p>Chat overlay hidden</p>}
        {settings.chatOverlay.visible && (
          <div className="overlay-chat-list" style={{ fontSize: `${settings.chatOverlay.fontSizePx}px` }}>
            {messages.slice(-12).map((message, index) => (
              <article
                key={message.id}
                className={`overlay-chat-row ${settings.chatOverlay.alternateRows.enabled && index % 2 === 1 ? 'alt' : ''}`}
              >
                <strong>{message.username}</strong> <span>{message.content}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overlay-frame pin-preview">
        <h2>Pinned Preview</h2>
        {pinned ? (
          <article className="pin-preview-box" style={{ borderColor: settings.pinned.glowBorderColor, fontSize: `${settings.pinned.fontSizePx}px` }}>
            <header>
              {settings.pinned.showUsername && <strong>{pinned.message.username}</strong>}
              {settings.pinned.showPlatform && <span>{pinned.message.platform}</span>}
              {settings.pinned.showChannel && <span>#{pinned.message.channel}</span>}
            </header>
            <p className={pinned.message.filtered && !pinned.unblurredForOverlay ? 'blurred' : ''}>{pinned.message.content}</p>
          </article>
        ) : (
          <p>Pin a message to preview.</p>
        )}
      </section>
    </main>
  )
}
