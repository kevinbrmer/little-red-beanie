import { Conversation } from '@elevenlabs/client'
import { useAppStore } from '../state/appStore'
import { buildCtxHeader } from '../ctx/ctxGenerator'
import { toolHandlers } from './toolHandler'
import {
  shouldSkipTrigger,
  markTriggered,
  hasCtxBeenSyncedFor,
  markCtxSynced,
  resetTriggerGuard,
} from './phaseEntryGuard'

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

type Conv = Awaited<ReturnType<typeof Conversation.startSession>>
let conversation: Conv | null = null
// In-flight startSession promise. Prevents a second concurrent tap on
// "Tap to begin" from racing a second ElevenLabs session into existence
// before the first conversation handle has been assigned — which would
// otherwise produce the doubled / tripled greeting audio bug.
let startingPromise: Promise<Conv> | null = null
// Tracks whether the WebRTC room is currently usable. We do NOT rely on
// conversation alone — after a disconnect the handle still exists but
// calling setMicMuted on it spams the SDK's internal console.error
// ("Cannot set microphone muted: room not connected"). Flip this on
// onConnect, off onDisconnect.
let isConnected = false

export async function startVoiceSession() {
  if (conversation) return conversation
  if (startingPromise) return startingPromise

  startingPromise = doStartVoiceSession().finally(() => {
    startingPromise = null
  })
  return startingPromise
}

async function doStartVoiceSession() {
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
      isConnected = true
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
      isConnected = false
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
        // Pitch-Variante v1.0: name and age are fixed (Kimi, 8) — same as
        // Hard Rule #11 in the system prompt. Whatever STT actually
        // delivered is irrelevant; the first Phase-1 user turn means
        // "Kimi spoke her name", the second means "Kimi spoke her age".
        // The CTX values written here must agree with what Opus speaks,
        // so we hardcode them rather than parse STT.
        if (!s.name) {
          useAppStore.getState().setName('Kimi')
        } else if (!s.age) {
          useAppStore.getState().setAge(8)
        }
      } else if (s.phase === 2 && !s.color) {
        // Primary colour words only — no synonyms. "dark"/"ink"/"scarlet"
        // were false-firing on puppet TTS bleed; the exact primary names
        // are stable enough not to trigger from background context.
        const VOICE_COLORS: Array<[RegExp, string, string, string]> = [
          [/\bblack\b/i,  '#1F1B16', 'hsl(30, 6%, 10%)',   'black'  ],
          [/\bred\b/i,    '#C7503A', 'hsl(9, 56%, 50%)',   'red'    ],
          [/\byellow\b/i, '#E0B340', 'hsl(44, 73%, 57%)',  'yellow' ],
          [/\bgreen\b/i,  '#6F8868', 'hsl(108, 13%, 47%)', 'green'  ],
          [/\bblue\b/i,   '#2C4A7A', 'hsl(214, 47%, 33%)', 'blue'   ],
          [/\bpurple\b/i, '#7A5A8C', 'hsl(280, 19%, 45%)', 'purple' ],
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
  isConnected = false
  resetTriggerGuard()
}

/**
 * Push-to-talk gate. Mic stays muted at rest; the PushToTalk component
 * unmutes only while Kimi holds the talk key. Silently no-ops after a
 * disconnect so the SDK's internal "room not connected" console.error
 * does not spam the log every time PushToTalk fires a keyup.
 */
export function setMicMuted(muted: boolean) {
  if (!conversation || !isConnected) return
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

  if (shouldSkipTrigger(s.phase)) {
    // Opus called advance_phase himself. He already knows we're in the
    // new phase from the tool call he just made — no client CTX push is
    // needed. Sending sendContextualUpdate here races against the server
    // still processing the tool result and triggers the
    // "undefined error_type" DataChannel disconnect crash. Skip silently;
    // the next real user turn (Kimi's voice) will land a fresh CTX via
    // Phase2Coloring's color-useEffect → sendCtxUpdate.
    console.log('[phase-entry skip]', `phase ${s.phase} — opus-driven, no client push`)
    return
  }

  // App-driven transition (timer fallback or Phase 2 → 3 auto-advance).
  // Opus did NOT call advance_phase, so we must both sync CTX and force
  // a user turn so he speaks the phase opening line.
  if (!hasCtxBeenSyncedFor(s.phase)) {
    const ctx = buildCtxHeader(s)
    conversation.sendContextualUpdate(ctx)
    markCtxSynced(s.phase)
  }
  markTriggered(s.phase)
  console.log('[phase-entry →]', `phase ${s.phase}`)
  conversation.sendUserMessage(`(phase ${s.phase} entry)`)
}
