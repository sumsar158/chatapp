import type { PinnedMessage } from '../types'

interface PinnedControlsProps {
  activePins: PinnedMessage[]
  pinHistory: PinnedMessage[]
  onPause: (pinId: string) => void
  onUnblur: (pinId: string) => void
  onDismiss: (pinId: string) => void
}

export const PinnedControls = ({
  activePins,
  pinHistory,
  onPause,
  onUnblur,
  onDismiss,
}: PinnedControlsProps) => {
  return (
    <section className="panel-card">
      <h2>Pinned Controls</h2>
      <div className="pin-list">
        {activePins.length === 0 && <p>No active pins</p>}
        {activePins.map((pin) => (
          <article key={pin.id} className="pin-item">
            <strong>{pin.message.username}</strong>
            <p className={pin.message.filtered && !pin.unblurredForOverlay ? 'blurred' : ''}>{pin.message.content}</p>
            <div className="pin-actions">
              <button onClick={() => onPause(pin.id)}>{pin.paused ? 'Resume' : 'Pause timer'}</button>
              <button onClick={() => onUnblur(pin.id)}>
                {pin.unblurredForOverlay ? 'Blur in OBS' : 'Unblur in OBS'}
              </button>
              <button onClick={() => onDismiss(pin.id)}>Dismiss</button>
            </div>
          </article>
        ))}
      </div>

      <h3>History</h3>
      <div className="pin-history">
        {pinHistory.slice(0, 25).map((pin, index) => (
          <div key={`${pin.id}-${index}`} className={index < 5 ? 'recent' : ''}>
            <span>{pin.message.platform}</span>
            <span>{pin.message.username}</span>
            <span>{pin.message.content}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
