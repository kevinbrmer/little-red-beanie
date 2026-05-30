import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useAppStore, type FaceExpression } from '../state/appStore'
import { sendCtxUpdate, triggerPhaseEntry } from '../voice/elevenlabs'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

// Order is fixed by the design spec (Kevin, 2026-05-29): left-to-right.
const FACES: { id: FaceExpression; src: string; label: string }[] = [
  { id: 'balanced', src: '/images/faces-large/balanced.png', label: 'Balanced' },
  { id: 'happy',    src: '/images/faces-large/happy.png',    label: 'Happy'    },
  { id: 'sad',      src: '/images/faces-large/sad.png',      label: 'Sad'      },
  { id: 'scared',   src: '/images/faces-large/scared.png',   label: 'Scared'   },
  { id: 'angry',    src: '/images/faces-large/angry.png',    label: 'Angry'    },
]

export default function Phase3Carousel() {
  const name = useAppStore((s) => s.name)
  const tapFace = useAppStore((s) => s.tapFace)
  const setPhase = useAppStore((s) => s.setPhase)
  const tappedFace = useAppStore((s) => s.tappedFace)
  const tapped = tappedFace !== null

  // Force the puppet's Phase 3 bridge line on mount.
  useEffect(() => {
    triggerPhaseEntry()
  }, [])

  // Auto-advance to Phase 4 once a face is tapped. The puppet's mirror line
  // ("You picked this one") plays during the 2s window before the page changes.
  useEffect(() => {
    if (!tappedFace) return
    sendCtxUpdate()
    const t = setTimeout(() => {
      if (useAppStore.getState().phase === 3) {
        setPhase(4)
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [tappedFace, setPhase])

  const handleTap = (face: FaceExpression) => {
    if (tapped) return
    tapFace(face)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
      className="flex h-full w-full flex-col items-center justify-between py-10"
    >
      {/* Mascot + prompt line */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: EDITORIAL_EASE }}
        className="flex max-w-xl flex-col items-center text-center"
      >
        <img
          src="/images/mascot.png"
          alt=""
          aria-hidden="true"
          className="mb-3 h-20 w-20"
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
          Tap the face that feels like you{name ? `, ${name}` : ''}.
        </p>
      </motion.div>

      {/* Face row — 5 portraits side by side, no wrap. Scaled to fit one row. */}
      <div className="flex w-full flex-nowrap items-center justify-center gap-2 px-4">
        {FACES.map((face, i) => {
          const isSelected = tappedFace === face.id
          const isDimmed = tapped && !isSelected
          return (
            <motion.button
              key={face.id}
              type="button"
              onClick={() => handleTap(face.id)}
              disabled={tapped}
              aria-label={face.label}
              aria-pressed={isSelected}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: isDimmed ? 0.25 : 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.15 + i * 0.06,
                ease: EDITORIAL_EASE,
              }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex shrink basis-1/5 flex-col items-center focus:outline-none"
              style={{ maxWidth: '19vw' }}
            >
              <img
                src={face.src}
                alt={face.label}
                className="h-auto w-full"
                style={{ objectFit: 'contain', maxHeight: '55vh' }}
              />
              <span
                className="mt-1 text-[10px] uppercase tracking-[0.30em] transition-colors duration-300"
                style={{
                  color: isSelected ? 'var(--color-ink)' : 'var(--color-ink-soft)',
                  opacity: isSelected ? 1 : 0.55,
                }}
              >
                {face.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Quiet status caption */}
      <div className="text-xs uppercase tracking-[0.28em] text-ink-soft/70">
        {tapped ? 'You picked this one.' : 'Listening'}
      </div>
    </motion.div>
  )
}
