import { Navigate, Route, Routes } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { useChatApp } from './hooks/useChatApp'
import { MainPage } from './pages/MainPage'
import { OverlayPreviewPage } from './pages/OverlayPreviewPage'
import { SettingsPage } from './pages/SettingsPage'

export const App = () => {
  const app = useChatApp()

  if (!app.settings) {
    return <main className="loading">Loading…</main>
  }

  return (
    <div className={`app app-${app.settings.colorMode} accent-${app.settings.accentTheme}`}>
      <TopBar
        accentTheme={app.settings.accentTheme}
        colorMode={app.settings.colorMode}
        operational={app.operational}
        status={app.status}
        onToggleAccent={app.toggleThemeAccent}
        onToggleColorMode={app.toggleColorMode}
      />

      <Routes>
        <Route
          path="/"
          element={
            <MainPage
              settings={app.settings}
              messages={app.visibleMessages}
              filters={app.filters}
              revealedIds={app.revealedMessageIds}
              activePins={app.activePins}
              pinHistory={app.pinHistory}
              onToggleFilter={app.toggleChannelFilter}
              onSettingsPatch={app.setPartialSettings}
              onPin={app.pin}
              onReveal={app.toggleMessageReveal}
              onPausePin={app.pausePin}
              onUnblurPin={app.unblurPin}
              onDismissPin={app.closePin}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              settings={app.settings}
              onSettingsPatch={app.setPartialSettings}
              onAddChannel={app.addManagedChannel}
              onRemoveChannel={app.deleteManagedChannel}
              onResetAll={app.resetAllSettings}
              onExportAll={app.exportAllSettings}
              onImportAll={app.importAllSettings}
              onExportWords={app.exportWords}
              onImportWords={app.importWords}
            />
          }
        />
        <Route
          path="/overlay/chat"
          element={
            <OverlayPreviewPage
              settings={app.settings}
              messages={app.visibleMessages}
              activePins={app.activePins}
            />
          }
        />
        <Route
          path="/overlay/pin"
          element={
            <OverlayPreviewPage
              settings={app.settings}
              messages={app.visibleMessages}
              activePins={app.activePins}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
