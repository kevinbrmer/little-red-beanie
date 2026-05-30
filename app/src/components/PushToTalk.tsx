import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { setMicMuted } from '../voice/elevenlabs'
import {
  PUSH_TO_TALK_ENABLED,
  PUSH_TO_TALK_KEY,
  PUSH_TO_TALK_LABEL,
} from '../config'

/**
 * Push-to-talk overlay.
 *
 * The voice session starts muted when PTT is enabled (see elevenlabs.ts
 * onConnect). Holding the configured talk key unmutes the mic for as long
 * as the key is held; releasing mutes again. This eliminates room-noise
 * contamination — the puppet only ever hears Kimi when the talk key is
 * intentionally held.
 *
 * When PTT is disabled (open mic / VAD mode) this component renders only
 * the legend chip so the operator can see which mode is active.
 *
 * Visible only after the session has started.
 */
export default function PushToTalk() {
  const sessionStarted = useAppStore((s) => s.sessionStarted)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!sessionStarted) return
    if (!PUSH_TO_TALK_ENABLED) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== PUSH_TO_TALK_KEY) return
      if (e.repeat) return  // ignore auto-repeat while held
      e.preventDefault()
      setPressed(true)
      setMicMuted(false)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== PUSH_TO_TALK_KEY) return
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
  if (!PUSH_TO_TALK_ENABLED) {
    // Open-mic mode: tiny legend so the operator can see PTT is OFF without
    // hunting for the config flag. Bottom-left, almost invisible.
    return (
      <div className="pointer-events-none fixed bottom-3 left-3 z-50">
        <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft/40">
          open mic
        </span>
      </div>
    )
  }

  // PTT mode: a small red recording dot at the top-left while the mic is
  // actually live (talk key held), plus a tiny legend showing which key.
  return (
    <>
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
      <div className="pointer-events-none fixed bottom-3 left-3 z-50">
        <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft/40">
          hold {PUSH_TO_TALK_LABEL} to speak
        </span>
      </div>
    </>
  )
}
