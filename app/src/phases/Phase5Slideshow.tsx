import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import { startAmbientAudio, stopAmbientAudio } from '../voice/audioFallback'
import KimiSilhouette from '../components/KimiSilhouette'

const SLIDE_DURATION_MS = 4000
const STAGE_5A_OFFER_DELAY_MS = 5000
const EDITORIAL_EASE = [0.4, 0, 0.2, 1] as const

/**
 * Map Opus-returned asset IDs to actual file paths.
 * Opus picks IDs from <iran_assets> in the system prompt — for the pitch
 * we map the sea-themed IDs to our 5 sea JPGs in rotation.
 */
const ASSET_FILES: Record<string, string> = {
  iran_landscape_caspian_shore_02: '/images/iran/sea_01.jpg',
  iran_water_river_zayandeh_21:    '/images/iran/sea_02.jpg',
  iran_sky_stars_desert_20:        '/images/iran/sea_03.jpg',
  iran_landscape_alborz_snow_01:   '/images/iran/sea_04.jpg',
  iran_landscape_desert_sunset_03: '/images/iran/sea_05.jpg',
}

const FALLBACK_SEA = [
  '/images/iran/sea_01.jpg',
  '/images/iran/sea_02.jpg',
  '/images/iran/sea_03.jpg',
  '/images/iran/sea_04.jpg',
  '/images/iran/sea_05.jpg',
]

const AMBIENT_AUDIO_IDS = ['audio_sea_waves_01', 'audio_iran_music_traditional_01']

function resolveAssetSrc(id: string): string {
  return ASSET_FILES[id] ?? FALLBACK_SEA[0]
}

export default function Phase5Slideshow() {
  const name = useAppStore((s) => s.name)
  const color = useAppStore((s) => s.color)
  const tappedFace = useAppStore((s) => s.tappedFace)
  const activeAssets = useAppStore((s) => s.activeAssets)
  const activeAudio = useAppStore((s) => s.activeAudio)
  const offerMade = useAppStore((s) => s.offerMade)
  const setOfferMade = useAppStore((s) => s.setOfferMade)

  const [slideIdx, setSlideIdx] = useState(0)

  // Send initial CTX on mount → Opus sees Stage 5a (offerMade=false) and emits echo + offer.
  // After 5s, mark offerMade=true and refresh CTX so subsequent turns know the offer is out.
  useEffect(() => {
    sendCtxUpdate()
    const t = setTimeout(() => {
      setOfferMade(true)
      sendCtxUpdate()
    }, STAGE_5A_OFFER_DELAY_MS)
    return () => clearTimeout(t)
  }, [setOfferMade])

  // Stage 5b begins when Opus has called show_assets and activeAssets is populated
  const inStage5b = activeAssets.length > 0

  // Ambient audio: start when Stage 5b begins AND audio_ids include one of our ambient tracks
  useEffect(() => {
    if (!inStage5b) return
    const hasAmbient = activeAudio.some((id) => AMBIENT_AUDIO_IDS.includes(id))
    if (hasAmbient) startAmbientAudio()
    return () => stopAmbientAudio()
  }, [inStage5b, activeAudio])

  // Slideshow advance every 4s in Stage 5b
  useEffect(() => {
    if (!inStage5b) return
    const interval = setInterval(() => {
      setSlideIdx((i) => i + 1)
    }, SLIDE_DURATION_MS)
    return () => clearInterval(interval)
  }, [inStage5b])

  // Stage 5a: silhouette with soft halo + listening caption in old gold
  if (!inStage5b) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
        className="flex h-full w-full flex-col items-center justify-center gap-10 py-10"
      >
        <div className="relative h-[50vh] w-[34vh]">
          {/* Soft warm halo behind the silhouette */}
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
            transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
            className="text-2xl italic text-old-gold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Listening, {name}…
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Stage 5b: cream-bordered slideshow frame — feels like a printed album
  const sources =
    activeAssets.length > 0 ? activeAssets.map(resolveAssetSrc) : FALLBACK_SEA
  const src = sources[slideIdx % sources.length]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: EDITORIAL_EASE }}
      className="relative h-full w-full overflow-hidden bg-cream p-2"
    >
      <div className="relative h-full w-full overflow-hidden bg-ink shadow-[0_10px_30px_rgba(31,27,22,0.18)]">
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-0"
          style={{ animation: 'fadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
        />
        <style>{`
          @keyframes fadeIn {
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </motion.div>
  )
}
