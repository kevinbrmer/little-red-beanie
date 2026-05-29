import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

export default function Phase4Question() {
  const name = useAppStore((s) => s.name)
  const color = useAppStore((s) => s.color)
  const tappedFace = useAppStore((s) => s.tappedFace)
  const childWords = useAppStore((s) => s.childWords)

  const [secs, setSecs] = useState(0)

  // Initial CTX
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // Reset silence counter whenever the child says something new.
  // The trigger is the external STT update via childWords — that's an
  // external-system sync, not a cascading render, so the rule's intent
  // is satisfied even though the lint can't tell.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs UI counter to external STT signal
    setSecs(0)
    useAppStore.setState({ silenceSecs: 0 })
  }, [childWords])

  // Tick every second; trigger reopener at 15s; refresh CTX at 40s for null-topic advance
  useEffect(() => {
    const interval = setInterval(() => {
      setSecs((s) => {
        const next = s + 1
        useAppStore.setState({ silenceSecs: next })
        if (next === 15) {
          useAppStore.setState({ reopened: true })
          sendCtxUpdate()
        }
        if (next === 40) {
          sendCtxUpdate()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
      className="relative flex h-full w-full items-center justify-center px-10"
    >
      {/* Margin illustration — tiny silhouette in lower-left corner */}
      <div
        className="pointer-events-none absolute bottom-10 left-10 h-[22vh] w-[14vh] opacity-90"
        aria-hidden="true"
      >
        <KimiSilhouette
          clothingColor={color}
          face={tappedFace ?? 'sad'}
          showFace={true}
        />
      </div>

      {/* Quiet meta — top corners */}
      <div className="pointer-events-none absolute top-8 left-10 text-xs uppercase tracking-[0.28em] text-ink-soft/60">
        Phase IV
      </div>
      <div className="pointer-events-none absolute top-8 right-10 font-mono text-xs tracking-wider text-ink-soft/50">
        {secs.toString().padStart(2, '0')}s
      </div>

      {/* The question as a giant pulled quote */}
      <motion.figure
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EDITORIAL_EASE }}
        className="relative mx-auto max-w-2xl"
      >
        {/* Hanging quotation mark in old gold */}
        <span
          aria-hidden="true"
          className="absolute -left-2 -top-12 select-none text-[8rem] leading-none text-old-gold/80"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontVariationSettings: '"opsz" 144',
          }}
        >
          “
        </span>

        <blockquote
          className="relative text-5xl italic leading-[1.15] text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          Do you want to talk about it, {name}?
        </blockquote>

        {childWords && (
          <motion.figcaption
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
            className="mt-8 border-l border-old-gold/60 pl-5 text-lg italic text-ink-soft"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            “{childWords}”
          </motion.figcaption>
        )}
      </motion.figure>
    </motion.div>
  )
}
