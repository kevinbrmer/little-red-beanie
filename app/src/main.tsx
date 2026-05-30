import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register the network-passthrough service worker. Required so the manifest
// is honored as an installable PWA on Android (Chrome refuses to surface
// "Add to Home Screen" without an active SW). The SW itself caches nothing
// — see public/sw.js. Skipped on the Vite dev server because the dev
// bundle paths break when an SW intercepts them.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('[sw] registration failed', err))
  })
}
