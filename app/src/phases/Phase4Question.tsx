import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate, triggerPhaseEntry } from '../voice/elevenlabs'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

export default function Phase4Question() {
  const name = useAppStore((s) => s.name)
  const tappedFace = useAppStore((s) => s.tappedFace)
  const childWords = useAppStore((s) => s.childWords)

  const setPhase = useAppStore((s) => s.setPhase)
  const [, setSecs] = useState(0)

  // Force Opus to speak the Phase 4 opening question on mount.
  // Phase 3 → 4 is post-tap (no STT race), so the entry-trigger user
  // message is safe to send. Opus's Phase 3 reply only carries the
  // mirror line; the question itself lands in his response to this
  // (phase 4 entry) trigger.
  useEffect(() => {
    triggerPhaseEntry()
  }, [])

  // When child_words lands, set the topic and give Opus room to speak
  // his validation + Stage-5a echo+offer (also inline), then advance to
  // Phase 5 on a timer. Opus does NOT call advance_phase here because
  // tool calls right after STT finalisation race with the server's
  // post-tool LLM call and crash the SDK. offerMade is set when the
  // page swaps so Phase 5 mounts already in the consent-waiting state.
  useEffect(() => {
    if (!childWords) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs UI counter to external STT signal
    setSecs(0)
    useAppStore.setState({ silenceSecs: 0, topic: childWords })
    sendCtxUpdate()
    const t = setTimeout(() => {
      if (useAppStore.getState().phase === 4) {
        useAppStore.setState({ phase: 5, offerMade: true })
      }
    }, 5000)
    return () => clearTimeout(t)
  }, [childWords, setPhase])

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
      className="relative flex h-full w-full flex-col items-center justify-center gap-6 px-10 py-10"
    >
      {/* Mascot + question — same header pattern as Phase 2/3 */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
        className="flex flex-col items-center text-center"
      >
        <img
          src="/images/mascot.png"
          alt=""
          aria-hidden="true"
          className="mb-3 h-16 w-16"
          style={{ objectFit: 'contain' }}
        />
        <blockquote
          className="text-3xl italic leading-[1.2] text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          Do you want to talk about it, {name}?
        </blockquote>
      </motion.div>

      {/* Large embedded face — the face Kimi chose in Phase 3, carried
          forward and shown continuously. Embedded, not fullscreen. */}
      <motion.img
        src={`/images/faces-large/${tappedFace ?? 'sad'}.png`}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EDITORIAL_EASE }}
        className="h-[40vh] w-auto"
        style={{ objectFit: 'contain' }}
      />

      {childWords && (
        <motion.figcaption
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
          className="mx-auto border-l border-old-gold/60 pl-5 text-base italic text-ink-soft text-left max-w-md"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          "{childWords}"
        </motion.figcaption>
      )}
    </motion.div>
  )
}
