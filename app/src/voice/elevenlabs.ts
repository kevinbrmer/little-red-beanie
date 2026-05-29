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

  // Request mic permission first so Chrome doesn't block on session start
  await navigator.mediaDevices.getUserMedia({ audio: true })

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
      // SDK message source is "user" | "ai"; capture only the child's words.
      if (source === 'user') {
        useAppStore.getState().setChildWords(message)
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
