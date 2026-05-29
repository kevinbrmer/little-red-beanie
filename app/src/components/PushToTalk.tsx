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

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <motion.div
        className="flex items-center gap-3 rounded-full px-5 py-2.5"
        animate={{
          backgroundColor: pressed
            ? 'rgba(184, 150, 104, 0.16)'
            : 'rgba(31, 27, 22, 0.045)',
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <motion.span
          className="block h-1.5 w-1.5 rounded-full"
          animate={
            pressed
              ? {
                  backgroundColor: 'var(--color-old-gold)',
                  scale: [1, 1.4, 1],
                  opacity: [0.7, 1, 0.7],
                }
              : {
                  backgroundColor: 'var(--color-mist)',
                  scale: 1,
                  opacity: 1,
                }
          }
          transition={
            pressed
              ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.25 }
          }
        />
        <motion.span
          className="text-[10px] uppercase tracking-[0.36em]"
          animate={{
            color: pressed
              ? 'var(--color-old-gold)'
              : 'var(--color-ink-soft)',
          }}
          transition={{ duration: 0.3 }}
        >
          {pressed ? 'Listening' : 'Hold space to speak'}
        </motion.span>
      </motion.div>
    </div>
  )
}
