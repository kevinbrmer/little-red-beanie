# Todo — Android-Kiosk-Variante (installierte PWA)

> Ziel: bestehende Web-App 1:1 als chrome-loses Vollbild auf dem Android-Tablet,
> ausgeliefert als installierte PWA (WebAPK) über HTTPS (Coolify-Subdomain).
> Entscheidung 2026-05-30: Chrome-Kiosk via PWA statt Capacitor — kein
> WebRTC-in-WebView-Risiko, Vollbild übersteht Tippen + Presenter-Taste.

## Grundsatz
- Phasen 1–4 sind FIX. Nur PushToTalk-Komponente + die eine Mute-Zeile in
  `elevenlabs.ts onConnect` werden berührt — sonst keine Phasen-Logik.

## Code
- [x] `public/manifest.webmanifest` — `display: fullscreen`, `orientation: portrait`,
      name, theme/background-color, icons
- [x] Icons aus `mascot.png` generieren: `icon-192.png`, `icon-512.png`,
      `icon-maskable-512.png` (maskable mit solidem Hintergrund)
- [x] `public/sw.js` — Network-Passthrough (KEIN Caching), `skipWaiting()` +
      `clients.claim()`; verhindert Stale-Bundle nach Redeploy
- [x] SW in `src/main.tsx` registrieren
- [x] `index.html` — manifest-Link, theme-color, apple-mobile-web-app-Meta, Icons
- [x] `src/config.ts` — `PUSH_TO_TALK_KEY`, `PUSH_TO_TALK_ENABLED` (schnell editierbar)
- [x] `PushToTalk.tsx` — Config nutzen + dezente Keycode-Anzeige (welche Taste
      feuert der Presenter?)
- [x] `elevenlabs.ts onConnect` — Mute nur wenn PTT enabled (sonst Open-Mic/VAD)
- [x] `src/kiosk/useKiosk.ts` — Screen Wake Lock (Re-Acquire on visibilitychange)
      + `screen.orientation.lock('portrait')` (try/catch); in App mounten

## Deployment (Coolify-Subdomain, z.B. beanie.kevin-brammer.de)
- [x] `Dockerfile` (multi-stage: node build → nginx serve dist) mit
      `ARG VITE_ELEVENLABS_AGENT_ID` (BUILD-time!)
- [x] `nginx.conf` — SPA-Fallback, `.webmanifest` = application/manifest+json,
      `sw.js` = Cache-Control no-store
- [x] `.dockerignore`
- [ ] Manuell (Kevin): DNS A-Record → 85.215.232.56; Coolify-App anlegen
      (Base-Dir `app`), Build-Env `VITE_ELEVENLABS_AGENT_ID` setzen

## Verifikation (am echten Tablet — entscheidend)
- [x] Build lokal grün (`npm run build`); Agent-ID im dist-Bundle vorhanden (grep)
- [ ] „Zum Startbildschirm hinzufügen" → startet als Vollbild ohne Browser-Leiste
- [ ] Tippen + Presenter-Taste brechen das Vollbild NICHT
- [ ] Mic-Permission einmal in der installierten PWA erteilen (persistiert)
- [ ] Display schläft nicht ein (Wake Lock), Portrait fix
- [ ] Voller 5-Phasen-Flow durchlaufen, Latenz live OK

## Review

**Stand 2026-05-30:** Alle Code- und Deployment-Artefakte stehen. Lokal verifiziert
(`npm run build` grün, Agent-ID im Bundle, 5 PWA-Dateien im `dist/`).

**Was wurde gebaut:**
- `public/manifest.webmanifest` — Fullscreen-Portrait, Cream-Theme, 3 Icons.
- `public/icons/icon-{192,512}.png` (any) + `icon-maskable-512.png`
  (maskable, Mascot auf 80 % Safe-Zone in Cream-Background via `sips`).
- `public/sw.js` — leerer Lifecycle-SW, **kein** `fetch`-Handler →
  Browser fällt für jeden Request auf Network zurück.
- `src/main.tsx` — registriert SW nur in PROD (Vite-Dev hasst SW-Hijacking).
- `index.html` — Manifest-Link, theme-color, Apple-PWA-Metas, Touch-Icon,
  Viewport-Cover + `user-scalable=no`.
- `src/config.ts` — `PUSH_TO_TALK_{ENABLED,KEY,LABEL}`, Default Space.
- `src/components/PushToTalk.tsx` — liest jetzt Config; bei `ENABLED=false`
  bleibt Open-Mic/VAD aktiv, nur eine winzige „open mic"-Legende unten links.
  Bei `ENABLED=true` zusätzlich „hold space to speak"-Legende.
- `src/voice/elevenlabs.ts` — `onConnect` mutet nur, wenn PTT aktiv.
- `src/kiosk/useKiosk.ts` — Wake Lock (re-acquire on visibilitychange) +
  Orientation Lock auf portrait, beides try/catch. In `App.tsx` gemountet.
- `Dockerfile` — Multi-Stage node:22-alpine → nginx:1.27-alpine, mit
  `ARG VITE_ELEVENLABS_AGENT_ID` als Build-Arg.
- `nginx.conf` — SPA-Fallback, `.webmanifest` MIME-fix, `sw.js`/Manifest
  `no-store`/`no-cache`, `/assets/` immutable (Content-Hashing).
- `.dockerignore` — schlanker Build-Context, ohne node_modules, dist, env.

**Was als Nächstes ansteht (Tablet-Verifikation):**
1. Optional lokal `npm run preview` → http://localhost:4173 als HTTPS-loser
   Proxy nutzen (kein Install-Prompt, aber SW lädt). Echter Install-Test
   braucht HTTPS — also Coolify-Deployment auf Subdomain.
2. DNS-A-Record `beanie.kevin-brammer.de → 85.215.232.56` + Coolify-App
   mit Base-Dir `app` und Build-Arg `VITE_ELEVENLABS_AGENT_ID` setzen.
3. Tablet: Chrome öffnen, „Zum Startbildschirm hinzufügen", App starten,
   die 6 offenen Verifikations-Items abhaken.

