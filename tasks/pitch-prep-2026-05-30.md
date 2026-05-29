# Little Red Beanie — Pitch-Variante v1.0 App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Web-PWA that runs the scripted Kimi scene live on an Android tablet in Chrome fullscreen, in one focused workday before the 2026-05-30 pitch.

**Architecture:** Single-page React app with a phase state machine (5 phases). ElevenLabs Conversational AI handles voice (STT + VAD + TTS) with Anthropic Opus 4.7 as the LLM backend. Three client tools (`advance_phase`, `show_assets`, `mark_escalation`) bridge LLM decisions back into the app state. Pre-rendered audio files act as a silent failover when live latency exceeds 2 s. App is autark — no backstage operator.

**Tech Stack:** Vite + React 18 + TypeScript + Tailwind CSS v4, Zustand for state, `@elevenlabs/client` SDK for the voice layer, HTML5 `<audio>` for failover + ambient sound. Repo subfolder `app/` for the frontend code, separate from the existing `prompts/`/`evals/`/`output/` tracks.

**Foundational documents (read first):**
- `prompts/system-prompt-v1.md` — the Opus 4.7 prompt (already deployed to ElevenLabs)
- `input/pitch-story.md` — the EXACT scripted scene + Pitch-Variante notes
- `output/system-prompt-design.md` §0 — what's pitch-only vs. canonical
- `output/tech-stack.md` — latency budget + bottlenecks
- `output/elevenlabs-integration-checklist.md` — manual verification path
- `CLAUDE.md` — project conventions

**Repo conventions:** Working tree at `~/.claude/little-red-beanie/`. Project docs in German; everything in code, the prompt, UI strings, audio: English.

---

## Project layout after this plan

```
little-red-beanie/
├── CLAUDE.md
├── README.md
├── prompts/                        (existing)
├── input/                          (existing)
├── output/                         (existing)
├── evals/                          (existing)
├── tasks/
│   └── pitch-prep-2026-05-30.md    THIS file
└── app/                            NEW — the web app
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example                ELEVENLABS_AGENT_ID
    ├── .gitignore
    ├── public/
    │   ├── audio/
    │   │   ├── greeting.mp3                  pre-rendered, 8 voice lines
    │   │   ├── nice_to_meet.mp3
    │   │   ├── eight_wonderful.mp3
    │   │   ├── color_question.mp3
    │   │   ├── now_color_yourself.mp3
    │   │   ├── great_job.mp3
    │   │   ├── carousel_setup.mp3
    │   │   ├── you_picked_this.mp3
    │   │   ├── talk_about_it.mp3
    │   │   ├── iran_echo.mp3
    │   │   ├── see_the_sea.mp3
    │   │   ├── here_it_is.mp3
    │   │   ├── sea_waves.mp3                 ambient, looping
    │   │   └── iran_music.mp3                ambient, looping
    │   ├── images/
    │   │   ├── kimi-silhouette.svg           4-layer SVG: hair, skin, clothing, face-slot
    │   │   ├── faces/
    │   │   │   ├── happy.svg
    │   │   │   ├── surprised.svg
    │   │   │   ├── scared.svg
    │   │   │   └── sad.svg
    │   │   └── iran/
    │   │       ├── sea_01.jpg                Caspian shore, soft waves
    │   │       ├── sea_02.jpg                sea at dusk
    │   │       ├── sea_03.jpg                horizon at sunset
    │   │       ├── sea_04.jpg                gentle waves close up
    │   │       └── sea_05.jpg                wider seascape
    │   └── favicon.svg
    └── src/
        ├── main.tsx                          entry
        ├── App.tsx                           phase router
        ├── index.css                         Tailwind directives
        ├── state/
        │   └── appStore.ts                   Zustand store
        ├── ctx/
        │   └── ctxGenerator.ts               [CTX phase=...] builder
        ├── voice/
        │   ├── elevenlabs.ts                 Conv-AI session
        │   ├── toolHandler.ts                advance_phase / show_assets / mark_escalation
        │   └── audioFallback.ts              latency watchdog + MP3 player
        ├── phases/
        │   ├── Phase1Onboarding.tsx
        │   ├── Phase2Coloring.tsx
        │   ├── Phase3Carousel.tsx
        │   ├── Phase4Question.tsx
        │   └── Phase5Slideshow.tsx
        └── components/
            ├── KimiSilhouette.tsx            SVG renderer with prop-driven layers
            ├── ColorPalette.tsx
            └── EmergencyTouchZone.tsx        invisible bottom-edge fallback advance
```

---

## Task 1: Repo skeleton + Vite bootstrap

**Files:**
- Create: `app/package.json`, `app/vite.config.ts`, `app/tsconfig.json`, `app/tailwind.config.js`, `app/postcss.config.js`, `app/index.html`, `app/.env.example`, `app/.gitignore`, `app/src/main.tsx`, `app/src/App.tsx`, `app/src/index.css`

**Goal:** A bootable Vite + React + TS + Tailwind app that renders "Hello Kimi" in Chrome fullscreen on the Android tablet. Verifiable end-state.

- [ ] **Step 1: Create the `app/` directory and scaffold via Vite**

```bash
cd ~/.claude/little-red-beanie
npm create vite@latest app -- --template react-ts
cd app
npm install
```

Expected: Vite scaffolds a working React+TS app. Run `npm run dev` to confirm it launches at `http://localhost:5173`.

- [ ] **Step 2: Install runtime deps**

```bash
cd ~/.claude/little-red-beanie/app
npm install zustand @elevenlabs/client
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
```

- [ ] **Step 3: Configure Tailwind v4**

Create `app/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette from CLAUDE.md
        beanie: {
          blue: '#3b6dc9',      // Breton shirt
          white: '#f8fafc',
          red: '#dc2626',       // beanie + mouth
          green: '#16a34a',     // pants
          yellow: '#fbbf24',    // shoes + screen frame
        },
      },
    },
  },
  plugins: [],
}
```

Create `app/postcss.config.js`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

Replace `app/src/index.css` with:

```css
@import "tailwindcss";

html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  background-color: theme(colors.beanie.yellow);
}
```

- [ ] **Step 4: Wire `main.tsx` to import the CSS and bootstrap App**

Replace `app/src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 5: Hello-Kimi App.tsx**

Replace `app/src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-beanie-blue text-beanie-white">
      <h1 className="text-5xl font-bold">Hello, Kimi</h1>
    </div>
  )
}
```

- [ ] **Step 6: Create `.env.example` + `.gitignore`**

`app/.env.example`:

```
# Copy to .env.local and fill in.
VITE_ELEVENLABS_AGENT_ID=
```

`app/.gitignore`:

```
node_modules/
dist/
.env.local
.env
*.log
.DS_Store
```

- [ ] **Step 7: Verify in Chrome on tablet**

Local: `npm run dev -- --host 0.0.0.0`. On the Android tablet, open Chrome → `http://<your-mac-ip>:5173`. Expect "Hello, Kimi" on yellow background. Use Chrome → ⋮ → "Add to Home screen" → tap that icon → opens in full-screen.

- [ ] **Step 8: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/
git commit -m "Bootstrap app/ with Vite + React + TS + Tailwind"
```

---

## Task 2: ElevenLabs agent setup (manual, in web console)

**Files:** None in this repo. Configuration is in the ElevenLabs Conv-AI dashboard.

**Goal:** A working agent that responds with Opus 4.7 using your system prompt, with the three client tools registered.

This task is manual in the ElevenLabs web UI. Document the agent ID in `app/.env.local` once created.

- [ ] **Step 1: Open ElevenLabs Conv-AI dashboard**

Go to https://elevenlabs.io/app/conversational-ai and click "Create new agent".

- [ ] **Step 2: Pick a pre-built voice**

Voice library → choose one labeled warm/calm/young male English. Note the Voice ID. Spec is in `output/voice-design-prompt.md` (warm, slightly higher than adult, light puppet charm).

- [ ] **Step 3: Configure LLM = Anthropic Opus 4.7**

In the agent's "LLM" section: set provider = Anthropic, model = `claude-opus-4-7`. Paste your Anthropic API key.

- [ ] **Step 4: Paste system prompt**

Copy the entire contents of `~/.claude/little-red-beanie/prompts/system-prompt-v1.md` into the agent's "System Prompt" field.

- [ ] **Step 5: Register 3 client tools**

For each tool below, in the agent's "Tools" → "Add tool" → type = "Client Tool":

**`advance_phase`**
- Description: "Propose moving to the next phase. The app decides whether to execute."
- Parameters:
  - `topic` (string, optional): "Verbatim child-word for Phase 4 → 5, or null."

**`show_assets`**
- Description: "Show 3-5 images on the puppet's screen with optional ambient audio."
- Parameters:
  - `ids` (array of strings, required): "Asset IDs from `<iran_assets>`."
  - `audio_ids` (array of strings, optional): "1-2 audio IDs from `<audio_assets>`."

**`mark_escalation`**
- Description: "Trigger Co-Regulation Mode."
- Parameters:
  - `reason` (string, required): "Short English phrase describing the trigger."

- [ ] **Step 6: Save agent, copy Agent ID**

Save. Copy the Agent ID from the URL or settings panel. Paste it into `app/.env.local`:

```
VITE_ELEVENLABS_AGENT_ID=<the-id-you-just-got>
```

- [ ] **Step 7: Test in the dashboard "Test" panel**

Type: "Hi" → expect a greeting that asks for the name. No tool call yet (Phase 1 just opened). Confirm system prompt is loaded properly.

- [ ] **Step 8: No commit needed** (the agent lives in ElevenLabs, not in your repo).

---

## Task 3: Pre-render 12 voice lines + grab ambient audio

**Files:**
- Create: `app/public/audio/greeting.mp3` … `here_it_is.mp3` (12 files), `app/public/audio/sea_waves.mp3`, `app/public/audio/iran_music.mp3`

**Goal:** All audio that the failover and Phase 5b need, bundled in `public/audio/`. The 12 voice lines are the puppet's full English script with Kimi's name baked in (failover only — primary path uses live ElevenLabs TTS).

- [ ] **Step 1: Open ElevenLabs Speech Synthesis with the voice from Task 2**

Same dashboard, "Speech Synthesis" tab. Voice = the one chosen for the agent.

- [ ] **Step 2: Render the 12 voice lines, save as MP3s**

Render each of these lines exactly. Save with the filename in parentheses.

```
"Hi there. I'm Little Red Beanie. What's your name?"                       (greeting.mp3)
"Nice to meet you, Kimi."                                                  (nice_to_meet.mp3)
"Eight years old — that's wonderful, Kimi."                                (eight_wonderful.mp3)
"Which color feels right for you today, Kimi?"                             (color_question.mp3)
"Now color yourself in, Kimi."                                             (now_color_yourself.mp3)
"You did such a great job, Kimi."                                          (great_job.mp3)
"Tap when you see the face that feels like you, Kimi."                     (carousel_setup.mp3)
"You picked this one, Kimi."                                               (you_picked_this.mp3)
"Do you want to talk about it, Kimi?"                                      (talk_about_it.mp3)
"Iran…"                                                                    (iran_echo.mp3)
"Would you like to see the sea, Kimi?"                                     (see_the_sea.mp3)
"Here it is, Kimi. I'm here with you."                                     (here_it_is.mp3)
```

Place all 12 in `app/public/audio/`.

- [ ] **Step 3: Grab ambient sea waves**

Pixabay Music → search "ocean waves calm loop" → download a 30-60 s CC0 track → rename to `sea_waves.mp3` → place in `app/public/audio/`. Verify it loops seamlessly (open in QuickTime, listen to the start/end transition).

- [ ] **Step 4: Grab traditional Iranian instrumental**

Pixabay Music → search "persian santur" or "iranian instrumental" → download CC0 30-60 s → rename to `iran_music.mp3` → place in `app/public/audio/`. Same loop check.

- [ ] **Step 5: Verify in browser**

```bash
cd app
npm run dev
```

Open http://localhost:5173/audio/greeting.mp3 → expect MP3 to play. Repeat for one or two others to sanity-check the paths.

- [ ] **Step 6: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/public/audio/
git commit -m "Add pre-rendered voice lines + ambient audio for Phase 5"
```

---

## Task 4: Iran sea images + Kimi silhouette SVG

**Files:**
- Create: `app/public/images/iran/sea_01.jpg` … `sea_05.jpg`
- Create: `app/public/images/kimi-silhouette.svg`
- Create: `app/public/images/faces/happy.svg`, `surprised.svg`, `scared.svg`, `sad.svg`

**Goal:** All visual assets for Phase 2, 3, 5 ready on disk.

- [ ] **Step 1: Grab 5 sea images from Unsplash + Pexels**

Search "caspian sea iran", "calm sea sunset", "ocean horizon", "gentle waves". 5 CC0 landscape photos that fit "Caspian shore, dusk, soft, calm". Rename `sea_01.jpg` … `sea_05.jpg`. Place in `app/public/images/iran/`.

Each image ~1200 × 800 px max (keep file size < 500 KB for fast load).

- [ ] **Step 2: Create `kimi-silhouette.svg`**

Use Inkscape or Boxy SVG or just type by hand. Required structure: a 400×600 SVG with four named groups so we can target each layer from React.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
  <!-- hair: always dark, behind everything -->
  <g id="hair">
    <path d="M 130 120 Q 110 80 200 70 Q 290 80 270 120 Q 280 100 280 150 L 270 180 Q 200 160 130 180 L 120 150 Q 120 100 130 120 Z" fill="#1a1a1a"/>
  </g>

  <!-- skin: face + hands -->
  <g id="skin">
    <!-- face oval -->
    <ellipse cx="200" cy="170" rx="60" ry="70" fill="#e8b896"/>
    <!-- neck -->
    <rect x="180" y="225" width="40" height="30" fill="#e8b896"/>
    <!-- hands sticking out at bottom of sleeves -->
    <circle cx="120" cy="380" r="18" fill="#e8b896"/>
    <circle cx="280" cy="380" r="18" fill="#e8b896"/>
  </g>

  <!-- clothing: this is what gets colored -->
  <g id="clothing">
    <!-- dress: covers torso + skirt -->
    <path d="M 145 240 L 255 240 L 290 380 L 320 560 L 80 560 L 110 380 Z" fill="#ffffff" stroke="#1a1a1a" stroke-width="3"/>
    <!-- sleeves -->
    <path d="M 145 245 L 105 380 L 135 380 L 165 250 Z" fill="#ffffff" stroke="#1a1a1a" stroke-width="3"/>
    <path d="M 255 245 L 295 380 L 265 380 L 235 250 Z" fill="#ffffff" stroke="#1a1a1a" stroke-width="3"/>
  </g>

  <!-- face slot: replaced by <use href> from React -->
  <g id="face-slot">
    <use href="#face-neutral" x="155" y="135"/>
  </g>

  <!-- expression definitions, hidden by default -->
  <defs>
    <g id="face-neutral">
      <circle cx="20" cy="20" r="4" fill="#1a1a1a"/>
      <circle cx="70" cy="20" r="4" fill="#1a1a1a"/>
      <path d="M 25 60 Q 45 65 65 60" stroke="#1a1a1a" stroke-width="3" fill="none"/>
    </g>
  </defs>
</svg>
```

This is intentionally simple. You can replace with a polished version later.

- [ ] **Step 3: Create 4 face SVGs**

These get swapped into the `face-slot` of the silhouette. Each is 90×90 viewbox, transparent background, eyes + mouth only.

`app/public/images/faces/happy.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90">
  <circle cx="20" cy="25" r="5" fill="#1a1a1a"/>
  <circle cx="70" cy="25" r="5" fill="#1a1a1a"/>
  <path d="M 20 55 Q 45 75 70 55" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`app/public/images/faces/surprised.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90">
  <circle cx="20" cy="25" r="6" fill="#1a1a1a"/>
  <circle cx="70" cy="25" r="6" fill="#1a1a1a"/>
  <ellipse cx="45" cy="62" rx="8" ry="12" fill="#1a1a1a"/>
</svg>
```

`app/public/images/faces/scared.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90">
  <ellipse cx="20" cy="28" rx="6" ry="8" fill="#1a1a1a"/>
  <ellipse cx="70" cy="28" rx="6" ry="8" fill="#1a1a1a"/>
  <path d="M 25 65 Q 45 50 65 65" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`app/public/images/faces/sad.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90">
  <circle cx="20" cy="25" r="5" fill="#1a1a1a"/>
  <circle cx="70" cy="25" r="5" fill="#1a1a1a"/>
  <path d="M 20 65 Q 45 50 70 65" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- tear drop on cheek -->
  <path d="M 25 38 Q 22 50 28 50 Q 30 50 28 42 Z" fill="#5a8fc4"/>
</svg>
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:5173/images/kimi-silhouette.svg`, then `http://localhost:5173/images/faces/sad.svg`. Both render.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/public/images/
git commit -m "Add Kimi silhouette + 4 face expressions + 5 sea images"
```

---

## Task 5: App state store (Zustand)

**Files:**
- Create: `app/src/state/appStore.ts`

**Goal:** A single Zustand store that holds every piece of state the phases and CTX generator need. All mutations go through actions on the store.

- [ ] **Step 1: Write `appStore.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/state/appStore.ts
git commit -m "Add Zustand app state store"
```

---

## Task 6: CTX generator (App → Opus per-turn header)

**Files:**
- Create: `app/src/ctx/ctxGenerator.ts`

**Goal:** A pure function that builds the `[CTX phase=... ...]` line per phase, matching the table in the system prompt.

- [ ] **Step 1: Write `ctxGenerator.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/ctx/ctxGenerator.ts
git commit -m "Add per-turn CTX header generator"
```

---

## Task 7: ElevenLabs voice client + tool handler

**Files:**
- Create: `app/src/voice/elevenlabs.ts`
- Create: `app/src/voice/toolHandler.ts`

**Goal:** A small wrapper around `@elevenlabs/client` that starts/stops the Conv-AI session, injects the CTX header into every user turn, and routes the three client-tools into the Zustand store.

- [ ] **Step 1: Write `toolHandler.ts`**

```ts
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
    const next = (s.phase + 1) as 1 | 2 | 3 | 4 | 5
    console.log(`[tool] advance_phase`, input, `→ phase ${next}`)
    if (input.topic) {
      useAppStore.setState({ topic: input.topic, phase: next })
    } else {
      useAppStore.setState({ phase: next })
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
```

- [ ] **Step 2: Write `elevenlabs.ts`**

```ts
import { Conversation } from '@elevenlabs/client'
import { useAppStore } from '../state/appStore'
import { buildCtxHeader } from '../ctx/ctxGenerator'
import { toolHandlers } from './toolHandler'

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID
if (!AGENT_ID) {
  throw new Error('VITE_ELEVENLABS_AGENT_ID is not set. Copy app/.env.example to app/.env.local.')
}

let conversation: Awaited<ReturnType<typeof Conversation.startSession>> | null = null

export async function startVoiceSession() {
  if (conversation) return conversation

  // Request mic permission first so Chrome doesn't block on session start
  await navigator.mediaDevices.getUserMedia({ audio: true })

  conversation = await Conversation.startSession({
    agentId: AGENT_ID,
    clientTools: toolHandlers,
    onConnect: () => {
      console.log('[elevenlabs] connected')
      useAppStore.getState().startSession()
    },
    onDisconnect: () => {
      console.log('[elevenlabs] disconnected')
    },
    onError: (err) => {
      console.error('[elevenlabs] error', err)
    },
    onMessage: ({ source, message }) => {
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
```

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/voice/
git commit -m "Add ElevenLabs voice client + tool handler wiring"
```

---

## Task 8: Audio fallback (latency watchdog + pre-rendered MP3 player)

**Files:**
- Create: `app/src/voice/audioFallback.ts`

**Goal:** If ElevenLabs takes longer than 2 s to deliver audio for a phase transition, the app plays the matching pre-rendered MP3 from `public/audio/`. Silent fallback — looks identical from the stage.

- [ ] **Step 1: Write `audioFallback.ts`**

```ts
/**
 * Each phase + state combination maps to a pre-rendered MP3.
 * The watchdog plays the MP3 if the live ElevenLabs audio doesn't arrive in 2s.
 */
const FALLBACK_AUDIO: Record<string, string> = {
  'phase1:greeting':           '/audio/greeting.mp3',
  'phase1:name_received':      '/audio/nice_to_meet.mp3',
  'phase1:age_received':       '/audio/eight_wonderful.mp3',
  'phase2:invite':             '/audio/color_question.mp3',
  'phase2:color_picked':       '/audio/now_color_yourself.mp3',
  'phase2:finished':           '/audio/great_job.mp3',
  'phase3:setup':              '/audio/carousel_setup.mp3',
  'phase3:tapped':             '/audio/you_picked_this.mp3',
  'phase4:question':           '/audio/talk_about_it.mp3',
  'phase5a:echo':              '/audio/iran_echo.mp3',
  'phase5a:offer':             '/audio/see_the_sea.mp3',
  'phase5b:validation':        '/audio/here_it_is.mp3',
}

const audioElements = new Map<string, HTMLAudioElement>()

function getAudio(src: string): HTMLAudioElement {
  let a = audioElements.get(src)
  if (!a) {
    a = new Audio(src)
    a.preload = 'auto'
    audioElements.set(src, a)
  }
  return a
}

/**
 * Wait up to `timeoutMs` for `liveAudioStarted` to fire.
 * If it doesn't, play the pre-rendered fallback.
 */
export function watchdogPlay(key: keyof typeof FALLBACK_AUDIO, timeoutMs = 2000) {
  let livePlayed = false

  // The ElevenLabs SDK has no direct "audio is playing" callback, so we use
  // a timer. If we get a live audio chunk before timeout, cancel the timer.
  const timer = setTimeout(() => {
    if (livePlayed) return
    const src = FALLBACK_AUDIO[key]
    if (!src) {
      console.warn(`[fallback] no audio mapped for key=${key}`)
      return
    }
    console.warn(`[fallback] playing pre-rendered ${src}`)
    getAudio(src).play().catch((e) => console.error('audio play failed', e))
  }, timeoutMs)

  return {
    markLivePlayed: () => {
      livePlayed = true
      clearTimeout(timer)
    },
  }
}

/**
 * Ambient audio for Phase 5b — sea waves + iranian music, both looping.
 */
let ambientSea: HTMLAudioElement | null = null
let ambientMusic: HTMLAudioElement | null = null

export function startAmbientAudio() {
  if (!ambientSea) {
    ambientSea = new Audio('/audio/sea_waves.mp3')
    ambientSea.loop = true
    ambientSea.volume = 0.6
  }
  if (!ambientMusic) {
    ambientMusic = new Audio('/audio/iran_music.mp3')
    ambientMusic.loop = true
    ambientMusic.volume = 0.4
  }

  // Quick fade-in
  ambientSea.volume = 0
  ambientMusic.volume = 0
  ambientSea.play().catch(() => {})
  ambientMusic.play().catch(() => {})

  const step = 0.05
  const target = { sea: 0.6, music: 0.4 }
  const interval = setInterval(() => {
    if (ambientSea && ambientSea.volume < target.sea) ambientSea.volume = Math.min(target.sea, ambientSea.volume + step)
    if (ambientMusic && ambientMusic.volume < target.music) ambientMusic.volume = Math.min(target.music, ambientMusic.volume + step)
    if (ambientSea && ambientMusic && ambientSea.volume >= target.sea && ambientMusic.volume >= target.music) {
      clearInterval(interval)
    }
  }, 50)
}

export function stopAmbientAudio() {
  if (ambientSea) { ambientSea.pause(); ambientSea.currentTime = 0 }
  if (ambientMusic) { ambientMusic.pause(); ambientMusic.currentTime = 0 }
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/voice/audioFallback.ts
git commit -m "Add audio fallback: latency watchdog + ambient player"
```

---

## Task 9: Phase router in App.tsx + power-on screen

**Files:**
- Modify: `app/src/App.tsx`

**Goal:** App.tsx becomes the phase router. Before `sessionStarted`, show a "tap to begin" power-on screen (this is the social worker's button in the story). After tap, start the ElevenLabs session and render the current phase component.

- [ ] **Step 1: Stub the 5 phase components first so imports resolve**

Create five files, each with a placeholder:

`app/src/phases/Phase1Onboarding.tsx`:

```tsx
export default function Phase1Onboarding() {
  return <div className="text-3xl">Phase 1 (Onboarding)</div>
}
```

Repeat the same skeleton for `Phase2Coloring.tsx`, `Phase3Carousel.tsx`, `Phase4Question.tsx`, `Phase5Slideshow.tsx`. Each just renders the phase name. You'll fill them in Tasks 10–14.

- [ ] **Step 2: Replace `App.tsx` with phase router + power-on**

```tsx
import { useAppStore } from './state/appStore'
import { startVoiceSession } from './voice/elevenlabs'
import Phase1Onboarding from './phases/Phase1Onboarding'
import Phase2Coloring from './phases/Phase2Coloring'
import Phase3Carousel from './phases/Phase3Carousel'
import Phase4Question from './phases/Phase4Question'
import Phase5Slideshow from './phases/Phase5Slideshow'
import EmergencyTouchZone from './components/EmergencyTouchZone'

const phaseComponents = {
  1: Phase1Onboarding,
  2: Phase2Coloring,
  3: Phase3Carousel,
  4: Phase4Question,
  5: Phase5Slideshow,
} as const

export default function App() {
  const phase = useAppStore((s) => s.phase)
  const sessionStarted = useAppStore((s) => s.sessionStarted)
  const escalated = useAppStore((s) => s.escalated)

  const PhaseComponent = phaseComponents[phase]

  if (!sessionStarted) {
    return (
      <button
        onClick={() => startVoiceSession()}
        className="flex h-screen w-screen items-center justify-center bg-beanie-red text-beanie-white"
      >
        <span className="text-5xl font-bold">Tap to begin</span>
      </button>
    )
  }

  return (
    <div className={`relative flex h-screen w-screen flex-col items-center justify-center ${escalated ? 'bg-beanie-blue/50' : 'bg-beanie-yellow'}`}>
      <PhaseComponent />
      <EmergencyTouchZone />
    </div>
  )
}
```

- [ ] **Step 3: Stub `EmergencyTouchZone.tsx`** (full impl in Task 16)

```tsx
export default function EmergencyTouchZone() {
  return null
}
```

- [ ] **Step 4: Verify in browser**

```bash
cd app
npm run dev
```

Open → see red "Tap to begin" screen → tap → it transitions to the yellow Phase 1 placeholder. Chrome may prompt for mic permission — allow. Open DevTools console → expect `[elevenlabs] connected` log.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/
git commit -m "Add phase router + power-on screen + phase component stubs"
```

---

## Task 10: Phase 1 — Onboarding

**Files:**
- Modify: `app/src/phases/Phase1Onboarding.tsx`

**Goal:** Show "Hi, I'm Little Red Beanie" decorative panel. ElevenLabs handles voice. STT result populates `name` and `age` via Opus' `advance_phase` call. Also add manual touch-fallback inputs for name/age in case STT fails.

- [ ] **Step 1: Replace Phase1Onboarding.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'

export default function Phase1Onboarding() {
  const { name, age, setName, setAge, setPhase } = useAppStore()
  const [touchName, setTouchName] = useState('')
  const [touchAge, setTouchAge] = useState('')

  // Send initial CTX on mount so Opus knows phase=1, name=null, age=null
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // When both name and age known, advance (in case Opus didn't via tool)
  useEffect(() => {
    if (name && age) {
      setTimeout(() => setPhase(2), 1500)
    }
  }, [name, age, setPhase])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-12">
      <h1 className="text-6xl font-bold text-beanie-blue">Hi, I'm Little Red Beanie</h1>

      {!name && (
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl text-beanie-blue">Or type your name:</label>
          <input
            type="text"
            value={touchName}
            onChange={(e) => setTouchName(e.target.value)}
            onBlur={() => touchName && setName(touchName)}
            className="rounded-xl border-4 border-beanie-blue px-6 py-4 text-3xl"
            placeholder="Kimi"
          />
        </div>
      )}

      {name && !age && (
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl text-beanie-blue">Or tap your age:</label>
          <div className="flex gap-3">
            {[6, 7, 8, 9, 10, 11, 12].map((a) => (
              <button
                key={a}
                onClick={() => setAge(a)}
                className="rounded-xl border-4 border-beanie-blue px-6 py-4 text-3xl font-bold"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {name && <div className="text-2xl text-beanie-blue">Hello, {name}.</div>}
    </div>
  )
}
```

- [ ] **Step 2: Wire STT name/age capture (loose)**

Open `app/src/voice/elevenlabs.ts` and update the `onMessage` handler — extract the first name + first number from user turns when `phase=1`:

```ts
// In startVoiceSession, replace onMessage block with:
onMessage: ({ source, message }) => {
  if (source === 'user') {
    const s = useAppStore.getState()
    useAppStore.getState().setChildWords(message)
    if (s.phase === 1) {
      if (!s.name) {
        // crude: take the first word, strip punctuation
        const first = message.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '')
        if (first && first.length >= 2) useAppStore.getState().setName(first)
      } else if (!s.age) {
        const wordToNum: Record<string, number> = {
          six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
        }
        const num = message.match(/\b(\d{1,2})\b/)?.[1]
        if (num) useAppStore.getState().setAge(parseInt(num))
        else {
          const lower = message.toLowerCase()
          for (const [w, n] of Object.entries(wordToNum)) {
            if (lower.includes(w)) { useAppStore.getState().setAge(n); break }
          }
        }
      }
    }
  }
  console.log(`[${source}]`, message)
},
```

- [ ] **Step 3: Verify in browser**

Tap "Tap to begin" → puppet greets → say "Kimi" → name renders → say "Eight" → age renders → after 1.5s auto-advances to Phase 2 placeholder.

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/
git commit -m "Add Phase 1 Onboarding with STT name/age capture + touch fallback"
```

---

## Task 11: Phase 2 — Self-Coloring (Tap-to-Fill)

**Files:**
- Create: `app/src/components/KimiSilhouette.tsx`
- Create: `app/src/components/ColorPalette.tsx`
- Modify: `app/src/phases/Phase2Coloring.tsx`

**Goal:** Render the silhouette (Task 4) with a name banner. Show 6 color swatches at the edge. Tap a swatch → swatch becomes the active color. Tap on the silhouette → `clothing` layer fills with that color via CSS transition. After fill, auto-advance to Phase 3.

- [ ] **Step 1: Write `KimiSilhouette.tsx`**

```tsx
import type { FaceExpression } from '../state/appStore'

interface Props {
  clothingColor: string | null  // hex
  face: FaceExpression
  showFace: boolean             // false in Phase 2, true from Phase 3 on
}

const FACE_HREF: Record<FaceExpression, string> = {
  happy: '/images/faces/happy.svg',
  surprised: '/images/faces/surprised.svg',
  scared: '/images/faces/scared.svg',
  sad: '/images/faces/sad.svg',
}

export default function KimiSilhouette({ clothingColor, face, showFace }: Props) {
  return (
    <svg viewBox="0 0 400 600" className="h-full w-full">
      {/* Hair */}
      <path
        d="M 130 120 Q 110 80 200 70 Q 290 80 270 120 Q 280 100 280 150 L 270 180 Q 200 160 130 180 L 120 150 Q 120 100 130 120 Z"
        fill="#1a1a1a"
      />
      {/* Skin */}
      <ellipse cx="200" cy="170" rx="60" ry="70" fill="#e8b896" />
      <rect x="180" y="225" width="40" height="30" fill="#e8b896" />
      <circle cx="120" cy="380" r="18" fill="#e8b896" />
      <circle cx="280" cy="380" r="18" fill="#e8b896" />
      {/* Clothing — colored via prop, animated transition */}
      <g style={{ transition: 'fill 1s ease-in-out' }}>
        <path
          d="M 145 240 L 255 240 L 290 380 L 320 560 L 80 560 L 110 380 Z"
          fill={clothingColor ?? '#ffffff'}
          stroke="#1a1a1a"
          strokeWidth="3"
          style={{ transition: 'fill 1s ease-in-out' }}
        />
        <path
          d="M 145 245 L 105 380 L 135 380 L 165 250 Z"
          fill={clothingColor ?? '#ffffff'}
          stroke="#1a1a1a"
          strokeWidth="3"
          style={{ transition: 'fill 1s ease-in-out' }}
        />
        <path
          d="M 255 245 L 295 380 L 265 380 L 235 250 Z"
          fill={clothingColor ?? '#ffffff'}
          stroke="#1a1a1a"
          strokeWidth="3"
          style={{ transition: 'fill 1s ease-in-out' }}
        />
      </g>
      {/* Face slot */}
      {showFace && (
        <image
          href={FACE_HREF[face]}
          x="155"
          y="135"
          width="90"
          height="90"
        />
      )}
    </svg>
  )
}
```

- [ ] **Step 2: Write `ColorPalette.tsx`**

```tsx
interface Props {
  onPick: (hex: string, hsl: string) => void
}

const COLORS: { hex: string; hsl: string; label: string }[] = [
  { hex: '#000000', hsl: 'hsl(0, 0%, 0%)',  label: 'Black' },
  { hex: '#dc2626', hsl: 'hsl(0, 84%, 51%)', label: 'Red' },
  { hex: '#fbbf24', hsl: 'hsl(43, 96%, 56%)', label: 'Yellow' },
  { hex: '#16a34a', hsl: 'hsl(142, 76%, 36%)', label: 'Green' },
  { hex: '#3b6dc9', hsl: 'hsl(217, 56%, 51%)', label: 'Blue' },
  { hex: '#a855f7', hsl: 'hsl(271, 91%, 65%)', label: 'Purple' },
]

export default function ColorPalette({ onPick }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {COLORS.map((c) => (
        <button
          key={c.hex}
          onClick={() => onPick(c.hex, c.hsl)}
          className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
          style={{ backgroundColor: c.hex }}
          aria-label={c.label}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Replace Phase2Coloring.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'
import ColorPalette from '../components/ColorPalette'

export default function Phase2Coloring() {
  const { name, color, pickColor, finishColoring, setPhase } = useAppStore()
  const [filled, setFilled] = useState(false)

  // On mount: tell Opus we're in Phase 2 with no color yet
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // When color picked, send CTX update so Opus says the confirmation line
  useEffect(() => {
    if (color) sendCtxUpdate()
  }, [color])

  const handleSilhouetteTap = () => {
    if (!color || filled) return
    setFilled(true)
    finishColoring()
    // CSS transition takes 1s; advance after 2.5s so puppet can say "great job"
    setTimeout(() => {
      setPhase(3)
      sendCtxUpdate()
    }, 2500)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-around py-8">
      <div className="text-5xl font-bold text-beanie-blue">{name}</div>

      <button
        onClick={handleSilhouetteTap}
        className="h-[60vh] w-[40vh] focus:outline-none"
        disabled={!color || filled}
        aria-label="Tap to color in"
      >
        <KimiSilhouette
          clothingColor={filled ? color : null}
          face="happy"
          showFace={false}
        />
      </button>

      {!filled && <ColorPalette onPick={pickColor} />}
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Tap to begin → step through Phase 1 → Phase 2 should show silhouette + palette + Kimi's name. Tap a color → swatch state stored. Tap silhouette → clothing transitions to that color over 1s → 2.5s later auto-advances to Phase 3 placeholder.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/
git commit -m "Add Phase 2 Self-Coloring with tap-to-fill on clothing layer"
```

---

## Task 12: Phase 3 — Carousel on Kimi's silhouette

**Files:**
- Modify: `app/src/phases/Phase3Carousel.tsx`

**Goal:** Keep the same silhouette + clothing color from Phase 2. Cycle the face through happy → surprised → scared → sad at ~3 s each on loop. Tap the silhouette when the desired expression shows → set `tappedFace`, advance to Phase 4.

- [ ] **Step 1: Replace Phase3Carousel.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useAppStore, type FaceExpression } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'

const CYCLE: FaceExpression[] = ['happy', 'surprised', 'scared', 'sad']
const SECS_PER_FACE = 3

export default function Phase3Carousel() {
  const { name, color, cycleFace, tapFace, setPhase, faceNow } = useAppStore()
  const [idx, setIdx] = useState(0)
  const [tapped, setTapped] = useState(false)

  // Cycle face every 3s
  useEffect(() => {
    sendCtxUpdate()
    const interval = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % CYCLE.length
        cycleFace(CYCLE[next])
        return next
      })
    }, SECS_PER_FACE * 1000)
    return () => clearInterval(interval)
  }, [cycleFace])

  // Initial face
  useEffect(() => {
    cycleFace(CYCLE[0])
  }, [cycleFace])

  const handleTap = () => {
    if (tapped) return
    setTapped(true)
    tapFace(faceNow)
    sendCtxUpdate()
    setTimeout(() => {
      setPhase(4)
      sendCtxUpdate()
    }, 2000)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-around py-8">
      <div className="text-3xl text-beanie-blue">
        Tap when you see the face that feels like you, {name}.
      </div>

      <button
        onClick={handleTap}
        className="h-[60vh] w-[40vh] focus:outline-none"
        disabled={tapped}
        aria-label="Tap when this face feels like you"
      >
        <KimiSilhouette
          clothingColor={color}
          face={faceNow}
          showFace={true}
        />
      </button>

      <div className="text-xl text-beanie-blue/60">
        {tapped ? 'You picked this one.' : `Face: ${faceNow}`}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Step through Phases 1 → 2 → 3. Silhouette persists with chosen color. Face cycles every 3s. Tap the silhouette → label says "You picked this one." → 2s later advances to Phase 4 placeholder.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/phases/Phase3Carousel.tsx
git commit -m "Add Phase 3 Carousel on Kimi's silhouette with face cycling"
```

---

## Task 13: Phase 4 — Open question

**Files:**
- Modify: `app/src/phases/Phase4Question.tsx`

**Goal:** Display the question prominently. ElevenLabs handles audio + STT. App tracks `silenceSecs` for the reopener logic. Child's verbal answer (the `child_words`) populates via `onMessage`. When the answer arrives, `advance_phase(topic=...)` from Opus moves us to Phase 5.

- [ ] **Step 1: Replace Phase4Question.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import KimiSilhouette from '../components/KimiSilhouette'

export default function Phase4Question() {
  const { name, color, tappedFace, childWords } = useAppStore()
  const [secs, setSecs] = useState(0)
  const setReopened = (b: boolean) => useAppStore.setState({ reopened: b })

  // Initial CTX
  useEffect(() => {
    sendCtxUpdate()
  }, [])

  // Silence counter ticking every second; reset whenever childWords changes
  useEffect(() => {
    setSecs(0)
  }, [childWords])

  useEffect(() => {
    const interval = setInterval(() => {
      setSecs((s) => {
        const next = s + 1
        useAppStore.setState({ silenceSecs: next })
        // At 15s, mark reopened to trigger the gentle reopener once
        if (next === 15) {
          setReopened(true)
          sendCtxUpdate()
        }
        // At 40s, send CTX so Opus emits advance_phase(topic=null)
        if (next === 40) {
          sendCtxUpdate()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full w-full flex-col items-center justify-around py-8">
      <div className="flex w-full justify-between px-12">
        <div className="text-3xl text-beanie-blue/70">Phase 4</div>
        <div className="text-3xl text-beanie-blue/70">{secs}s</div>
      </div>

      <div className="h-[40vh] w-[28vh]">
        <KimiSilhouette
          clothingColor={color}
          face={tappedFace ?? 'sad'}
          showFace={true}
        />
      </div>

      <div className="max-w-3xl text-center text-4xl font-bold text-beanie-blue">
        Do you want to talk about it, {name}?
      </div>

      {childWords && (
        <div className="text-xl italic text-beanie-blue/70">"{childWords}"</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Step through to Phase 4. Silhouette is now smaller (anchor). The question shows. Counter increments. Say something → it appears underneath. ElevenLabs should call `advance_phase(topic=...)` → app moves to Phase 5.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/phases/Phase4Question.tsx
git commit -m "Add Phase 4 Open Question with silence tracking + reopener"
```

---

## Task 14: Phase 5 — Comforting Mirror (two-stage)

**Files:**
- Modify: `app/src/phases/Phase5Slideshow.tsx`

**Goal:** Stage 5a: show echo + comfort question, wait for yes. Stage 5b: slideshow of `activeAssets` (set by Opus' `show_assets` call) with ambient audio (`activeAudio`) underneath.

- [ ] **Step 1: Replace Phase5Slideshow.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useAppStore } from '../state/appStore'
import { sendCtxUpdate } from '../voice/elevenlabs'
import { startAmbientAudio, stopAmbientAudio } from '../voice/audioFallback'

const SLIDE_DURATION_MS = 4000

// Map asset IDs (returned by Opus) to actual /images/iran/ files.
// In the pitch script, Opus picks sea-themed IDs; we map any sea_* style id
// to our 5 sea images in rotation.
const ASSET_FILES: Record<string, string> = {
  iran_landscape_caspian_shore_02: '/images/iran/sea_01.jpg',
  iran_water_river_zayandeh_21:    '/images/iran/sea_02.jpg',
  iran_sky_stars_desert_20:        '/images/iran/sea_03.jpg',
  iran_landscape_alborz_snow_01:   '/images/iran/sea_04.jpg',
  iran_landscape_desert_sunset_03: '/images/iran/sea_05.jpg',
}
const FALLBACK_SEA = [
  '/images/iran/sea_01.jpg',
  '/images/iran/sea_02.jpg',
  '/images/iran/sea_03.jpg',
  '/images/iran/sea_04.jpg',
  '/images/iran/sea_05.jpg',
]

export default function Phase5Slideshow() {
  const { name, color, tappedFace, activeAssets, activeAudio, offerMade, setOfferMade } = useAppStore()
  const [slideIdx, setSlideIdx] = useState(0)

  // Send CTX on mount so Opus enters Stage 5a (offerMade=false)
  useEffect(() => {
    sendCtxUpdate()
    // After Opus' offer question, mark offerMade so subsequent turns know
    const t = setTimeout(() => {
      setOfferMade(true)
      sendCtxUpdate()
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  // When activeAssets populated by Opus' show_assets call → Stage 5b begins
  const inStage5b = activeAssets.length > 0

  useEffect(() => {
    if (!inStage5b) return
    if (activeAudio.includes('audio_sea_waves_01') || activeAudio.includes('audio_iran_music_traditional_01')) {
      startAmbientAudio()
    }
    return () => stopAmbientAudio()
  }, [inStage5b, activeAudio])

  useEffect(() => {
    if (!inStage5b) return
    const interval = setInterval(() => {
      setSlideIdx((i) => i + 1)
    }, SLIDE_DURATION_MS)
    return () => clearInterval(interval)
  }, [inStage5b])

  // Stage 5a: silhouette + offer question (text)
  if (!inStage5b) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-around py-8">
        <div className="h-[40vh] w-[28vh]">
          <img src="/images/kimi-silhouette.svg" alt="Kimi" className="h-full w-full" />
        </div>
        <div className="text-2xl text-beanie-blue/70">{offerMade ? 'Listening…' : ''}</div>
      </div>
    )
  }

  // Stage 5b: full-screen slideshow with crossfade
  const sources = activeAssets.length > 0
    ? activeAssets.map((id) => ASSET_FILES[id] ?? FALLBACK_SEA[0])
    : FALLBACK_SEA
  const src = sources[slideIdx % sources.length]

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <img
        key={src}
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        style={{ animation: 'fadeIn 1s forwards' }}
      />
      <style>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Step through to Phase 5. Initially: silhouette + "Listening…" text shows. Puppet should say "Iran…" + "Would you like to see the sea?". Say "yes" → Opus calls `show_assets(ids=[…], audio_ids=['audio_sea_waves_01','audio_iran_music_traditional_01'])` → slideshow starts, ambient audio fades in.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/phases/Phase5Slideshow.tsx
git commit -m "Add Phase 5 two-stage Comforting Mirror with sea slideshow + ambient audio"
```

---

## Task 15: Co-Regulation visual overlay

**Files:**
- Modify: `app/src/App.tsx`
- Create: `app/src/components/EscalationGlow.tsx`

**Goal:** When `escalated=true` (set by Opus' `mark_escalation` tool call), show a subtle warm glow border around the screen as the social-worker cue. Not loud, but unmistakable for someone who knows what to look for.

- [ ] **Step 1: Write `EscalationGlow.tsx`**

```tsx
import { useAppStore } from '../state/appStore'

export default function EscalationGlow() {
  const escalated = useAppStore((s) => s.escalated)
  if (!escalated) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50"
      style={{
        boxShadow: 'inset 0 0 80px 30px rgba(220, 38, 38, 0.35)',
        animation: 'pulse 2.5s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Add to App.tsx**

In `App.tsx`, just before `</div>` of the main render:

```tsx
import EscalationGlow from './components/EscalationGlow'
// ...
return (
  <div className={`relative flex h-screen w-screen flex-col items-center justify-center ${escalated ? 'bg-beanie-blue/50' : 'bg-beanie-yellow'}`}>
    <PhaseComponent />
    <EmergencyTouchZone />
    <EscalationGlow />
  </div>
)
```

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/
git commit -m "Add escalation visual cue overlay"
```

---

## Task 16: Emergency touch zone (failover advance)

**Files:**
- Modify: `app/src/components/EmergencyTouchZone.tsx`

**Goal:** Invisible touch area at the bottom-edge of the screen. Long-press (2 s) advances the phase manually — Kimi-Schauspielerin's get-out-of-jail card if the app hangs.

- [ ] **Step 1: Replace EmergencyTouchZone.tsx**

```tsx
import { useRef } from 'react'
import { useAppStore } from '../state/appStore'

const LONG_PRESS_MS = 2000

export default function EmergencyTouchZone() {
  const timer = useRef<number | null>(null)

  const start = () => {
    timer.current = window.setTimeout(() => {
      const s = useAppStore.getState()
      const next = Math.min(5, s.phase + 1) as 1 | 2 | 3 | 4 | 5
      console.warn(`[emergency-advance] ${s.phase} → ${next}`)
      useAppStore.setState({ phase: next })
    }, LONG_PRESS_MS)
  }

  const cancel = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  return (
    <div
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className="absolute bottom-0 left-0 z-40 h-12 w-full opacity-0"
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Verify**

In dev mode, long-press the bottom 12px of the screen for 2 s. Phase should advance one step. Browser console logs the advance.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/little-red-beanie
git add app/src/components/EmergencyTouchZone.tsx
git commit -m "Add invisible emergency touch zone for manual phase advance"
```

---

## Task 17: End-to-end story rehearsal on the tablet

**Files:** No changes — this is a verification + bug-fix task.

**Goal:** Run the full Kimi story 3× on the actual Android tablet in Chrome fullscreen. Measure latency. Log any drift.

- [ ] **Step 1: Build for production**

```bash
cd ~/.claude/little-red-beanie/app
npm run build
npm run preview -- --host 0.0.0.0
```

This serves the static build from `dist/` on a port. Note the URL.

- [ ] **Step 2: Open on Android tablet via Chrome → fullscreen**

Open the preview URL in Chrome on the tablet. Add to home screen. Tap the home-screen icon → opens full-screen.

- [ ] **Step 3: Story rehearsal #1 — happy path**

Run the full script: "Tap to begin" → Kimi → Eight → tap black → tap silhouette → wait through fill → wait through cycle → tap sad face → wait through question → say "I miss my home in Iran" → wait for offer → say "Yes" → sea slideshow + audio plays.

For each puppet line: measure time from her speech end to next puppet audio start (use a stopwatch / phone timer). Target < 1 s. Note any > 1.5 s spike.

- [ ] **Step 4: Story rehearsal #2 — silence variant**

Same flow, but stay silent at Phase 4. Verify reopener fires at ~15 s ("Take your time"). Wait until ~40 s, app should auto-advance into Phase 5a with `topic=null`.

- [ ] **Step 5: Story rehearsal #3 — full script with timing**

Final dress rehearsal. End to end. If anything wobbles, fix and commit before moving on. Common issues you may hit:
- Mic permission lost between sessions → revoke + re-grant
- ElevenLabs audio chunky → check WiFi
- Silhouette doesn't render → check `/images/kimi-silhouette.svg` actually exists in `dist/`
- Color swatch tap doesn't register → check Tailwind classes loaded

- [ ] **Step 6: Commit any fixes**

```bash
cd ~/.claude/little-red-beanie
git add -A
git commit -m "Final bug fixes from end-to-end rehearsal"
```

---

## Task 18: Final push + pitch-day checklist

**Files:** None.

**Goal:** Everything in git, fresh API key in `.env.local`, tablet ready.

- [ ] **Step 1: Push everything to GitHub**

```bash
cd ~/.claude/little-red-beanie
git push origin main
```

- [ ] **Step 2: Verify tablet has the latest build**

Make sure the tablet's Chrome is pointing at a stable URL (either local `npm run preview` running on your laptop on the venue WiFi, or deploy `dist/` to Coolify/IONOS if WiFi is unreliable).

- [ ] **Step 3: Pitch-day checklist**

Print or pin this:

```
□ Tablet charged (>80%)
□ Tablet in airplane-mode-OFF + WiFi connected
□ Chrome icon on home screen → app loads in fullscreen
□ Microphone permission granted (Chrome → Site Settings)
□ Sound volume max
□ Anthropic API key in .env.local set and working
□ ElevenLabs account has billable balance for the demo
□ Two dry runs done backstage
□ Phone with stopwatch ready (latency sanity check)
```

---

## Definition of Done

- [ ] App at `~/.claude/little-red-beanie/app/` boots in Chrome on Android tablet in fullscreen
- [ ] Power-on screen → live ElevenLabs session starts on tap
- [ ] All 5 phases render and transition (driven by Opus tool-calls + touch fallbacks)
- [ ] Silhouette persists from Phase 2 with chosen clothing color into Phase 3
- [ ] Phase 5b crossfades sea images with ambient sea+music audio
- [ ] Escalation glow visible if `mark_escalation` fires
- [ ] Emergency long-press at bottom edge advances phase manually
- [ ] 3 end-to-end rehearsals complete without crash
- [ ] Latency measured < 1.5 s per puppet line (target: < 1 s)
- [ ] Everything pushed to `kevinbrmer/little-red-beanie` main

## Out of scope for this plan (post-pitch)

- 5-Slide-Pitch-Deck (separate track)
- Real iran asset procurement (replace placeholders later)
- Canonical Strich-Clipping mal-mechanic
- Sokratic-strict Phase 5 single-stage
- Real DSGVO / AVV / Hosting compliance
