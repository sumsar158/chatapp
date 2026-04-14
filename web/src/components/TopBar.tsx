import { Link } from 'react-router-dom'
import type { ConnectionStatus, Platform } from '../types'

interface TopBarProps {
  accentTheme: Platform
  colorMode: 'dark' | 'light'
  operational: 'Operational' | 'Degraded' | 'Down'
  status: ConnectionStatus[]
  onToggleAccent: () => void
  onToggleColorMode: () => void
}

export const TopBar = ({
  accentTheme,
  colorMode,
  operational,
  status,
  onToggleAccent,
  onToggleColorMode,
}: TopBarProps) => {
  const statusClass = operational.toLowerCase()
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>Chat Control</h1>
      </div>
      <nav className="topbar-nav">
        <Link to="/">Chat</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/overlay/chat">Overlay Preview</Link>
      </nav>
      <div className="topbar-actions">
        <button onClick={onToggleAccent}>Accent: {accentTheme}</button>
        <button onClick={onToggleColorMode}>Mode: {colorMode}</button>
        <details className={`status-pill ${statusClass}`}>
          <summary>{operational}</summary>
          <div className="status-popover">
            {status.map((item) => (
              <div key={item.platform}>
                <strong>{item.platform.toUpperCase()}</strong>
                <span>{item.healthy ? 'Healthy' : 'Issue'}</span>
                <span>{item.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </header>
  )
}
