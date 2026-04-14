# chatapp

Full-stack chat control app with:
- Web UI for aggregated chat, controls, and settings
- OBS-ready browser overlays for chat and pinned messages

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + Socket.IO + TypeScript
- Shared models: `/shared/src/models.ts`

## Run locally

```bash
cd /home/runner/work/chatapp/chatapp
npm --prefix api install
npm --prefix web install
npm run dev:api
npm run dev:web
```

- Web UI: `http://localhost:5173`
- API: `http://localhost:3001`
- OBS overlays:
  - `http://localhost:3001/overlay/chat`
  - `http://localhost:3001/overlay/pin`

## Features implemented
- Resizable split layout (chat feed + control panel)
- Live aggregated message stream from managed Twitch/Kick channels
- Pause-on-scroll chat behavior with manual reveal for filtered messages
- Pin message workflow with dismiss/pause/unblur controls
- Pin timer rule honoring manual pause until manual dismiss
- Pin history (last 5 highlighted, up to 25 retained)
- Global top bar:
  - Twitch/Kick accent toggle
  - Dark/Light toggle
  - Operational/Degraded/Down status pill with platform details
- Settings page with collapsible sections:
  - Channel manager
  - Profanity filter + import/export
  - Pinned message settings (positioning, timing, width, metadata, style controls)
  - OBS chat location/size controls
  - OBS chat visual styling with recent color memory
  - System reset and full settings export/import
- OBS browser-source URLs + overlay pages served by backend

## Validation

```bash
npm run lint
npm run build
npm run test
```
