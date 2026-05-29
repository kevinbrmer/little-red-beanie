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
      if (source === 'user') {
        const s = useAppStore.getState()
        useAppStore.getState().setChildWords(message)
        // FIXED-SCENARIO RULE (pitch-variante v1.0): every spoken turn from
        // Kimi is treated as confirmation of the next scripted step. The STT
        // content is logged for debugging but NEVER read or used to branch.
        // This is the only way to keep the demo stable against background
        // audio, mishearing, and accent.
        //
        //   Phase 1 (no name)  → name = "Kimi"
        //   Phase 1 (no age)   → age  = 8
        //   Phase 2 (no color) → color = black
        //   Phase 3 (no tap)   → face = sad
        //   Phase 4            → child_words = "I miss my home in Iran"
        //   Phase 5 stage 5a   → child_words = "yes", then auto-trigger 5b
        if (s.phase === 1) {
          if (!s.name) {
            useAppStore.getState().setName('Kimi')
          } else if (!s.age) {
            useAppStore.getState().setAge(8)
          }
        } else if (s.phase === 2 && !s.color) {
          useAppStore.getState().pickColor('#1F1B16', 'hsl(30, 6%, 10%)', 'black')
        } else if (s.phase === 3 && !s.tappedFace) {
          useAppStore.getState().tapFace('sad')
        } else if (s.phase === 4) {
          useAppStore.getState().setChildWords('I miss my home in Iran')
        } else if (s.phase === 5 && s.activeAssets.length === 0) {
          useAppStore.getState().setChildWords('yes')
          // Trigger Stage 5b after a beat so the puppet can speak her short
          // comfort line before the sea image lands.
          setTimeout(() => {
            const cur = useAppStore.getState()
            if (cur.phase === 5 && cur.activeAssets.length === 0) {
              cur.setActiveAssets(
                ['iran_landscape_caspian_shore_02'],
                ['audio_sea_waves_01', 'audio_iran_music_traditional_01'],
              )
            }
          }, 2500)
        }
      }
      console.log(`[${source}]`, message)
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
