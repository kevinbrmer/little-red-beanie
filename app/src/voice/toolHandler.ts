import { useAppStore } from '../state/appStore'

interface AdvancePhaseInput {
  topic?: string
}

interface ShowAssetsInput {
  ids: string[]
  audio_ids?: string[]
}

interface MarkEscalationInput {
  reason: string
}

/**
 * Tool handlers wired to the Zustand store.
 * Returning a string makes ElevenLabs send it back as the tool result
 * (Opus rarely needs it but the SDK requires a response).
 */
export const toolHandlers = {
  advance_phase: async (input: AdvancePhaseInput): Promise<string> => {
    const s = useAppStore.getState()
    // Clamp to 5 so a mis-fire from Phase 5 cannot push phase=6 and crash
    // the React tree (phaseComponents[6] is undefined).
    const next = Math.min(5, s.phase + 1) as 1 | 2 | 3 | 4 | 5
    console.log(`[tool] advance_phase`, input, `→ phase ${next}`)
    // Reset childWords on every phase transition so STT from a prior phase
    // (e.g. Phase 1 age "eight") does not leak into the next phase's CTX
    // and trigger a stale advance_phase(topic=...) the moment it mounts.
    if (input.topic) {
      useAppStore.setState({ topic: input.topic, phase: next, childWords: '' })
    } else {
      useAppStore.setState({ phase: next, childWords: '' })
    }
    return 'ok'
  },

  show_assets: async (input: ShowAssetsInput): Promise<string> => {
    console.log(`[tool] show_assets`, input)
    useAppStore.getState().setActiveAssets(input.ids, input.audio_ids ?? [])
    return 'ok'
  },

  mark_escalation: async (input: MarkEscalationInput): Promise<string> => {
    console.warn(`[tool] mark_escalation`, input.reason)
    useAppStore.getState().escalate()
    return 'ok'
  },
}
