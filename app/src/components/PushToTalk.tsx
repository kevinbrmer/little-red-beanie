import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { setMicMuted } from '../voice/elevenlabs'

const TALK_KEY = 'Space'

/**
 * Push-to-talk overlay.
 *
 * The voice session starts muted (set in elevenlabs.ts onConnect).
 * Holding SPACE unmutes the mic for as long as the key is held; releasing
 * mutes again. This eliminates room-noise contamination — the puppet only
 * ever hears Kimi when the talk key is intentionally held.
 *
 * Visible only after the session has started.
 */
export default function PushToTalk() {
  const sessionStarted = useAppStore((s) => s.sessionStarted)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!sessionStarted) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== TALK_KEY) return
      if (e.repeat) return  // ignore auto-repeat while held
      e.preventDefault()
      setPressed(true)
      setMicMuted(false)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== TALK_KEY) return
      e.preventDefault()
      setPressed(false)
      setMicMuted(true)
    }

    // Lose focus while pressed → release as if key came up (otherwise mic
    // stays open when the tab is alt-tabbed away during talk).
    const onBlur = () => {
      if (pressed) {
        setPressed(false)
        setMicMuted(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [sessionStarted, pressed])

  if (!sessionStarted) return null

  // No visible control. Push-to-talk stays bound to SPACE (logic unchanged);
  // the only on-screen affordance is a small red recording dot that fades in
  // at the top-left while the mic is actually live (SPACE held).
  return (
    <div className="pointer-events-none fixed top-5 left-5 z-50">
      <motion.span
        className="block h-3 w-3 rounded-full"
        style={{ backgroundColor: '#E0362C' }}
        initial={false}
        animate={
          pressed
            ? { opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] }
            : { opacity: 0, scale: 1 }
        }
        transition={
          pressed
            ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
      />
    </div>
  )
}
