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
 * Push-to-talk overlay (dual source — keyboard + touch).
 *
 * Voice session starts muted (see elevenlabs.ts onConnect). Holding EITHER
 * the configured talk key OR the on-screen "hold to speak" pill unmutes
 * the mic until released. Both sources can overlap without flicker — the
 * mic stays open while any source is active.
 *
 * Touch is required on the tablet kiosk (no hardware key); the keyboard
 * path stays so a Bluetooth presenter or a desktop session still works.
 */
export default function PushToTalk() {
  const sessionStarted = useAppStore((s) => s.sessionStarted)
  const [keyPressed, setKeyPressed] = useState(false)
  const [touchPressed, setTouchPressed] = useState(false)
  const pressed = keyPressed || touchPressed

  // Single source of truth for the SDK call. Driving setMicMuted from a
  // derived boolean (rather than from each handler) means that releasing
  // ONE source while the other is still held will not mute mid-utterance.
  useEffect(() => {
    if (!sessionStarted) return
    if (!PUSH_TO_TALK_ENABLED) return
    setMicMuted(!pressed)
  }, [pressed, sessionStarted])

  useEffect(() => {
    if (!sessionStarted) return
    if (!PUSH_TO_TALK_ENABLED) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== PUSH_TO_TALK_KEY) return
      if (e.repeat) return  // ignore auto-repeat while held
      e.preventDefault()
      setKeyPressed(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== PUSH_TO_TALK_KEY) return
      e.preventDefault()
      setKeyPressed(false)
    }
    // Tab/window lost focus mid-press: drop BOTH sources so the mic does
    // not stay open after the user alt-tabs away or the screen blanks.
    const onBlur = () => {
      setKeyPressed(false)
      setTouchPressed(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [sessionStarted])

  if (!sessionStarted) return null
  if (!PUSH_TO_TALK_ENABLED) {
    return (
      <div className="pointer-events-none fixed bottom-3 left-3 z-50">
        <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft/40">
          open mic
        </span>
      </div>
    )
  }

  return (
    <>
      {/* Recording dot — top-left, fades in whenever any source is active */}
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

      {/* Touch PTT pill — bottom-center, large enough for a held thumb.
          - touchAction: 'none' so the OS does not interpret a long-hold as
            text selection, context menu, or callout.
          - setPointerCapture: any subsequent pointerup/cancel for the same
            pointerId is routed back to this element even if the finger
            slides off the pill — without capture we'd miss the up event
            and the mic would stay open. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
        <motion.button
          type="button"
          aria-label="Hold to speak"
          className="pointer-events-auto select-none rounded-full border px-10 py-4 text-xs uppercase tracking-[0.32em]"
          style={{
            touchAction: 'none',
            backgroundColor: touchPressed ? '#1F1B16' : 'rgba(245, 239, 226, 0.92)',
            borderColor: 'rgba(31, 27, 22, 0.18)',
            color: touchPressed ? '#F5EFE2' : '#5C544A',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          initial={false}
          animate={{ scale: touchPressed ? 1.04 : 1 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          onPointerDown={(e) => {
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            setTouchPressed(true)
          }}
          onPointerUp={(e) => {
            e.preventDefault()
            setTouchPressed(false)
          }}
          onPointerCancel={() => setTouchPressed(false)}
          onLostPointerCapture={() => setTouchPressed(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {touchPressed ? 'listening' : 'hold to speak'}
        </motion.button>
      </div>

      {/* Keyboard fallback hint — bottom-left, near-invisible */}
      <div className="pointer-events-none fixed bottom-3 left-3 z-50">
        <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft/40">
          or hold {PUSH_TO_TALK_LABEL}
        </span>
      </div>
    </>
  )
}
