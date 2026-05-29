/**
 * Each phase + state combination maps to a pre-rendered MP3.
 * The watchdog plays the MP3 if the live ElevenLabs audio doesn't arrive in time.
 *
 * Watchdog wiring is left to the phase components — they call watchdogPlay()
 * when they enter the phase, and call markLivePlayed() when ElevenLabs audio
 * arrives via the elevenlabs onMessage hook.
 */
const FALLBACK_AUDIO: Record<string, string> = {
  'phase1:greeting':           '/audio/greeting.mp3',
  'phase1:name_received':      '/audio/nice_to_meet.mp3',
  'phase1:age_received':       '/audio/eight_wonderful.mp3',
  'phase2:invite':             '/audio/color_question.mp3',
  'phase2:color_picked':       '/audio/now_color_yourself.mp3',
  'phase2:finished':           '/audio/great_job.mp3',
  'phase3:setup':              '/audio/carousel_setup.mp3',
  'phase3:tapped':             '/audio/you_picked_this.mp3',
  'phase4:question':           '/audio/talk_about_it.mp3',
  'phase5a:echo':              '/audio/iran_echo.mp3',
  'phase5a:offer':             '/audio/see_the_sea.mp3',
  'phase5b:validation':        '/audio/here_it_is.mp3',
}

const audioElements = new Map<string, HTMLAudioElement>()

function getAudio(src: string): HTMLAudioElement {
  let a = audioElements.get(src)
  if (!a) {
    a = new Audio(src)
    a.preload = 'auto'
    audioElements.set(src, a)
  }
  return a
}

/**
 * Wait up to `timeoutMs` for `markLivePlayed` to be called.
 * If it isn't, play the pre-rendered fallback.
 */
export function watchdogPlay(key: keyof typeof FALLBACK_AUDIO, timeoutMs = 2000) {
  let livePlayed = false

  const timer = setTimeout(() => {
    if (livePlayed) return
    const src = FALLBACK_AUDIO[key]
    if (!src) {
      console.warn(`[fallback] no audio mapped for key=${key}`)
      return
    }
    console.warn(`[fallback] playing pre-rendered ${src}`)
    getAudio(src).play().catch((e) => console.error('audio play failed', e))
  }, timeoutMs)

  return {
    markLivePlayed: () => {
      livePlayed = true
      clearTimeout(timer)
    },
  }
}

/**
 * Ambient audio for Phase 5b — sea waves + iranian music, both looping.
 */
let ambientSea: HTMLAudioElement | null = null
let ambientMusic: HTMLAudioElement | null = null

export function startAmbientAudio() {
  if (!ambientSea) {
    ambientSea = new Audio('/audio/sea_waves.mp3')
    ambientSea.loop = true
    ambientSea.volume = 0.6
  }
  if (!ambientMusic) {
    ambientMusic = new Audio('/audio/iran_music.mp3')
    ambientMusic.loop = true
    ambientMusic.volume = 0.4
  }

  // Quick fade-in
  ambientSea.volume = 0
  ambientMusic.volume = 0
  ambientSea.play().catch(() => {})
  ambientMusic.play().catch(() => {})

  const step = 0.05
  const target = { sea: 0.6, music: 0.4 }
  const interval = setInterval(() => {
    if (ambientSea && ambientSea.volume < target.sea) ambientSea.volume = Math.min(target.sea, ambientSea.volume + step)
    if (ambientMusic && ambientMusic.volume < target.music) ambientMusic.volume = Math.min(target.music, ambientMusic.volume + step)
    if (ambientSea && ambientMusic && ambientSea.volume >= target.sea && ambientMusic.volume >= target.music) {
      clearInterval(interval)
    }
  }, 50)
}

export function stopAmbientAudio() {
  if (ambientSea) { ambientSea.pause(); ambientSea.currentTime = 0 }
  if (ambientMusic) { ambientMusic.pause(); ambientMusic.currentTime = 0 }
}
