import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

export default function Phase1Onboarding() {
  const name = useAppStore((s) => s.name)
  const age = useAppStore((s) => s.age)
  const setName = useAppStore((s) => s.setName)
  const setAge = useAppStore((s) => s.setAge)
  const setPhase = useAppStore((s) => s.setPhase)

  const [touchName, setTouchName] = useState('')

  // Send initial CTX on mount so Opus knows phase=1, name=null, age=null
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // When both name and age known, advance after a short pause (in case Opus didn't via tool)
  useEffect(() => {
    if (name && age) {
      const t = setTimeout(() => setPhase(2), 1500)
      return () => clearTimeout(t)
    }
  }, [name, age, setPhase])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
      className="flex h-full w-full flex-col items-center justify-center gap-12 px-12"
    >
      <div className="flex flex-col items-center text-center">
        <span
          className="mb-4 text-2xl text-old-gold"
          aria-hidden="true"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ❦
        </span>
        <h1
          className="text-5xl italic leading-tight text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          Hi, I'm Little Red Beanie.
        </h1>
      </div>

      {!name && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EDITORIAL_EASE }}
          className="flex w-full max-w-md flex-col items-center gap-4"
        >
          <label className="text-xs uppercase tracking-[0.32em] text-ink-soft">
            What's your name?
          </label>
          <input
            type="text"
            value={touchName}
            onChange={(e) => setTouchName(e.target.value)}
            onBlur={() => touchName && setName(touchName)}
            className="w-full border-b border-ink/30 bg-transparent pb-3 text-center text-4xl italic text-ink placeholder:text-ink-soft/40 focus:border-old-gold focus:outline-none"
            style={{ fontFamily: 'var(--font-display)' }}
            placeholder="Kimi"
          />
        </motion.div>
      )}

      {name && !age && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center gap-6"
        >
          <label className="text-xs uppercase tracking-[0.32em] text-ink-soft">
            How old are you?
          </label>
          <div className="flex flex-wrap justify-center gap-3">
            {[6, 7, 8, 9, 10, 11, 12].map((a, idx) => (
              <motion.button
                key={a}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.08 * idx,
                  ease: EDITORIAL_EASE,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAge(a)}
                className="h-16 w-16 rounded-full bg-paper text-2xl text-deep-blue shadow-[0_2px_6px_rgba(31,27,22,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-mist transition hover:shadow-[0_4px_12px_rgba(31,27,22,0.12),inset_0_1px_0_rgba(255,255,255,0.7)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {a}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {name && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
          className="text-base italic text-ink-soft"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Hello, {name}.
        </motion.div>
      )}
    </motion.div>
  )
}
