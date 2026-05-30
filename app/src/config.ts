/**
 * Runtime config knobs that the presenter / on-site operator wants to flip
 * without a code re-read. Keep this file tiny.
 */

/**
 * If true, the mic stays muted until the talk key is held. If false, the
 * ElevenLabs VAD decides turn-taking from an always-open mic (the original
 * pitch behavior before push-to-talk landed).
 *
 * Recommended ON for the installed-PWA pitch: room mics on a tablet pick up
 * audience noise that the VAD reads as speech and the puppet stutters.
 */
export const PUSH_TO_TALK_ENABLED = true

/**
 * KeyboardEvent.code that the presenter holds to open the mic. Default is
 * SPACE because every bluetooth presenter remote maps its main button to
 * Space. Change if the demo uses a different remote (e.g. 'PageDown' on the
 * Logitech R400 with the laser button, or 'ArrowRight' on a Kensington).
 */
export const PUSH_TO_TALK_KEY = 'Space'

/**
 * Human-readable label for the talk key, shown in the on-screen indicator
 * so the presenter knows which button arms the mic. Kept short so it fits
 * under the "Hold to speak" caption.
 */
export const PUSH_TO_TALK_LABEL = 'space'
