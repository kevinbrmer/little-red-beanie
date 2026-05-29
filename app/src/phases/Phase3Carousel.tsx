import { useEffect, useState } from 'react'
import { useAppStore, type FaceExpression } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'

const CYCLE: FaceExpression[] = ['happy', 'surprised', 'scared', 'sad']
const SECS_PER_FACE = 3

export default function Phase3Carousel() {
  const name = useAppStore((s) => s.name)
  const color = useAppStore((s) => s.color)
  const cycleFace = useAppStore((s) => s.cycleFace)
  const tapFace = useAppStore((s) => s.tapFace)
  const setPhase = useAppStore((s) => s.setPhase)
  const faceNow = useAppStore((s) => s.faceNow)

  const [tapped, setTapped] = useState(false)

  // Initial face + initial CTX
  useEffect(() => {
    cycleFace(CYCLE[0])
    sendCtxUpdate()
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
    // Guard against double-advance: if Opus has already moved the phase
    // forward via advance_phase, this timer must not pull the user back.
    const t = setTimeout(() => {
      if (useAppStore.getState().phase === 3) {
        setPhase(4)
        sendCtxUpdate()
      }
    }, 2000)
    return () => clearTimeout(t)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-around py-8">
      <div className="max-w-2xl text-center text-3xl text-beanie-blue">
        Tap when you see the face that feels like you, {name}.
      </div>

      <button
        onClick={handleTap}
        className="h-[60vh] w-[40vh] focus:outline-none"
        disabled={tapped}
        aria-label="Tap when this face feels like you"
      >
        <KimiSilhouette
          clothingColor={color}
          face={faceNow}
          showFace={true}
        />
      </button>

      <div className="text-xl text-beanie-blue/60">
        {tapped ? 'You picked this one.' : `Face: ${faceNow}`}
      </div>
    </div>
  )
}
