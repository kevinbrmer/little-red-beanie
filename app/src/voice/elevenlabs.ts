import { Conversation } from '@elevenlabs/client'
import { useAppStore } from '../state/appStore'
import { buildCtxHeader } from '../ctx/ctxGenerator'
import { toolHandlers } from './toolHandler'

/**
 * Lazy env-var resolution so a missing VITE_ELEVENLABS_AGENT_ID does not
 * crash the module load (and therefore the production build). The check
 * fires only when a voice session is actually requested.
 */
function requireAgentId(): string {
  const id = import.meta.env.VITE_ELEVENLABS_AGENT_ID
  if (!id) {
    throw new Error(
      'VITE_ELEVENLABS_AGENT_ID is not set. Copy app/.env.example to app/.env.local.',
    )
  }
  return id
}

let conversation: Awaited<ReturnType<typeof Conversation.startSession>> | null = null

// Tracks the phase we have already fired a phase-entry trigger for. Guards
// against React.StrictMode's intentional double-mount in development, which
// otherwise causes triggerPhaseEntry to send two user-message markers for
// the same phase and makes the puppet repeat its bridge line.
let lastTriggeredPhase: number | null = null

export async function startVoiceSession() {
  if (conversation) return conversation

  // Request mic permission with constraints tuned to suppress room noise:
  // - noiseSuppression: damp background hum / fan / typing
  // - echoCancellation: keep the puppet's own TTS out of the mic loop
  // - autoGainControl: OFF, otherwise quiet background lecture audio gets
  //   pumped up to "voice level" and the STT happily transcribes it.
  // - channelCount/sampleRate aligned to the agent's pcm_16000 mono input.
  await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
      channelCount: 1,
      sampleRate: 16000,
    },
  })

  conversation = await Conversation.startSession({
    agentId: requireAgentId(),
    clientTools: toolHandlers,
    onConnect: ({ conversationId }) => {
      console.log('[elevenlabs] connected', conversationId)
      useAppStore.getState().startSession()
      // Push-to-talk: start muted. The PushToTalk component flips this
      // on keydown(Space) / keyup(Space).
      try {
        conversation?.setMicMuted(true)
      } catch (err) {
        console.warn('[elevenlabs] setMicMuted(true) on connect failed', err)
      }
    },
    onDisconnect: (details) => {
      console.log('[elevenlabs] disconnected', details)
    },
    onError: (message, context) => {
      console.error('[elevenlabs] error', message, context)
    },
    onMessage: ({ source, message }) => {
      console.log(`[${source}]`, message)

      if (source !== 'user') return

      // FILTER 1 — our own phase-entry trigger.
      // triggerPhaseEntry() calls conversation.sendUserMessage("(phase N
      // entry)") to force a turn. ElevenLabs faithfully echoes that back
      // as a user_transcript event — and without this filter the fixed-
      // scenario logic below treats it as Kimi speaking, immediately
      // sets color=black / face=sad / etc., and the demo races itself.
      if (/^\s*\(phase \d+ entry\)\s*$/i.test(message)) {
        console.log('[user-ignored] phase-entry trigger echo')
        return
      }

      // FILTER 2 — empty / breath / um turns.
      // ElevenLabs emits a user_transcript on every detected turn end,
      // including half-second mic-opens with nothing said and stray
      // breath sounds. Strip trailing punctuation, require >=2 chars.
      const trimmed = message.trim().replace(/[.\s,…!?]+$/g, '')
      if (trimmed.length < 2) {
        console.log('[user-ignored] empty or too short:', JSON.stringify(message))
        return
      }

      const s = useAppStore.getState()
      useAppStore.getState().setChildWords(message)

      // App reads what Kimi actually said. Sonnet's Hard Rule #11 still
      // hard-codes the spoken replies (always "Kimi", "eight", "black",
      // "sad", "I miss my home in Iran", "yes") regardless of what the
      // CTX or transcript shows, so misreads in this layer are corrected
      // in the voice layer above.
      //
      // We only branch on what Kimi said in Phase 1 (name + age, needed
      // to gate the Phase 1 → 2 advance) and Phase 2 (color word, needed
      // to fill the silhouette in the right swatch). Phases 3-5 just
      // capture the transcript and let the per-phase useEffects in the
      // React components handle the timing.
      if (s.phase === 1) {
        if (!s.name) {
          // First word, stripped to letters. Hard Rule #11 ensures the
          // puppet replies "Nice to meet you, Kimi." regardless.
          const first = message.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '')
          if (first && first.length >= 2) {
            useAppStore.getState().setName(first)
          }
        } else if (!s.age) {
          const wordToNum: Record<string, number> = {
            six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
          }
          const num = message.match(/\b(\d{1,2})\b/)?.[1]
          if (num) {
            useAppStore.getState().setAge(parseInt(num))
          } else {
            const lower = message.toLowerCase()
            for (const [w, n] of Object.entries(wordToNum)) {
              if (lower.includes(w)) {
                useAppStore.getState().setAge(n)
                break
              }
            }
          }
        }
      } else if (s.phase === 2 && !s.color) {
        // Match against the 6-swatch palette + common synonyms. First hit
        // wins; the matched name is what shows in the CTX (`color=black`).
        const VOICE_COLORS: Array<[RegExp, string, string, string]> = [
          [/\b(black|ink|dark)\b/i,         '#1F1B16', 'hsl(30, 6%, 10%)',   'black' ],
          [/\b(red|crimson|scarlet)\b/i,    '#C7503A', 'hsl(9, 56%, 50%)',   'red'   ],
          [/\b(gold|yellow|amber|tan)\b/i,  '#B89668', 'hsl(33, 36%, 56%)',  'gold'  ],
          [/\b(green|olive|sage)\b/i,       '#6F8868', 'hsl(108, 13%, 47%)', 'green' ],
          [/\b(blue|navy|indigo)\b/i,       '#2C4A7A', 'hsl(214, 47%, 33%)', 'blue'  ],
          [/\b(plum|purple|violet)\b/i,     '#7A5A8C', 'hsl(280, 19%, 45%)', 'plum'  ],
        ]
        for (const [re, hex, hsl, name] of VOICE_COLORS) {
          if (re.test(message)) {
            useAppStore.getState().pickColor(hex, hsl, name)
            return
          }
        }
        console.log('[user-input] no color word matched in:', JSON.stringify(message))
      }
      // Phase 3: face is chosen by touch, not voice. The transcript above
      //   is still stored in childWords but does not advance the page.
      // Phase 4: childWords is what drives the auto-advance to Phase 5
      //   (see Phase4Question useEffect).
      // Phase 5: childWords is the consent. Sonnet's show_assets tool
      //   turns Stage 5a → 5b; Phase5Slideshow has a watchdog if it
      //   doesn't fire.
    },
  })

  return conversation
}

export async function stopVoiceSession() {
  if (!conversation) return
  await conversation.endSession()
  conversation = null
  lastTriggeredPhase = null
}

/**
 * Push-to-talk gate. Mic stays muted at rest; the PushToTalk component
 * unmutes only while Kimi holds the talk key.
 */
export function setMicMuted(muted: boolean) {
  if (!conversation) return
  try {
    conversation.setMicMuted(muted)
  } catch (err) {
    console.warn('[elevenlabs] setMicMuted failed', muted, err)
  }
}

/**
 * Send the current CTX header to the agent. Use this for in-phase
 * state updates (color picked, face tapped, child started speaking) —
 * it injects context but does NOT force the agent to take a turn.
 */
export function sendCtxUpdate() {
  if (!conversation) return
  const s = useAppStore.getState()
  const ctx = buildCtxHeader(s)
  console.log('[ctx →]', ctx)
  conversation.sendContextualUpdate(ctx)
}

/**
 * Force the agent to take a turn for the current phase's entry behavior.
 * sendContextualUpdate alone does NOT trigger a turn, so the puppet would
 * just stay silent after a phase advance unless the child happens to speak.
 * We sync the CTX, then send a tiny user-message marker that the system
 * prompt is told to interpret as "open this phase per the playbook" and
 * never to speak aloud.
 *
 * Call this from a phase component's mount useEffect.
 */
export function triggerPhaseEntry() {
  if (!conversation) return
  const s = useAppStore.getState()
  if (lastTriggeredPhase === s.phase) {
    // StrictMode double-mount, HMR remount, or a stray re-render — the
    // bridge has already been delivered for this phase. Skip silently so
    // the puppet does not repeat itself.
    console.log('[phase-entry skip]', `phase ${s.phase} already triggered`)
    return
  }
  lastTriggeredPhase = s.phase
  const ctx = buildCtxHeader(s)
  console.log('[phase-entry →]', `phase ${s.phase}`)
  conversation.sendContextualUpdate(ctx)
  conversation.sendUserMessage(`(phase ${s.phase} entry)`)
}
