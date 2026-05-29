import { useAppStore } from './state/appStore'
import { startVoiceSession } from './voice/elevenlabs'
import Phase1Onboarding from './phases/Phase1Onboarding'
import Phase2Coloring from './phases/Phase2Coloring'
import Phase3Carousel from './phases/Phase3Carousel'
import Phase4Question from './phases/Phase4Question'
import Phase5Slideshow from './phases/Phase5Slideshow'
import EmergencyTouchZone from './components/EmergencyTouchZone'

const phaseComponents = {
  1: Phase1Onboarding,
  2: Phase2Coloring,
  3: Phase3Carousel,
  4: Phase4Question,
  5: Phase5Slideshow,
} as const

export default function App() {
  const phase = useAppStore((s) => s.phase)
  const sessionStarted = useAppStore((s) => s.sessionStarted)
  const escalated = useAppStore((s) => s.escalated)

  const PhaseComponent = phaseComponents[phase]

  if (!sessionStarted) {
    return (
      <button
        onClick={() => startVoiceSession()}
        className="flex h-screen w-screen items-center justify-center bg-beanie-red text-beanie-white"
      >
        <span className="text-5xl font-bold">Tap to begin</span>
      </button>
    )
  }

  return (
    <div
      className={`relative flex h-screen w-screen flex-col items-center justify-center ${
        escalated ? 'bg-beanie-blue/50' : 'bg-beanie-yellow'
      }`}
    >
      <PhaseComponent />
      <EmergencyTouchZone />
    </div>
  )
}
