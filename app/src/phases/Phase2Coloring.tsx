import { useEffect, useState } from 'react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'
import ColorPalette from '../components/ColorPalette'

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
    // CSS transition is 1s; advance after 2.5s so puppet can say "great job"
    const t = setTimeout(() => {
      setPhase(3)
      sendCtxUpdate()
    }, 2500)
    return () => clearTimeout(t)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-around py-8">
      <div className="text-5xl font-bold text-beanie-blue">{name}</div>

      <button
        onClick={handleSilhouetteTap}
        className="h-[60vh] w-[40vh] focus:outline-none"
        disabled={!color || filled}
        aria-label="Tap to color in"
      >
        <KimiSilhouette
          clothingColor={filled ? color : null}
          face="happy"
          showFace={false}
        />
      </button>

      {!filled && <ColorPalette onPick={pickColor} />}
    </div>
  )
}
