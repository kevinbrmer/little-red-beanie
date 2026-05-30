# Todo — Android-Kiosk-Variante (installierte PWA)

> Ziel: bestehende Web-App 1:1 als chrome-loses Vollbild auf dem Android-Tablet,
> ausgeliefert als installierte PWA (WebAPK) über HTTPS (Coolify-Subdomain).
> Entscheidung 2026-05-30: Chrome-Kiosk via PWA statt Capacitor — kein
> WebRTC-in-WebView-Risiko, Vollbild übersteht Tippen + Presenter-Taste.

## Grundsatz
- Phasen 1–4 sind FIX. Nur PushToTalk-Komponente + die eine Mute-Zeile in
  `elevenlabs.ts onConnect` werden berührt — sonst keine Phasen-Logik.

## Code
- [ ] `public/manifest.webmanifest` — `display: fullscreen`, `orientation: portrait`,
      name, theme/background-color, icons
- [ ] Icons aus `mascot.png` generieren: `icon-192.png`, `icon-512.png`,
      `icon-maskable-512.png` (maskable mit solidem Hintergrund)
- [ ] `public/sw.js` — Network-Passthrough (KEIN Caching), `skipWaiting()` +
      `clients.claim()`; verhindert Stale-Bundle nach Redeploy
- [ ] SW in `src/main.tsx` registrieren
- [ ] `index.html` — manifest-Link, theme-color, apple-mobile-web-app-Meta, Icons
- [ ] `src/config.ts` — `PUSH_TO_TALK_KEY`, `PUSH_TO_TALK_ENABLED` (schnell editierbar)
- [ ] `PushToTalk.tsx` — Config nutzen + dezente Keycode-Anzeige (welche Taste
      feuert der Presenter?)
- [ ] `elevenlabs.ts onConnect` — Mute nur wenn PTT enabled (sonst Open-Mic/VAD)
- [ ] `src/kiosk/useKiosk.ts` — Screen Wake Lock (Re-Acquire on visibilitychange)
      + `screen.orientation.lock('portrait')` (try/catch); in App mounten

## Deployment (Coolify-Subdomain, z.B. beanie.kevin-brammer.de)
- [ ] `Dockerfile` (multi-stage: node build → nginx serve dist) mit
      `ARG VITE_ELEVENLABS_AGENT_ID` (BUILD-time!)
- [ ] `nginx.conf` — SPA-Fallback, `.webmanifest` = application/manifest+json,
      `sw.js` = Cache-Control no-store
- [ ] `.dockerignore`
- [ ] Manuell (Kevin): DNS A-Record → 85.215.232.56; Coolify-App anlegen
      (Base-Dir `app`), Build-Env `VITE_ELEVENLABS_AGENT_ID` setzen

## Verifikation (am echten Tablet — entscheidend)
- [ ] Build lokal grün (`npm run build`); Agent-ID im dist-Bundle vorhanden (grep)
- [ ] „Zum Startbildschirm hinzufügen" → startet als Vollbild ohne Browser-Leiste
- [ ] Tippen + Presenter-Taste brechen das Vollbild NICHT
- [ ] Mic-Permission einmal in der installierten PWA erteilen (persistiert)
- [ ] Display schläft nicht ein (Wake Lock), Portrait fix
- [ ] Voller 5-Phasen-Flow durchlaufen, Latenz live OK

## Review
(am Ende ausfüllen)
