import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate, triggerPhaseEntry } from '../voice/elevenlabs'
import { startAmbientAudio, stopAmbientAudio } from '../voice/audioFallback'
import KimiSilhouette from '../components/KimiSilhouette'

const STAGE_5A_OFFER_DELAY_MS = 5000
const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

const SEA_HERO = '/images/iran/sea_hero.jpg'
const AMBIENT_AUDIO_IDS = ['audio_sea_waves_01', 'audio_iran_music_traditional_01']

export default function Phase5Slideshow() {
  const name = useAppStore((s) => s.name)
  const color = useAppStore((s) => s.color)
  const tappedFace = useAppStore((s) => s.tappedFace)
  const activeAssets = useAppStore((s) => s.activeAssets)
  const activeAudio = useAppStore((s) => s.activeAudio)
  const offerMade = useAppStore((s) => s.offerMade)
  const setOfferMade = useAppStore((s) => s.setOfferMade)

  // Stage 5a → 5b transition: agent calls show_assets, activeAssets populates.
  useEffect(() => {
    triggerPhaseEntry()
    const t = setTimeout(() => {
      setOfferMade(true)
      sendCtxUpdate()
    }, STAGE_5A_OFFER_DELAY_MS)
    return () => clearTimeout(t)
  }, [setOfferMade])

  const inStage5b = activeAssets.length > 0

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
        <div className="relative h-[50vh] w-[34vh]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -m-20 rounded-full"
            style={{
              background:
                'radial-gradient(closest-side, rgba(184, 150, 104, 0.55), rgba(184, 150, 104, 0.15) 55%, rgba(184, 150, 104, 0) 80%)',
              filter: 'blur(12px)',
            }}
          />
          <div className="relative h-full w-full">
            <KimiSilhouette
              clothingColor={color}
              face={tappedFace ?? 'sad'}
              showFace={true}
            />
          </div>
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
      transition={{ duration: 1.4, ease: EDITORIAL_EASE }}
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
