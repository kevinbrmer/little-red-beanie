import { useEffect } from 'react'

/**
 * Kiosk-mode hardening for the installed PWA on the pitch tablet.
 *
 * Two browser APIs, both best-effort (try/catch — they silently fail on
 * desktop and on Android browsers that don't grant them):
 *
 *  1. Screen Wake Lock — keeps the display from sleeping mid-demo. The
 *     handle is released by the OS whenever the tab loses visibility
 *     (locked screen, app switch), so we re-acquire it on visibilitychange.
 *  2. Orientation Lock — pins the UI to portrait so a stray rotation
 *     during the live demo doesn't break the layout.
 */
export function useKiosk(): void {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (cancelled) return
      if (!('wakeLock' in navigator)) return
      if (document.visibilityState !== 'visible') return
      try {
        wakeLock = await navigator.wakeLock.request('screen')
      } catch (err) {
        console.warn('[kiosk] wakeLock.request failed', err)
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()

    try {
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (lock: OrientationLockType) => Promise<void>
      }
      orientation.lock?.('portrait').catch((err) => {
        console.warn('[kiosk] orientation.lock failed', err)
      })
    } catch (err) {
      console.warn('[kiosk] orientation.lock threw', err)
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLock?.release().catch(() => {
        // ignore — the OS releases the lock automatically on hide
      })
    }
  }, [])
}
