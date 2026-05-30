# Handoff — Little Red Beanie

> Stand: 2026-05-30, früh. Kompletter 5-Phasen-Flow läuft Ende-zu-Ende, vom Nutzer bestätigt.

## Stand in einem Satz

Web-PWA für die Live-Pitch-Demo am 2026-05-30. Endgerät: Android-Tablet im Chrome-Vollbild. Voice-Layer steht (ElevenLabs Conv-AI + **Opus 4.7**, Voice Goofy), kompletter 5-Phasen-Flow läuft sauber durch (vom Nutzer abgenommen), Push-to-Talk eingebaut.

## Stand 2026-05-30 — was jetzt gilt

- **Phasen 1–4 sind FIX** (vom Nutzer eingefroren — nichts mehr ändern ohne explizite Ansage). Phase 5 final repariert.
- **Kein `advance_phase`-Tool mehr.** Alle Phasenübergänge laufen über App-Timer; nur noch `show_assets` + `mark_escalation` am Agent. Grund: Tool-Call direkt nach STT-Finalisierung crasht das ElevenLabs-SDK (`undefined error_type` → DataChannel-Disconnect).
- **Flow-Mechanik:** Phase 1→2 App-Timer (3.5s) mit inline close+open; 2→3 App-Timer nach Farb-Fill; 3→4 + 4→5 App-Timer; jede neue Phase außer 1→2 holt die gesprochene Zeile über `(phase N entry)`-Trigger.
- **Phase 2 Farbe:** Tap **oder** Voice (nur primary words). Bestätigung "You picked X. Beautiful." kommt über **`sendContextualUpdate('(color picked: X)')`** — NICHT `sendUserMessage` (das löste die "You…"-Selbst-Unterbrechung aus).
- **Phase 5 zweistufig, strikt voice-gated:** 5a stellt per Live-Agent "Would you like to see the sea?" (kein Name), wartet auf gesprochenes "yes"; KEIN Watchdog/Tap/Auto-Advance. 5b zeigt `coast.jpg` ("Coast of Iran, for Kimi") + Ambient-Audio, dann `stopVoiceSession()` (Hard-Stop, Puppe schweigt).
- **UI:** Maskottchen-Icon (`mascot.png`) als Header auf allen Screens; keine Chapter/Stern-Labels; keine Anzeige von User-Eingaben; Push-to-Talk-Button unsichtbar, nur kleiner roter Aufnahme-Punkt oben links bei gehaltenem SPACE.
- **Assets:** Silhouette `empty.png`/`filled-black.png` (transparent, Opacity-Crossfade), 5 Face-PNGs `faces-large/` (balanced/happy/sad/scared/angry), `coast.jpg`.

## Heutige Session — die wichtigen Schritte

In dieser Reihenfolge entstanden (chronologisch über die heutigen 19 Commits):

1. **Premium Polish Pass** — Phase 1 Onboarding ohne Buttons, ColorPalette flach + Hairline, Phase 5 Single-Sea-Hero, Cross-Fades editorial.
2. **Voice-Output fixen** — ElevenLabs-Agent-Settings via REST gepatcht: `first_message` gesetzt, sonst sprach die Puppe nie.
3. **Premium-Stil festgeschrieben** — Editorial Luxury (Aesop/Loro Piana) als Richtung, Phase-Übergänge weicher, Stimme via Pronunciation-Hint (Kimi = KEE-mee).
4. **Sensibilität im Prompt** — Hard Rules erweitert (Name sparingly, Phase 4 Validation vor advance_phase, Phase 5 Stage 5a warmer reflektiv).
5. **Push-to-Talk** — Hold SPACE öffnet Mic, sonst gemuted. Plus Indikator unten zentriert.
6. **HSL-Leak gefixt** — CTX gibt `color=green` statt `color=hsl(108, 13%, 47%)` aus, Hard Rule #12 „Never speak technical values".
7. **Phase 2 = einstufig** — User sagt Farbe, Silhouette füllt sich automatisch, keine Tap-Interaktion.
8. **Phase-Entry-Trigger** — `triggerPhaseEntry()` mit `sendUserMessage("(phase N entry)")` zwingt Sonnet zur Bridge-Zeile bei jeder Phase.
9. **Echo-Bug-Fix** — der Phase-Entry-Trigger kam als `user_transcript` zurück und triggerte deterministische Logik. Regex-Filter raus.
10. **Deterministisch raus, Script ins Prompt** — App liest jetzt echten Voice-Input. Hard Rule #11 im System-Prompt enthält das Script als „Memory" für Korrektur bei STT-Fehlern.

## Wichtige Setup-Schritte auf dem Hauptrechner

```bash
git clone git@github.com:kevinbrmer/little-red-beanie.git
cd little-red-beanie/app
npm install
cp .env.example .env.local
# .env.local ausfüllen — siehe nächster Abschnitt
npm run dev  # http://localhost:5173
```

## `.env.local` (NICHT im Repo, gitignored)

```env
ELEVENLABS_API_KEY=<dein-elevenlabs-key>
VITE_ELEVENLABS_AGENT_ID=agent_6901ksvqwxtvfrxtbz43hpd0hbsj
```

> **Account-Wechsel 2026-05-30:** Der ursprüngliche ElevenLabs-Account war quota-erschöpft (Crash `undefined error_type` mitten in der Demo = "This request exceeds your quota limit", server-seitig bestätigt). Neuer Account (tier=creator, frisches Guthaben) → neuer Agent **`agent_6901ksvqwxtvfrxtbz43hpd0hbsj`** ("Little Red Beanie") per API neu angelegt mit identischen Settings (Opus 4.7, Voice Goofy `BRruTxiLM2nszrcCIpz1`, eleven_flash_v2, latency 3, turn patient/7s, Tools show_assets+mark_escalation, auth disabled). Key liegt nur in `.env.local` (gitignored) — den richtigen Key beim Wiedereinstieg eintragen.

Anthropic-API-Key wird hier NICHT mehr direkt verwendet — der Agent läuft mit dem LLM-Backend, das in der ElevenLabs-Konfiguration gesetzt ist (siehe unten).

## Aktuelle ElevenLabs-Agent-Settings (live am Cloud-Agent)

Agent-ID: `agent_9701kssn7fy7fbsvxzz3tegkd6hd`

| Setting | Wert |
|---|---|
| `agent.prompt.llm` | `claude-opus-4-7` (am 2026-05-29 abends von Sonnet 4.6 zurück, weil Sonnet beim `(phase N entry)` Trigger die vorige Phase-Close-Line wiederholt + fälschlich advance_phase in Phase 2 aufgerufen hat + CTX-Header wörtlich gesprochen hat) |
| `agent.prompt.max_tokens` | 300 |
| `agent.prompt.prompt` | Inhalt von `prompts/system-prompt-v1.md` (~23 KB) |
| `agent.first_message` | „Hi there. I am Little Red Beanie. What is your name?" |
| `tts.voice_id` | `BRruTxiLM2nszrcCIpz1` (Goofy — Kevin hat das bewusst gewählt) |
| `tts.model_id` | `eleven_flash_v2` |
| `tts.stability` | 0.5 |
| `tts.speed` | 1.0 |
| `tts.similarity_boost` | 0.8 |
| `tts.optimize_streaming_latency` | 3 (war 4, 4 hatte First-Audio-Cutoff auf "Hi") |
| `turn.turn_timeout` | 1.9 s — Pause nach Sprechende bevor Agent antwortet |
| `turn.turn_eagerness` | `normal` (vorher `eager` — Varianz war zu hoch) |
| `turn.speculative_turn` | false (war Quelle für ungleichmäßige Pausen) |
| `platform_settings.auth.enable_auth` | false — Agent-ID reicht zum Connecten |

Sync-Script für den Prompt (lokal):
```bash
export XI_KEY=$(grep ELEVENLABS_API_KEY .env.local | cut -d= -f2)
python3 -c "import json, os, urllib.request; ..."
# (siehe HANDOFF.md history / Conv-AI Settings im Dashboard)
```

## Architektur-Kernpunkte

### Voice-Layer (`app/src/voice/elevenlabs.ts`)

- `startVoiceSession()` — initialisiert Mic mit `noiseSuppression + echoCancellation + autoGainControl: false`, startet `Conversation.startSession`. Mic wird sofort gemuted (Push-to-Talk).
- `triggerPhaseEntry()` — sendet `sendContextualUpdate` (CTX-Sync) + `sendUserMessage("(phase N entry)")` (Turn-Force). Dedupliziert via `lastTriggeredPhase` gegen StrictMode-Double-Mount.
- `sendCtxUpdate()` — nur CTX-Sync, kein Turn-Force. Für in-phase State-Updates.
- `setMicMuted(boolean)` — Push-to-Talk-Gate.
- `onMessage` — filtert:
  1. Phase-Entry-Echo `(phase N entry)`
  2. Empty/short Messages (`length < 2`)
  3. Phase 1: parse Name + Age aus echtem STT
  4. Phase 2: VOICE_COLORS-Regex matched echte Farbe
  5. Phase 3-5: `setChildWords(message)` — kein force

### Push-to-Talk (`app/src/components/PushToTalk.tsx`)

- Window-Level `keydown`/`keyup` auf `Space`. `e.repeat` filtert Auto-Repeat.
- Window `blur` → mute (Schutz gegen „Mic bleibt offen" beim Alt-Tab).
- Indikator unten zentriert: „Hold space to speak" / pulsierendes Gold „Listening".

### Phasen-Komponenten (`app/src/phases/`)

Jede Phase macht beim Mount `triggerPhaseEntry()`. Jede hat eine eigene Advance-Logik (useEffect-Timer):

| Phase | Advance-Trigger | Wartezeit |
|---|---|---|
| 1 → 2 | `name && age` beide gesetzt | 3.5 s |
| 2 → 3 | `color` gesetzt | 3.0 s (1.2 s Fill + 1.8 s) |
| 3 → 4 | `tappedFace` gesetzt (Touch oder Voice) | 3.5 s |
| 4 → 5 | `childWords` gesetzt | 5.0 s |
| 5 Stage 5b | Sonnet's `show_assets`-Tool ODER 6 s Watchdog | — |

### System-Prompt (`prompts/system-prompt-v1.md`)

12 Hard Rules. Die wichtigsten:
- **#11 Fixed-scenario rule** — die Tabelle der Skript-Werte (Kimi · 8 · black · sad · „I miss my home in Iran" · „yes"). Sonnet hard-codes diese Werte UNABHÄNGIG vom CTX-Inhalt — Korrektur für STT-Fehler.
- **#12 Never speak technical values** — Liste verbotener Tokens (HSL, RGB, hex, Asset-IDs, `(phase N entry)`, etc.)
- **Output Style** — Pronunciation Kimi = KEE-mee, Namens-Sparsamkeit, max 12 Wörter pro Turn, „mhm." als „quiet" Reply.

### CTX-Generator (`app/src/ctx/ctxGenerator.ts`)

Schreibt den `[CTX phase=N ...]` Header pro Phase. Reduzierte Feld-Sets — Counter wie `coverage`, `pace`, `idle_secs`, `silence_secs`, `secs_on_face` sind RAUS, weil Sonnet sie sonst vorgelesen hat. Aktuell:
- Phase 1: `name age escalated`
- Phase 2: `name age color filled escalated`
- Phase 3: `name age color face_now tapped_face escalated`
- Phase 4: `name age color chosen_face child_words tone_markers reopened escalated`
- Phase 5: `name age color chosen_face topic offer_made child_words escalated`

## Was noch offen ist (Pitch-Day Checklist)

- [ ] T17: End-to-End Rehearsal — kompletter Durchlauf auf dem Pitch-Tablet
- [ ] T18: Final Push + Pitch-Day Checklist — Tablet-Bluetooth-Tastatur für SPACE-Key prüfen, Lautstärke testen, Mic-Setup auf der Bühne checken
- [ ] 5-Slide-Pitch-Deck — das ist NICHT in diesem Repo, separat
- [ ] Live-Demo-Skript (Bühnen-Choreographie zwischen „Kimi"-Schauspielerin und Puppe)

## Bekannte Limitationen

1. **Hintergrund-Audio-Problem** — Push-to-Talk löst das überwiegend (Mic gemuted bis Space gehalten). Mac-Vorlesungs-Audio kommt aber bei kurzem Mic-Open trotzdem rein. Hardware-Fallback wäre Richtmikrofon.
2. **Phase 5 `show_assets`-Tool unzuverlässig** — Sonnet 4.6 ruft das Tool nicht immer. Watchdog (6 s Timer) triggert Stage 5b dann manuell.
3. **TTS „mhm." statt echter Stille** — ElevenLabs Conv-AI kennt kein Skip-Turn-Primitiv. Jeder LLM-Output wird gesprochen. „Quiet" Turns geben deshalb ein weiches `mhm.` oder `mm.` aus.
4. **Tablet ohne Tastatur** — Push-to-Talk braucht SPACE. Auf dem Tablet entweder Bluetooth-Tastatur oder Code-Erweiterung um Touch-Hold (TODO falls nötig).

## Session-Memories (Cross-Project, in `~/.claude/memory/`)

Diese sind global und im `kb-claude-setup`-Repo synchronisiert, nicht hier — aber für den Hauptrechner-Workflow relevant:

- `feedback_localhost_link_nach_fix.md` — nach jedem Fix den Localhost-Link anhängen (Kevin testet jede Iteration im Browser)
- `feedback_sicherheits_reminder_stop_nach_ack.md` — keine wiederholten Sicherheits-Warnungen nach einmaligem Acknowledge

## Wiedereinstieg auf dem Hauptrechner

```bash
# 1. Repo klonen
git clone git@github.com:kevinbrmer/little-red-beanie.git
cd little-red-beanie

# 2. Lies HANDOFF.md (diese Datei) — sie ist das Briefing
# 3. .env.local einrichten (siehe oben)
# 4. App starten
cd app && npm install && npm run dev

# 5. Browser auf http://localhost:5173 — Tap to begin → Hold SPACE → sprich "Kimi"
```

Die Live-Pitch-Variante ist Pitch-Variante v1.0 (siehe `CLAUDE.md` für Scope-Definition). Kanonische Spec für Post-Pitch-Iteration steht in `output/system-prompt-design.md` und `output/methoden-grundlagen.md`.
