import type { AppState } from '../state/appStore'

/**
 * Build the [CTX phase=... key=value ...] header line for the current turn.
 * Per-phase key set matches prompts/system-prompt-v1.md <context_format>.
 */
export function buildCtxHeader(s: AppState): string {
  const esc = (b: boolean) => (b ? 'true' : 'false')
  const escalated = `escalated=${esc(s.escalated)}`

  switch (s.phase) {
    case 1:
      return `[CTX phase=1 name=${s.name ?? 'null'} age=${s.age ?? 'null'} ${escalated}]`

    case 2:
      // Auto-fill flow — the puppet only needs the color word and the name.
      // Coverage / pace / idle_secs are app-internal and were being read aloud.
      return (
        `[CTX phase=2 name=${s.name} age=${s.age} ` +
        `color=${s.colorName ?? 'null'} filled=${esc(s.coverage >= 1)} ${escalated}]`
      )

    case 3:
      return (
        `[CTX phase=3 name=${s.name} age=${s.age} ` +
        `color=${s.colorName} face_now=${s.faceNow} ` +
        `tapped_face=${s.tappedFace ?? 'null'} ${escalated}]`
      )

    case 4:
      return (
        `[CTX phase=4 name=${s.name} age=${s.age} ` +
        `color=${s.colorName} chosen_face=${s.tappedFace} ` +
        `child_words="${s.childWords}" ` +
        `tone_markers=${s.toneMarkers} reopened=${esc(s.reopened)} ${escalated}]`
      )

    case 5:
      return (
        `[CTX phase=5 name=${s.name} age=${s.age} ` +
        `color=${s.colorName} chosen_face=${s.tappedFace} ` +
        `topic=${s.topic ? `"${s.topic}"` : 'null'} ` +
        `offer_made=${esc(s.offerMade)} child_words="${s.childWords}" ${escalated}]`
      )
  }
}
