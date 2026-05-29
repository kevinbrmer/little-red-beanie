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
        if (s.phase === 1) {
          // FIXED-SCENARIO RULE: For the pitch demo, Kimi (age 8) is the only
          // child the puppet ever meets. We treat any speech that arrives in
          // Phase 1 as confirmation of either step in the onboarding script —
          // never reading the spoken content. This frees the demo from STT
          // noise (background lectures, ambient audio) and keeps the puppet
          // saying "Kimi" / "eight" consistently.
          if (!s.name) {
            useAppStore.getState().setName('Kimi')
          } else if (!s.age) {
            useAppStore.getState().setAge(8)
          }
        } else if (s.phase === 2 && !s.color) {
          // Voice-pick of a clothing color: match the spoken word against
          // our 6-swatch palette + common synonyms. First hit wins.
          const VOICE_COLORS: Array<[RegExp, string, string]> = [
            [/\b(black|ink|dark)\b/i,         '#1F1B16', 'hsl(30, 6%, 10%)'],
            [/\b(red|crimson|scarlet)\b/i,    '#C7503A', 'hsl(9, 56%, 50%)'],
            [/\b(gold|yellow|amber|tan)\b/i,  '#B89668', 'hsl(33, 36%, 56%)'],
            [/\b(green|olive|sage)\b/i,       '#6F8868', 'hsl(108, 13%, 47%)'],
            [/\b(blue|navy|indigo)\b/i,       '#2C4A7A', 'hsl(214, 47%, 33%)'],
            [/\b(plum|purple|violet)\b/i,     '#7A5A8C', 'hsl(280, 19%, 45%)'],
          ]
          for (const [re, hex, hsl] of VOICE_COLORS) {
            if (re.test(message)) {
              useAppStore.getState().pickColor(hex, hsl)
              break
            }
          }
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
}

/**
 * Send the current CTX header to the agent. Call this when the app
 * advances phases or detects a salient UI event that Opus needs to know.
 */
export function sendCtxUpdate() {
  if (!conversation) return
  const s = useAppStore.getState()
  const ctx = buildCtxHeader(s)
  console.log('[ctx →]', ctx)
  conversation.sendContextualUpdate(ctx)
}
