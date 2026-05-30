import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import ColorPalette from '../components/ColorPalette'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

// After the color word lands, swap the silhouette to the filled illustration
// almost immediately. The previous 1.2s "give the puppet a beat to say
// 'You picked black' first" timing made the fill feel sluggish. Real-time
// reaction reads better — and Hard Rule #11 already constrains the puppet
// to wait for CTX color=set, so the mirror line lands naturally afterwards.
const FILL_DELAY_MS = 300

// Phase 2 → 3 advance happens after the fill so Kimi has a beat to see her
// new outfit before the face row appears. 3s gives the puppet's full
// "You picked black. Beautiful." mirror (~2.2s audio + latency) room to
// land — 2s truncated it.
const ADVANCE_DELAY_MS = 3000

export default function Phase2Coloring() {
  const color = useAppStore((s) => s.color)
  const pickColor = useAppStore((s) => s.pickColor)
  const finishColoring = useAppStore((s) => s.finishColoring)
  const setPhase = useAppStore((s) => s.setPhase)

  const [filled, setFilled] = useState(false)

  // No entry trigger: Opus already spoke the Phase 2 invite line
  // ("Which color feels right today?") inline in his Phase 1 → 2 reply.
  // Forcing a turn here would only push him into a redundant reply
  // (and previously triggered the SDK crash via tool-call collisions).
  // Phase 2 just renders silhouette + palette and waits for a tap.

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
      {/* Mascot + question */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EDITORIAL_EASE }}
        className="flex flex-col items-center"
      >
        <img
          src="/images/mascot.png"
          alt=""
          aria-hidden="true"
          className="mb-4 h-20 w-20"
          style={{ objectFit: 'contain' }}
        />
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
      </motion.div>

      {/* Silhouette — hard swap, no fade, no motion. The empty outline is
          replaced by the filled illustration in a single React render. Both
          images live at the exact same absolute position. */}
      <div
        className="relative h-[58vh] w-[38vh]"
        aria-hidden="true"
      >
        <img
          src={filled ? '/images/silhouette/filled-black.png' : '/images/silhouette/empty.png'}
          alt=""
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: 'contain', objectPosition: 'center top' }}
        />
      </div>

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
