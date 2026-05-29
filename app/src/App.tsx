import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from './state/appStore'
import { startVoiceSession } from './voice/elevenlabs'
import Phase1Onboarding from './phases/Phase1Onboarding'
import Phase2Coloring from './phases/Phase2Coloring'
import Phase3Carousel from './phases/Phase3Carousel'
import Phase4Question from './phases/Phase4Question'
import Phase5Slideshow from './phases/Phase5Slideshow'
import EmergencyTouchZone from './components/EmergencyTouchZone'
import EscalationGlow from './components/EscalationGlow'
import PushToTalk from './components/PushToTalk'

const phaseComponents = {
  1: Phase1Onboarding,
  2: Phase2Coloring,
  3: Phase3Carousel,
  4: Phase4Question,
  5: Phase5Slideshow,
} as const

// Smooth, editorial easing — never bouncy
const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

export default function App() {
  const phase = useAppStore((s) => s.phase)
  const sessionStarted = useAppStore((s) => s.sessionStarted)
  const escalated = useAppStore((s) => s.escalated)

  const PhaseComponent = phaseComponents[phase]

  if (!sessionStarted) {
    return (
      <button
        type="button"
        onClick={() => startVoiceSession()}
        className="relative flex h-screen w-screen flex-col items-center justify-center bg-cream focus:outline-none"
        aria-label="Tap to begin"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center"
        >
          <span
            className="mb-10 text-3xl text-old-gold"
            aria-hidden="true"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ❋
          </span>

          <h1
            className="font-display text-7xl italic leading-none text-ink"
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: '"opsz" 144',
              fontWeight: 400,
              letterSpacing: '-0.015em',
            }}
          >
            Little Red Beanie
          </h1>

          <div
            className="mt-8 h-px w-24"
            style={{ backgroundColor: 'var(--color-mist)' }}
            aria-hidden="true"
          />

          <p className="mt-8 text-sm uppercase tracking-[0.32em] text-ink-soft">
            Tap to begin
          </p>
        </motion.div>
      </button>
    )
  }

  return (
    <div
      className={`relative flex h-screen w-screen flex-col items-center justify-center transition-colors duration-700 ${
        escalated ? 'bg-paper' : 'bg-cream'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.4,
            ease: EDITORIAL_EASE,
            opacity: { duration: 1.4 },
          }}
          className="flex h-full w-full items-center justify-center"
        >
          <PhaseComponent />
        </motion.div>
      </AnimatePresence>
      <EmergencyTouchZone />
      <EscalationGlow />
      <PushToTalk />
    </div>
  )
}
