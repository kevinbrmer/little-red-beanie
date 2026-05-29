# ElevenLabs Conv AI Integration — Manual Verification Checklist

> Pre-Demo-Check für die Integration des Opus-4.7-System-Prompts in eine
> ElevenLabs Conversational-AI-Session. Pytest deckt die deterministische
> Prompt-Logik ab; alles hier ist manuell.

## Setup
- [ ] ElevenLabs Conv AI Agent angelegt
- [ ] LLM = Anthropic Opus 4.7 (`claude-opus-4-7`) via API-Key konfiguriert
- [ ] System Prompt = Inhalt von `prompts/system-prompt-v1.md` 1:1 in das
  Conv-AI-System-Prompt-Feld einkopiert
- [ ] Tools `advance_phase`, `show_assets`, `mark_escalation` als
  Client-Tools/Webhooks registriert (siehe Tool-Definitionen in `evals/runner.py`)
- [ ] Custom Voice (Voice Design) ausgewählt; siehe `output/voice-design-prompt.md`

## App-side `[silent_turn]` strip
- [ ] App-Layer fängt jeden Reply ab und sucht das exakte Token `[silent_turn]`
  am Anfang/Ende (oder als gesamten Reply) und unterdrückt TTS für diese Turns
- [ ] Mehrzeilige oder mit normaler Sprache vermischte `[silent_turn]`-Tokens
  werden als Bug behandelt (Opus soll das nie tun) — Logging, kein TTS-Output

## Wrapper-Verifikation
- [ ] Test-Session: Probe-Frage „are you real?" → Antwort enthält **kein**
  „AI", „assistant", „model". Wenn doch → Conv-AI-Wrapper überschreibt unsere
  Hard Rule #9; Lösung: System-Prompt-Stärke in ElevenLabs erhöhen oder Wrapper
  via Konfiguration deaktivieren.
- [ ] Test-Session: Phase 4 / „why?" als Erwiderung → Puppe stellt keine
  Warum-Frage. Wenn doch → wie oben.
- [ ] Test-Session: Phase 5 + topic=null → Puppe wählt ruhige Naturmotive
  (kein Pathos). Wenn Pathos-Bilder gewählt → Asset-Selection-Heuristik
  funktioniert; Prompt iterieren.

## Latenz-Test (T15)
**Ziel:** First-audio-Latenz < 1000 ms nach Sprechende.

- [ ] Test-Session aufgenommen (Audio-In + Audio-Out + Zeitstempel)
- [ ] Drei Test-Turns durchgespielt: Phase 1 Greeting, Phase 4 ein Wort,
  Phase 5 Asset-Show
- [ ] Latenz pro Turn gemessen (Sprechende → erstes Audio-Chunk):
  - Turn 1: _______ ms
  - Turn 2: _______ ms
  - Turn 3: _______ ms
- [ ] Falls > 1200 ms in einem Turn → siehe `output/tech-stack.md` §Bottlenecks

## Show-Assets-Rendering
- [ ] `show_assets`-Tool-Call wird vom Front-End empfangen
- [ ] IDs werden zu konkreten Dateien aufgelöst (Asset-Beschaffung muss
  abgeschlossen sein, sonst Platzhalter rendern)
- [ ] Slideshow läuft ruhig (~4 s pro Bild, Crossfade)

## Co-Regulation-Cue
- [ ] `mark_escalation`-Tool-Call triggert sichtbaren Schimmer am Bildschirmrand
- [ ] Schimmer ist diskret (für Kind nicht störend), aber für Sozialarbeiterin
  klar erkennbar
- [ ] App setzt `escalated=true` in alle Folge-CTX-Header und behält es bis
  Session-Ende
- [ ] Bei Folge-Turns mit `escalated=true`: Puppe stellt keine Fragen mehr,
  nur Validation-Phrasen

## Phase-4 reopener tracking
- [ ] App initialisiert Phase 4 mit `reopened=false`
- [ ] Beim ersten Erkennen des Reopener-Outputs („Take your time, Kimi.")
  setzt die App `reopened=true` für alle weiteren Phase-4-Turns
- [ ] Verifikation: Puppe sagt „Take your time" **maximal einmal** über die
  gesamte Phase 4

## DSGVO / EU AI Act
- [ ] Vor realer Demo mit echtem Kind: AVV + EU-Hosting verifizieren
  (siehe `output/tech-stack.md` §Compliance-Notiz)
- [ ] Audio-Aufnahmen Session-only, keine Persistenz (DSGVO Art. 8 + EU AI Act
  Art. 5 Abs. 1 lit. b)
