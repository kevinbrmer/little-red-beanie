import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

export default function Phase1Onboarding() {
  const name = useAppStore((s) => s.name)
  const age = useAppStore((s) => s.age)
  const setPhase = useAppStore((s) => s.setPhase)

  useEffect(() => {
    sendCtxUpdate()
  }, [])

  useEffect(() => {
    if (name && age) {
      const t = setTimeout(() => setPhase(2), 1800)
      return () => clearTimeout(t)
    }
  }, [name, age, setPhase])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: EDITORIAL_EASE }}
      className="flex h-full w-full flex-col items-center justify-center gap-16 px-12"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EDITORIAL_EASE }}
        className="flex flex-col items-center text-center"
      >
        <span
          className="mb-6 text-xs uppercase tracking-[0.42em] text-old-gold"
          aria-hidden="true"
        >
          Chapter I
        </span>
        <h1
          className="text-5xl italic leading-tight text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            letterSpacing: '-0.018em',
          }}
        >
          Hi, I'm Little Red Beanie.
        </h1>
        <div
          className="mt-8 h-px w-16"
          style={{ backgroundColor: 'var(--color-mist)' }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Stage 1 — waiting for spoken name */}
      {!name && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.4, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center gap-6"
        >
          <p
            className="text-[11px] uppercase tracking-[0.42em] text-ink-soft"
          >
            Listening
          </p>
          <ListeningDots />
        </motion.div>
      )}

      {/* Stage 2 — name captured, waiting for spoken age */}
      {name && !age && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center gap-6"
        >
          <p
            className="text-[11px] uppercase tracking-[0.42em] text-ink-soft"
          >
            Listening
          </p>
          <ListeningDots />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.6, ease: EDITORIAL_EASE }}
            className="mt-2 text-base italic text-ink-soft"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Hello, {name}.
          </motion.p>
        </motion.div>
      )}

      {/* Stage 3 — both captured, gentle confirmation */}
      {name && age && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: EDITORIAL_EASE }}
          className="text-2xl italic text-ink-soft"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Hello, {name}.
        </motion.p>
      )}
    </motion.div>
  )
}

function ListeningDots() {
  return (
    <div
      className="flex items-end gap-2"
      aria-hidden="true"
      role="presentation"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1 w-1 rounded-full"
          style={{ backgroundColor: 'var(--color-old-gold)' }}
          animate={{
            opacity: [0.25, 1, 0.25],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  )
}
