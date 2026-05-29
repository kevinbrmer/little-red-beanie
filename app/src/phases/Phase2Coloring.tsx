import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'
import ColorPalette from '../components/ColorPalette'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

export default function Phase2Coloring() {
  const name = useAppStore((s) => s.name)
  const color = useAppStore((s) => s.color)
  const pickColor = useAppStore((s) => s.pickColor)
  const finishColoring = useAppStore((s) => s.finishColoring)
  const setPhase = useAppStore((s) => s.setPhase)

  const [filled, setFilled] = useState(false)

  // On mount: tell Opus we're in Phase 2 with no color yet
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // When color picked, send CTX update so Opus says the confirmation line
  useEffect(() => {
    if (color) sendCtxUpdate()
  }, [color])

  const handleSilhouetteTap = () => {
    if (!color || filled) return
    setFilled(true)
    finishColoring()
    // Give Opus room to finish "You did such a great job, Kimi." before we cut.
    // Guard against double-advance: if Opus has already moved the phase
    // forward via advance_phase, this timer must not pull the user back.
    const t = setTimeout(() => {
      if (useAppStore.getState().phase === 2) {
        setPhase(3)
        sendCtxUpdate()
      }
    }, 3000)
    return () => clearTimeout(t)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
      className="flex h-full w-full flex-col items-center justify-between py-10"
    >
      {/* Header — name as Fraunces display */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EDITORIAL_EASE }}
        className="flex flex-col items-center"
      >
        <span
          className="text-xs uppercase tracking-[0.32em] text-ink-soft"
        >
          for
        </span>
        <h2
          className="mt-1 text-4xl italic text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 96',
            fontWeight: 400,
          }}
        >
          {name}
        </h2>
        <div
          className="mt-3 h-px w-12"
          style={{ backgroundColor: 'var(--color-mist)' }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Silhouette hero */}
      <motion.button
        type="button"
        onClick={handleSilhouetteTap}
        className="h-[58vh] w-[38vh] focus:outline-none"
        disabled={!color || filled}
        aria-label="Tap to color in"
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.08, ease: EDITORIAL_EASE }}
      >
        <KimiSilhouette
          clothingColor={filled ? color : null}
          face="happy"
          showFace={false}
        />
      </motion.button>

      {/* Palette — arc-arranged */}
      {!filled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center gap-3"
        >
          <p
            className="text-base italic text-ink-soft"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Which color feels right today?
          </p>
          <ColorPalette onPick={pickColor} selected={color} />
        </motion.div>
      )}
    </motion.div>
  )
}
