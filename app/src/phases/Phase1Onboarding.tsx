import { useEffect, useState } from 'react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'

export default function Phase1Onboarding() {
  const name = useAppStore((s) => s.name)
  const age = useAppStore((s) => s.age)
  const setName = useAppStore((s) => s.setName)
  const setAge = useAppStore((s) => s.setAge)
  const setPhase = useAppStore((s) => s.setPhase)

  const [touchName, setTouchName] = useState('')

  // Send initial CTX on mount so Opus knows phase=1, name=null, age=null
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // When both name and age known, advance after a short pause (in case Opus didn't via tool)
  useEffect(() => {
    if (name && age) {
      const t = setTimeout(() => setPhase(2), 1500)
      return () => clearTimeout(t)
    }
  }, [name, age, setPhase])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-12">
      <h1 className="text-6xl font-bold text-beanie-blue">Hi, I'm Little Red Beanie</h1>

      {!name && (
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl text-beanie-blue">Or type your name:</label>
          <input
            type="text"
            value={touchName}
            onChange={(e) => setTouchName(e.target.value)}
            onBlur={() => touchName && setName(touchName)}
            className="rounded-xl border-4 border-beanie-blue px-6 py-4 text-3xl"
            placeholder="Kimi"
          />
        </div>
      )}

      {name && !age && (
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl text-beanie-blue">Or tap your age:</label>
          <div className="flex gap-3">
            {[6, 7, 8, 9, 10, 11, 12].map((a) => (
              <button
                key={a}
                onClick={() => setAge(a)}
                className="rounded-xl border-4 border-beanie-blue px-6 py-4 text-3xl font-bold"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {name && <div className="text-2xl text-beanie-blue">Hello, {name}.</div>}
    </div>
  )
}
