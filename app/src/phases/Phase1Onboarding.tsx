import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const
const AGES = [6, 7, 8, 9, 10, 11, 12]

export default function Phase1Onboarding() {
  const name = useAppStore((s) => s.name)
  const age = useAppStore((s) => s.age)
  const setName = useAppStore((s) => s.setName)
  const setAge = useAppStore((s) => s.setAge)
  const setPhase = useAppStore((s) => s.setPhase)

  const [touchName, setTouchName] = useState('')

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
      className="flex h-full w-full flex-col items-center justify-center gap-16 px-12"
    >
      {/* Title block — generous whitespace, opsz at max */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
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

      {!name && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EDITORIAL_EASE }}
          className="flex w-full max-w-md flex-col items-center gap-5"
        >
          <label className="text-[11px] uppercase tracking-[0.42em] text-ink-soft">
            What is your name?
          </label>
          <div className="relative w-full">
            <input
              type="text"
              value={touchName}
              onChange={(e) => setTouchName(e.target.value)}
              onBlur={() => touchName && setName(touchName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && touchName) setName(touchName)
              }}
              className="peer w-full bg-transparent pb-4 text-center text-5xl italic text-ink placeholder:text-ink-soft/30 focus:outline-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: '"opsz" 144',
                fontWeight: 400,
                letterSpacing: '-0.01em',
              }}
              placeholder="Kimi"
              autoComplete="off"
              spellCheck={false}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] peer-focus:w-full"
              style={{ backgroundColor: 'var(--color-mist)' }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] peer-focus:w-24"
              style={{ backgroundColor: 'var(--color-old-gold)' }}
            />
          </div>
        </motion.div>
      )}

      {name && !age && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center gap-8"
        >
          <label className="text-[11px] uppercase tracking-[0.42em] text-ink-soft">
            How old are you?
          </label>
          <div className="flex flex-wrap justify-center gap-2">
            {AGES.map((a, idx) => (
              <motion.button
                key={a}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.06 * idx,
                  ease: EDITORIAL_EASE,
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => setAge(a)}
                className="group relative h-20 w-16 focus:outline-none"
                aria-label={`${a} years old`}
              >
                {/* Hairline frame */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 transition-colors duration-300"
                  style={{
                    border: '1px solid var(--color-mist)',
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100"
                  style={{
                    border: '1px solid var(--color-old-gold)',
                  }}
                />
                <span
                  className="relative flex h-full w-full items-center justify-center text-3xl italic text-ink"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontVariationSettings: '"opsz" 96',
                    fontWeight: 400,
                  }}
                >
                  {a}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {name && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
          className="text-base italic text-ink-soft"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Hello, {name}.
        </motion.div>
      )}
    </motion.div>
  )
}
