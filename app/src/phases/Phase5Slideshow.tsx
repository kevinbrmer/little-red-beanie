import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { stopVoiceSession, triggerPhaseEntry } from '../voice/elevenlabs'
import { startAmbientAudio, stopAmbientAudio } from '../voice/audioFallback'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

// Give the live voice agent room to speak "Would you like to see the sea?"
// before we open the consent gate, so a "yes" actually answers the question.
const OFFER_SPEAK_MS = 2800

const SEA_HERO = '/images/iran/coast.jpg'
const AMBIENT_AUDIO_IDS = ['audio_sea_waves_01', 'audio_iran_music_traditional_01']

export default function Phase5Slideshow() {
  const tappedFace = useAppStore((s) => s.tappedFace)
  const activeAssets = useAppStore((s) => s.activeAssets)
  const activeAudio = useAppStore((s) => s.activeAudio)
  const offerMade = useAppStore((s) => s.offerMade)
  const childWords = useAppStore((s) => s.childWords)
  const setActiveAssets = useAppStore((s) => s.setActiveAssets)

  const inStage5b = activeAssets.length > 0

  // One-shot guard: the coast is shown exactly once. A plain timer was being
  // cleared on every childWords chunk and never fired — this ref can't be
  // cancelled. ONLY real spoken consent triggers it: no watchdog, no tap,
  // no auto-advance. The sea must wait for Kimi's actual "yes".
  const coastShownRef = useRef(false)
  const showCoast = (reason: string) => {
    if (coastShownRef.current) return
    coastShownRef.current = true
    console.log(`[p5] showing coast (${reason})`)
    setActiveAssets(
      ['iran_landscape_caspian_shore_02'],
      ['audio_sea_waves_01', 'audio_iran_music_traditional_01'],
    )
  }

  // Stage 5a entry: have the LIVE voice agent (Goofy) speak the sea question
  // via the phase-entry trigger — NOT a pre-rendered clip (that was a
  // different, robotic voice). Wipe leftover transcript so only a fresh
  // answer counts, then open the consent gate once the agent has had room to
  // speak. NO watchdog — the scene only advances on a real spoken answer.
  useEffect(() => {
    useAppStore.setState({
      childWords: '',
      silenceSecs: 0,
      offerMade: false,
      activeAssets: [],
      activeAudio: [],
    })

    triggerPhaseEntry()

    const gateTimer = setTimeout(() => {
      useAppStore.setState({ offerMade: true })
      console.log('[p5] consent gate open — waiting for spoken "yes"')
    }, OFFER_SPEAK_MS)

    return () => clearTimeout(gateTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Voice consent ONLY: once the gate is open and Kimi has spoken a
  // non-trivial answer, show the coast. Nothing else advances the scene.
  useEffect(() => {
    if (!offerMade) return
    if (!childWords || childWords.trim().length < 2) return
    console.log('[p5 gate] spoken consent:', JSON.stringify(childWords))
    showCoast(`voice: ${childWords}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerMade, childWords])

  // Ambient sea + music once the coast is up.
  useEffect(() => {
    if (!inStage5b) return
    const hasAmbient = activeAudio.some((id) => AMBIENT_AUDIO_IDS.includes(id))
    if (hasAmbient) startAmbientAudio()
    return () => stopAmbientAudio()
  }, [inStage5b, activeAudio])

  // HARD STOP. Once the coast image is on screen the voice sequence is over.
  // End the ElevenLabs session entirely so the puppet cannot speak, ask, or
  // comment again — only the ambient sea/music loop plays from here.
  useEffect(() => {
    if (!inStage5b) return
    void stopVoiceSession()
  }, [inStage5b])

  // Stage 5a — mascot + the comfort-offer question above the chosen face.
  if (!inStage5b) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
        className="flex h-full w-full flex-col items-center justify-center gap-6 py-10"
      >
        {/* Mascot + question — same header pattern as the other phases */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EDITORIAL_EASE }}
          className="flex flex-col items-center text-center"
        >
          <img
            src="/images/mascot.png"
            alt=""
            aria-hidden="true"
            className="mb-3 h-16 w-16"
            style={{ objectFit: 'contain' }}
          />
          <p
            className="text-3xl italic leading-[1.2] text-ink"
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: '"opsz" 144',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            Would you like to see the sea?
          </p>
        </motion.div>

        <div className="relative h-[40vh] w-auto">
          <div
            aria-hidden="true"
            className="absolute inset-0 -m-16 rounded-full"
            style={{
              background:
                'radial-gradient(closest-side, rgba(184, 150, 104, 0.55), rgba(184, 150, 104, 0.15) 55%, rgba(184, 150, 104, 0) 80%)',
              filter: 'blur(12px)',
            }}
          />
          <img
            src={`/images/faces-large/${tappedFace ?? 'sad'}.png`}
            alt=""
            className="relative h-full w-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </motion.div>
    )
  }

  // Stage 5b — single hero photo, slow fade, vignette, italic caption
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, ease: EDITORIAL_EASE }}
      className="relative h-full w-full overflow-hidden bg-ink"
    >
      <motion.img
        src={SEA_HERO}
        alt=""
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.6, ease: EDITORIAL_EASE }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Top + bottom vignette for caption legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(15,12,10,0.55) 0%, rgba(15,12,10,0) 28%, rgba(15,12,10,0) 70%, rgba(15,12,10,0.55) 100%)',
        }}
      />

      {/* Italic gold caption */}
      <motion.figcaption
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 1.8, ease: EDITORIAL_EASE }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
      >
        <span
          className="block text-3xl italic text-old-gold"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            letterSpacing: '-0.005em',
          }}
        >
          Coast of Iran, for Kimi
        </span>
      </motion.figcaption>
    </motion.div>
  )
}
