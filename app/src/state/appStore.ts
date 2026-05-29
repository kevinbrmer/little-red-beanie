import { create } from 'zustand'

export type Phase = 1 | 2 | 3 | 4 | 5
export type FaceExpression = 'happy' | 'surprised' | 'scared' | 'sad'
export type ColoringPace = 'hesitant' | 'steady' | 'fast' | 'empty'

export interface AppState {
  // Phase
  phase: Phase

  // Phase 1 — Onboarding
  name: string | null
  age: number | null

  // Phase 2 — Coloring
  color: string | null            // hex, e.g. "#000000"
  colorHsl: string | null         // "hsl(0, 0%, 5%)"
  coverage: number                 // 0..1, 1.0 once tap-to-fill animation done
  pace: ColoringPace
  idleSecs: number

  // Phase 3 — Carousel
  faceNow: FaceExpression          // currently displayed expression
  secsOnFace: number
  tappedFace: FaceExpression | null

  // Phase 4 — Open question
  silenceSecs: number
  childWords: string
  toneMarkers: 'quiet' | 'tense' | 'crying' | 'none'
  reopened: boolean

  // Phase 5 — Comforting Mirror
  topic: string | null             // verbatim child-word/phrase from Phase 4
  offerMade: boolean
  activeAssets: string[]           // asset IDs from show_assets tool call
  activeAudio: string[]            // audio IDs from show_assets tool call

  // Cross-phase
  escalated: boolean
  sessionStarted: boolean

  // Actions
  setPhase: (phase: Phase) => void
  setName: (name: string) => void
  setAge: (age: number) => void
  pickColor: (hex: string, hsl: string) => void
  finishColoring: () => void
  cycleFace: (face: FaceExpression) => void
  tapFace: (face: FaceExpression) => void
  setChildWords: (words: string) => void
  setOfferMade: (made: boolean) => void
  setActiveAssets: (ids: string[], audioIds: string[]) => void
  escalate: () => void
  startSession: () => void
  reset: () => void
}

const initial = {
  phase: 1 as Phase,
  name: null,
  age: null,
  color: null,
  colorHsl: null,
  coverage: 0,
  pace: 'empty' as ColoringPace,
  idleSecs: 0,
  faceNow: 'happy' as FaceExpression,
  secsOnFace: 0,
  tappedFace: null,
  silenceSecs: 0,
  childWords: '',
  toneMarkers: 'none' as const,
  reopened: false,
  topic: null,
  offerMade: false,
  activeAssets: [],
  activeAudio: [],
  escalated: false,
  sessionStarted: false,
}

export const useAppStore = create<AppState>((set) => ({
  ...initial,

  setPhase: (phase) => set({ phase }),
  setName: (name) => set({ name }),
  setAge: (age) => set({ age }),
  pickColor: (hex, hsl) => set({ color: hex, colorHsl: hsl }),
  finishColoring: () => set({ coverage: 1.0, idleSecs: 5 }),
  cycleFace: (face) => set({ faceNow: face, secsOnFace: 0 }),
  tapFace: (face) => set({ tappedFace: face }),
  setChildWords: (words) => set({ childWords: words }),
  setOfferMade: (made) => set({ offerMade: made }),
  setActiveAssets: (ids, audioIds) => set({ activeAssets: ids, activeAudio: audioIds }),
  escalate: () => set({ escalated: true }),
  startSession: () => set({ sessionStarted: true }),
  reset: () => set(initial),
}))
