import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate, triggerPhaseEntry } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'
import ColorPalette from '../components/ColorPalette'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

// After the color lands, give the puppet a beat to say "You picked green.",
// then auto-fill the silhouette. No tap step.
const FILL_DELAY_MS = 1200

// Total time the color stays on screen before Phase 3 takes over. Includes
// the fill delay above plus room for the puppet's short mirror to land.
const ADVANCE_DELAY_MS = 2000

export default function Phase2Coloring() {
  const color = useAppStore((s) => s.color)
  const pickColor = useAppStore((s) => s.pickColor)
  const finishColoring = useAppStore((s) => s.finishColoring)
  const setPhase = useAppStore((s) => s.setPhase)

  const [filled, setFilled] = useState(false)

  // On mount: force the agent to speak the Phase 2 entry line
  useEffect(() => {
    triggerPhaseEntry()
  }, [])

  // When the color lands: sync CTX, auto-fill after a short beat, then advance.
  useEffect(() => {
    if (!color) return
    sendCtxUpdate()

    const fillTimer = setTimeout(() => {
      setFilled(true)
      finishColoring()
    }, FILL_DELAY_MS)

    // The Phase 3 entry bridge ("Beautiful. Now let's find a face for today.")
    // plays right after the advance — no need for a separate "great job" line.
    const advanceTimer = setTimeout(() => {
      if (useAppStore.getState().phase === 2) {
        setPhase(3)
      }
    }, ADVANCE_DELAY_MS)

    return () => {
      clearTimeout(fillTimer)
      clearTimeout(advanceTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
      className="flex h-full w-full flex-col items-center justify-between py-10"
    >
      {/* Title block — chapter overline + warm prompt */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EDITORIAL_EASE }}
        className="flex flex-col items-center"
      >
        <span
          className="mb-3 text-xs uppercase tracking-[0.42em] text-old-gold"
          aria-hidden="true"
        >
          Chapter II
        </span>
        <p
          className="text-2xl italic leading-snug text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 96',
            fontWeight: 400,
          }}
        >
          Which color feels right today?
        </p>
        <div
          className="mt-4 h-px w-12"
          style={{ backgroundColor: 'var(--color-mist)' }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Silhouette — fills automatically once a color is picked */}
      <motion.div
        className="h-[58vh] w-[38vh]"
        aria-hidden="true"
      >
        <KimiSilhouette
          clothingColor={filled ? color : null}
          face="happy"
          showFace={false}
        />
      </motion.div>

      {/* Palette stays visible until the silhouette is filled */}
      {!filled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center gap-3"
        >
          <ColorPalette onPick={pickColor} selected={color} />
        </motion.div>
      )}
    </motion.div>
  )
}
