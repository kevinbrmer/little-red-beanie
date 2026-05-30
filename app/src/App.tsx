import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from './state/appStore'
import { startVoiceSession } from './voice/elevenlabs'
import { useKiosk } from './kiosk/useKiosk'
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
  useKiosk()
  const phase = useAppStore((s) => s.phase)
  const sessionStarted = useAppStore((s) => s.sessionStarted)
  const escalated = useAppStore((s) => s.escalated)
  // Local guard against double-tap on the Tap-to-begin overlay. The store's
  // sessionStarted flips only after onConnect fires (~600 ms), so a second
  // tap can land before sessionStarted goes true. isStarting blocks the
  // second click client-side, and startVoiceSession's startingPromise
  // blocks any further concurrent calls in the voice layer.
  const [isStarting, setIsStarting] = useState(false)

  const PhaseComponent = phaseComponents[phase]

  if (!sessionStarted) {
    const handleStart = async () => {
      if (isStarting) return
      setIsStarting(true)
      try {
        await startVoiceSession()
      } catch (err) {
        console.error('[app] startVoiceSession failed', err)
        setIsStarting(false)
      }
    }
    return (
      <button
        type="button"
        onClick={handleStart}
        disabled={isStarting}
        className="relative flex h-screen w-screen flex-col items-center justify-center bg-cream focus:outline-none disabled:cursor-default"
        aria-label="Tap to begin"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center"
        >
          <img
            src="/images/mascot.png"
            alt=""
            aria-hidden="true"
            className="mb-8 h-24 w-24"
            style={{ objectFit: 'contain' }}
          />

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
            duration: 0.7,
            ease: EDITORIAL_EASE,
            opacity: { duration: 0.7 },
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
