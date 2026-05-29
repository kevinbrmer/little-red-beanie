import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore, type FaceExpression } from '../state/appStore'
import { sendCtxUpdate, triggerPhaseEntry } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'

const CYCLE: FaceExpression[] = ['happy', 'surprised', 'scared', 'sad']
const SECS_PER_FACE = 3
const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

export default function Phase3Carousel() {
  const name = useAppStore((s) => s.name)
  const color = useAppStore((s) => s.color)
  const cycleFace = useAppStore((s) => s.cycleFace)
  const tapFace = useAppStore((s) => s.tapFace)
  const setPhase = useAppStore((s) => s.setPhase)
  const faceNow = useAppStore((s) => s.faceNow)

  const [tapped, setTapped] = useState(false)

  // Initial face + force the agent to speak the Phase 3 bridge line
  useEffect(() => {
    cycleFace(CYCLE[0])
    triggerPhaseEntry()
  }, [cycleFace])

  // Cycle face every 3s while not yet tapped
  useEffect(() => {
    if (tapped) return
    const interval = setInterval(() => {
      const current = useAppStore.getState().faceNow
      const currentIdx = CYCLE.indexOf(current)
      const nextIdx = (currentIdx + 1) % CYCLE.length
      cycleFace(CYCLE[nextIdx])
    }, SECS_PER_FACE * 1000)
    return () => clearInterval(interval)
  }, [tapped, cycleFace])

  const handleTap = () => {
    if (tapped) return
    setTapped(true)
    tapFace(faceNow)
    sendCtxUpdate()
    // Give Opus room to finish "You picked this one, Kimi." before we cut.
    // Guard against double-advance: if Opus has already moved the phase
    // forward via advance_phase, this timer must not pull the user back.
    const t = setTimeout(() => {
      if (useAppStore.getState().phase === 3) {
        setPhase(4)
        sendCtxUpdate()
      }
    }, 3500)
    return () => clearTimeout(t)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
      className="flex h-full w-full flex-col items-center justify-between py-10"
    >
      {/* Magazine-style pull-quote instruction */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: EDITORIAL_EASE }}
        className="flex max-w-xl flex-col items-center text-center"
      >
        <span
          className="text-2xl text-old-gold"
          aria-hidden="true"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ❋
        </span>
        <p
          className="mt-2 text-2xl italic leading-snug text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 96',
            fontWeight: 400,
          }}
        >
          Tap when you see the face that feels like you, {name}.
        </p>
      </motion.div>

      {/* Silhouette hero */}
      <motion.button
        type="button"
        onClick={handleTap}
        className="h-[58vh] w-[38vh] focus:outline-none"
        disabled={tapped}
        aria-label="Tap when this face feels like you"
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.08, ease: EDITORIAL_EASE }}
      >
        <KimiSilhouette
          clothingColor={color}
          face={faceNow}
          showFace={true}
        />
      </motion.button>

      {/* Quiet status caption */}
      <div className="text-xs uppercase tracking-[0.28em] text-ink-soft/70">
        {tapped ? 'You picked this one.' : faceNow}
      </div>
    </motion.div>
  )
}
