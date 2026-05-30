/**
 * Tracks which phase has already had its entry trigger delivered.
 *
 * Two callers can land on the same phase moments apart:
 *   1. Opus calls advance_phase → toolHandler sets the new phase in the store
 *      AND calls markTriggered(next), claiming "I (Opus) have already spoken
 *      the new phase's opening line in this same reply".
 *   2. The next phase's component mounts and calls triggerPhaseEntry to force
 *      a turn — but if shouldSkipTrigger reports true, the trigger is silently
 *      skipped so we do not double-prompt Opus and force him to repeat
 *      himself (the root cause of the "Eight years old — that's wonderful"
 *      doubling bug).
 *
 * Phase 2 → 3 is the one transition the app drives autonomously (after the
 * silhouette fill completes); for that one, Opus has NOT pre-spoken Phase 3's
 * opening line, so the trigger must fire. markTriggered is not called for
 * that path.
 */

let lastTriggeredPhase: number | null = null
// Separate from lastTriggeredPhase: tracks whether the CTX header has
// already been sent for the current phase mount. React.StrictMode mounts
// every component twice in dev, which doubles every effect — without
// this guard, sendContextualUpdate fires twice within ~50ms and the
// ElevenLabs DataChannel chokes (the SDK throws an undefined error_type
// crash and the entire session disconnects).
let lastCtxSyncedPhase: number | null = null

export function shouldSkipTrigger(phase: number): boolean {
  return lastTriggeredPhase === phase
}

export function markTriggered(phase: number) {
  lastTriggeredPhase = phase
}

export function hasCtxBeenSyncedFor(phase: number): boolean {
  return lastCtxSyncedPhase === phase
}

export function markCtxSynced(phase: number) {
  lastCtxSyncedPhase = phase
}

export function resetTriggerGuard() {
  lastTriggeredPhase = null
  lastCtxSyncedPhase = null
}
