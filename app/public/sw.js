// Network-passthrough service worker.
//
// Why no caching: the agent ID, prompts and assets evolve between pitch
// rehearsals. A redeployed build must reach the installed PWA on the very
// next visit — a stale Workbox cache would silently serve yesterday's
// bundle and the puppet would connect to the wrong agent. This SW only
// exists so the manifest's `display: fullscreen` + installability work;
// it never intercepts a response.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// No `fetch` handler. The browser falls back to the network for every
// request, which is exactly what we want.
