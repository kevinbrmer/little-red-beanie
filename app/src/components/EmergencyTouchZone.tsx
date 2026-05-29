import { useRef } from 'react'
import { useAppStore } from '../state/appStore'

const LONG_PRESS_MS = 2000

export default function EmergencyTouchZone() {
  const timer = useRef<number | null>(null)

  const start = () => {
    timer.current = window.setTimeout(() => {
      const s = useAppStore.getState()
      const next = Math.min(5, s.phase + 1) as 1 | 2 | 3 | 4 | 5
      console.warn(`[emergency-advance] ${s.phase} → ${next}`)
      useAppStore.setState({ phase: next })
    }, LONG_PRESS_MS)
  }

  const cancel = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  return (
    <div
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className="absolute bottom-0 left-0 z-40 h-12 w-full opacity-0"
      aria-hidden="true"
    />
  )
}
