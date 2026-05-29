import { useEffect, useState } from 'react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'

export default function Phase4Question() {
  const name = useAppStore((s) => s.name)
  const color = useAppStore((s) => s.color)
  const tappedFace = useAppStore((s) => s.tappedFace)
  const childWords = useAppStore((s) => s.childWords)

  const [secs, setSecs] = useState(0)

  // Initial CTX
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // Reset silence counter whenever the child says something new.
  // The trigger is the external STT update via childWords — that's an
  // external-system sync, not a cascading render, so the rule's intent
  // is satisfied even though the lint can't tell.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs UI counter to external STT signal
    setSecs(0)
    useAppStore.setState({ silenceSecs: 0 })
  }, [childWords])

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
    <div className="flex h-full w-full flex-col items-center justify-around py-8">
      <div className="flex w-full justify-between px-12">
        <div className="text-3xl text-beanie-blue/70">Phase 4</div>
        <div className="text-3xl text-beanie-blue/70">{secs}s</div>
      </div>

      <div className="h-[40vh] w-[28vh]">
        <KimiSilhouette
          clothingColor={color}
          face={tappedFace ?? 'sad'}
          showFace={true}
        />
      </div>

      <div className="max-w-3xl text-center text-4xl font-bold text-beanie-blue">
        Do you want to talk about it, {name}?
      </div>

      {childWords && (
        <div className="max-w-3xl text-center text-xl italic text-beanie-blue/70">
          "{childWords}"
        </div>
      )}
    </div>
  )
}
