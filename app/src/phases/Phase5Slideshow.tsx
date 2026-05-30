import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import { startAmbientAudio, stopAmbientAudio } from '../voice/audioFallback'

const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

const SEA_HERO = '/images/iran/sea_hero.jpg'
const AMBIENT_AUDIO_IDS = ['audio_sea_waves_01', 'audio_iran_music_traditional_01']

export default function Phase5Slideshow() {
  const name = useAppStore((s) => s.name)
  const tappedFace = useAppStore((s) => s.tappedFace)
  const activeAssets = useAppStore((s) => s.activeAssets)
  const activeAudio = useAppStore((s) => s.activeAudio)
  const offerMade = useAppStore((s) => s.offerMade)

  // No entry trigger: Opus already spoke Stage 5a (echo + offer) inline
  // in his Phase 4 → 5 reply. offerMade was set by Phase 4's advance
  // timer, so on mount we are already in the consent-waiting state. Just
  // sync the CTX so Opus's next turn (Kimi's "yes") sees the new phase.
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  const inStage5b = activeAssets.length > 0

  // Watchdog: once the offer is out AND Kimi has spoken her consent
  // (childWords landed), wait 6s for Sonnet's show_assets to fire. If it
  // never does, set the assets ourselves so the pitch does not hang on a
  // missed tool call.
  const childWords = useAppStore((s) => s.childWords)
  const setActiveAssets = useAppStore((s) => s.setActiveAssets)
  useEffect(() => {
    if (inStage5b) return
    if (!offerMade) return
    if (!childWords) return
    const t = setTimeout(() => {
      const cur = useAppStore.getState()
      if (cur.phase === 5 && cur.activeAssets.length === 0) {
        console.log('[phase 5 watchdog] forcing Stage 5b — show_assets was not called')
        setActiveAssets(
          ['iran_landscape_caspian_shore_02'],
          ['audio_sea_waves_01', 'audio_iran_music_traditional_01'],
        )
      }
    }, 6000)
    return () => clearTimeout(t)
  }, [inStage5b, offerMade, childWords, setActiveAssets])

  useEffect(() => {
    if (!inStage5b) return
    const hasAmbient = activeAudio.some((id) => AMBIENT_AUDIO_IDS.includes(id))
    if (hasAmbient) startAmbientAudio()
    return () => stopAmbientAudio()
  }, [inStage5b, activeAudio])

  // Stage 5a — silhouette with warm halo, gentle listening caption
  if (!inStage5b) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
        className="flex h-full w-full flex-col items-center justify-center gap-10 py-10"
      >
        <div className="relative h-[50vh] w-auto">
          <div
            aria-hidden="true"
            className="absolute inset-0 -m-20 rounded-full"
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

        {offerMade && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EDITORIAL_EASE }}
            className="text-2xl italic text-old-gold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Listening, {name}…
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Stage 5b — single hero photo, slow fade, vignette, italic caption
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: EDITORIAL_EASE }}
      className="relative h-full w-full overflow-hidden bg-ink"
    >
      <motion.img
        src={SEA_HERO}
        alt=""
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: EDITORIAL_EASE }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Top vignette for caption legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(15,12,10,0.55) 0%, rgba(15,12,10,0) 28%, rgba(15,12,10,0) 70%, rgba(15,12,10,0.55) 100%)',
        }}
      />

      {/* Italic gold caption — Aesop/Loro-Piana style editorial credit */}
      <motion.figcaption
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 1.2, ease: EDITORIAL_EASE }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
      >
        <span
          className="block text-xs uppercase tracking-[0.42em] text-paper/75"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          home
        </span>
        <span
          className="mt-3 block text-3xl italic text-old-gold"
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            letterSpacing: '-0.005em',
          }}
        >
          Iran
        </span>
      </motion.figcaption>
    </motion.div>
  )
}
