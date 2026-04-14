import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { z } from 'zod'
import { computeOperational, IngestionEngine } from './ingestion'
import { createPin, toggleManualPause } from './pins'
import {
  dismissPin,
  getState,
  importState,
  resetSettings,
  setChannels,
  updatePin,
  updateSettings,
  upsertPin,
} from './store'
import type { AppSettings, PinnedMessage, SystemState } from './types'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const overlayDir = path.resolve(rootDir, 'overlay')
const chatOverlayHtml = fs.readFileSync(path.resolve(overlayDir, 'chat.html'), 'utf-8')
const pinOverlayHtml = fs.readFileSync(path.resolve(overlayDir, 'pin.html'), 'utf-8')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

const engine = new IngestionEngine(io)

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const channelSchema = z.object({
  platform: z.enum(['twitch', 'kick']),
  name: z.string().trim().min(1),
  enabled: z.boolean().optional(),
})

const pinSchema = z.object({
  messageId: z.string(),
})

const settingsSchema = z.custom<Partial<AppSettings>>()

app.get('/api/state', (_req, res) => {
  const state = getState()
  res.json({
    ...state,
    operational: computeOperational(state.status),
  })
})

app.get('/api/status', (_req, res) => {
  const status = getState().status
  res.json({
    status,
    operational: computeOperational(status),
  })
})

app.post('/api/channels', (req, res) => {
  const parsed = channelSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const state = getState()
  const next = [
    ...state.settings.channels.filter(
      (item) => !(item.platform === parsed.data.platform && item.name === parsed.data.name),
    ),
    {
      id: `${parsed.data.platform}-${parsed.data.name.toLowerCase()}`,
      platform: parsed.data.platform,
      name: parsed.data.name.toLowerCase(),
      enabled: parsed.data.enabled ?? true,
    },
  ]

  setChannels(next)
  engine.syncChannels(next)
  io.emit('settings:update', getState().settings)
  res.json(next)
})

app.delete('/api/channels/:platform/:name', (req, res) => {
  const { platform, name } = req.params
  const next = getState().settings.channels.filter(
    (item) => !(item.platform === platform && item.name === name),
  )
  setChannels(next)
  engine.syncChannels(next)
  io.emit('settings:update', getState().settings)
  res.json(next)
})

app.post('/api/messages/pin', (req, res) => {
  const parsed = pinSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  const state = getState()
  const message = state.messages.find((item) => item.id === parsed.data.messageId)
  if (!message) {
    res.status(404).json({ error: 'Message not found' })
    return
  }

  const pin: PinnedMessage = createPin(message, state.settings.pinned)

  upsertPin(pin)
  io.emit('pin:added', pin)
  io.emit('pin:state', {
    activePins: getState().activePins,
    pinHistory: getState().pinHistory,
  })
  res.json(pin)
})

app.post('/api/pins/:id/pause', (req, res) => {
  const updated = updatePin(req.params.id, (pin) => toggleManualPause(pin))
  if (!updated) {
    res.status(404).json({ error: 'Pin not found' })
    return
  }
  io.emit('pin:updated', updated)
  res.json(updated)
})

app.post('/api/pins/:id/unblur', (req, res) => {
  const updated = updatePin(req.params.id, (pin) => ({
    ...pin,
    unblurredForOverlay: !pin.unblurredForOverlay,
  }))
  if (!updated) {
    res.status(404).json({ error: 'Pin not found' })
    return
  }
  io.emit('pin:updated', updated)
  res.json(updated)
})

app.delete('/api/pins/:id', (req, res) => {
  const ok = dismissPin(req.params.id)
  if (!ok) {
    res.status(404).json({ error: 'Pin not found' })
    return
  }
  io.emit('pin:dismissed', req.params.id)
  io.emit('pin:state', {
    activePins: getState().activePins,
    pinHistory: getState().pinHistory,
  })
  res.json({ ok: true })
})

app.patch('/api/settings', (req, res) => {
  const parsed = settingsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  const settings = updateSettings(parsed.data)
  engine.syncChannels(settings.channels)
  io.emit('settings:update', settings)
  res.json(settings)
})

app.post('/api/settings/reset', (_req, res) => {
  const settings = resetSettings()
  engine.syncChannels(settings.channels)
  io.emit('settings:update', settings)
  res.json(settings)
})

app.get('/api/settings/export', (_req, res) => {
  res.json(getState())
})

app.post('/api/settings/import', (req, res) => {
  const parsed = z.custom<SystemState>().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  const imported = importState(parsed.data)
  engine.syncChannels(imported.settings.channels)
  io.emit('settings:update', imported.settings)
  io.emit('pin:state', {
    activePins: imported.activePins,
    pinHistory: imported.pinHistory,
  })
  res.json(imported)
})

app.post('/api/blocked-words/import', (req, res) => {
  const parsed = z.object({ words: z.array(z.string()) }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }
  const settings = updateSettings({ blockedWords: parsed.data.words })
  io.emit('settings:update', settings)
  res.json(settings.blockedWords)
})

app.get('/api/blocked-words/export', (_req, res) => {
  res.json({ words: getState().settings.blockedWords })
})

app.get('/api/obs-url', (req, res) => {
  const host = req.get('host')
  const protocol = req.protocol
  const base = `${protocol}://${host}`
  res.json({
    chatOverlay: `${base}/overlay/chat`,
    pinnedOverlay: `${base}/overlay/pin`,
  })
})

app.get('/overlay/chat', (_req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(chatOverlayHtml)
})

app.get('/overlay/pin', (_req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(pinOverlayHtml)
})

io.on('connection', (socket) => {
  const state = getState()
  socket.emit('bootstrap', state)
})

const port = Number(process.env.PORT ?? 3001)
httpServer.listen(port, () => {
  engine.start()
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`)
})
