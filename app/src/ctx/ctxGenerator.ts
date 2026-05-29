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
      return (
        `[CTX phase=2 name=${s.name} age=${s.age} ` +
        `color=${s.colorHsl ?? 'null'} coverage=${s.coverage.toFixed(2)} ` +
        `pace=${s.pace} idle_secs=${s.idleSecs} ${escalated}]`
      )

    case 3:
      return (
        `[CTX phase=3 name=${s.name} age=${s.age} ` +
        `color=${s.colorHsl} face_now=${s.faceNow} secs_on_face=${s.secsOnFace} ` +
        `tapped_face=${s.tappedFace ?? 'null'} ${escalated}]`
      )

    case 4:
      return (
        `[CTX phase=4 name=${s.name} age=${s.age} ` +
        `color=${s.colorHsl} chosen_face=${s.tappedFace} ` +
        `silence_secs=${s.silenceSecs} child_words="${s.childWords}" ` +
        `tone_markers=${s.toneMarkers} reopened=${esc(s.reopened)} ${escalated}]`
      )

    case 5:
      return (
        `[CTX phase=5 name=${s.name} age=${s.age} ` +
        `color=${s.colorHsl} chosen_face=${s.tappedFace} ` +
        `topic=${s.topic ? `"${s.topic}"` : 'null'} ` +
        `offer_made=${esc(s.offerMade)} child_words="${s.childWords}" ` +
        `silence_secs=${s.silenceSecs} ${escalated}]`
      )
  }
}
