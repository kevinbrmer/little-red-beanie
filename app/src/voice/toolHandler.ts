import { useAppStore } from '../state/appStore'

interface ShowAssetsInput {
  ids: string[]
  audio_ids?: string[]
}

interface MarkEscalationInput {
  reason: string
}

/**
 * Tool handlers wired to the Zustand store.
 *
 * `advance_phase` was removed entirely: every phase transition is driven
 * by an app-side timer (see each phase component), so the tool was
 * vestigial. Worse, Opus emitted it instead of speaking the mirror line,
 * and a tool-call landing during STT finalisation reproduced the
 * "undefined error_type" DataChannel crash. With no tool to call, the
 * model's only move is to speak — which is what we want.
 */
export const toolHandlers = {
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
