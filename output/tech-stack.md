# Tech-Stack — Little Red Beanie

> Entschieden 2026-05-28. Architektur-Variante **A** aus drei diskutierten Optionen.

## Entscheidung

| Layer | Tool | Warum |
|---|---|---|
| **Voice & Conversational** | **ElevenLabs Conversational AI** | One-Stop für STT + VAD + Turn-Taking + TTS. LLM-Backend frei wählbar. Sub-Second-Latenz. |
| **LLM-Backend** | **Anthropic Opus 4.7** (`claude-opus-4-7`) | Reasoning-Tiefe für sokratische Frage-Architektur, Trauma-Sensitivität, kontextbezogene Asset-Auswahl. |
| **Stimme** | **ElevenLabs Voice Design** (Custom Voice via Text-Beschreibung) | Einzigartige, kindgerechte Roboter-Stimme ohne Sample-Aufnahmen oder Cloning-Ethik. |
| **Front-End** | offen — Touchscreen-App | Wird in App-Architektur-Session festgelegt (Native/Web/PWA). Anforderungen: Mal-Funktion mit Strich-Clipping auf Silhouetten-Maske, Asset-Pool-Anzeige, WebSocket-Anbindung an ElevenLabs Conv. AI. |

## Verworfene Alternativen

| Variante | Warum verworfen |
|---|---|
| **OpenAI Realtime → ElevenLabs Streaming-TTS** | Kostet die Opus-4.7-Reasoning-Tiefe (Realtime nutzt GPT-4o-Realtime). Zwei Streaming-Services orchestrieren ist komplexer. Latenz nur 100–300 ms besser. |
| **OpenAI Realtime End-to-End** | Keine Custom Voice möglich (nur vorgegebene OpenAI-Voices). Niedrigste Latenz, aber Identitäts-/Branding-Verlust für „Little Red Beanie". |
| **Whisper + Opus 4.7 + ElevenLabs TTS (manuell verkettet)** | Höchste Flexibilität, höchste Bau-Komplexität. Sinnvoll als Fallback, wenn ElevenLabs Conv. AI an Compliance scheitert. |

## Latenz-Erwartung

Ziel: **first-audio < 1000 ms** nach Sprechende des Kindes.

Aufschlüsselung:

| Komponente | Latenz | Anmerkung |
|---|---|---|
| VAD / Turn-End-Detection | 200–500 ms | In ElevenLabs Conv. AI eingebaut |
| LLM (Opus 4.7) first token | 300–500 ms | Via Anthropic-Streaming |
| ElevenLabs TTS first audio chunk | 75–200 ms ab erstem Token | Flash v2.5 oder Conv.-AI-Voice-Engine |
| Network + Audio-Buffer | 100–200 ms | Hosting/Region/Geräte-Puffer |
| **Total** | **~700–1000 ms** | First-audio nach Sprechende |

Höhere Werte (> 1200 ms) zerstören die Pitch-Wirkung — dann wirkt der Roboter wie ein Laggy-Chatbot, nicht wie eine warme Gegenfigur.

## Bottlenecks / kritische Implementierungspunkte

1. **Token-Streaming-Disziplin:** Opus-Tokens müssen sofort an die ElevenLabs-TTS-Pipeline gepusht werden, nicht erst auf Satzende warten. In ElevenLabs Conv. AI sollte das von Haus aus passen — verifizieren.
2. **Prosodie-Mini-Buffer:** ElevenLabs braucht 2–3 Wörter Vorlauf für gute Prosodie. Unvermeidlich. Kein Bug.
3. **Sprach-Modell-Treue zu Opus-Prompt:** ElevenLabs Conv. AI legt einen eigenen System-Prompt-Wrapper über die LLM-Anfrage. Sicherstellen, dass unser Sokratik-/Sicherheits-Prompt durchschlägt und nicht überschrieben wird.
4. **Latenz unter realen Bedingungen messen** — nicht den Marketing-Werten vertrauen. Ein Test-Setup mit echten ~700 ms Round-Trip ist Voraussetzung, bevor wir die Live-Demo planen.

## Offene Folge-Punkte

- **Voice-Design-Prompt formulieren** — kurz, präzise, mit Stimmcharakter (warm, leicht heller als Erwachsenenstimme, kindzugewandt, ruhiger Roboter-Charme, sehr leichter freundlicher Beiklang). Iteration mit A/B-Hörtests.
- **DSGVO / EU-Hosting prüfen** — ElevenLabs hat Enterprise-EU-Hosting; Anthropic ebenfalls (EU-Region). Vor Demo bei einem realen Schul-Kontext zwingend abklären. Für die Bühnen-Demo (fiktive „Kimi", Pitch-Setting) weniger kritisch, aber Datenschutz-Folgenabschätzung mit dokumentieren.
- **Conversational-AI-Pricing** validieren — Pro-Minute-Kosten und Anthropic-LLM-Through-Pricing. Nice-to-have, kein Blocker.
- **Mal-Funktion** ist nicht Teil dieses Stacks — App-Architektur ist eine separate Entscheidung (vermutlich Touchscreen-Webapp mit Canvas + Mask-Clipping).
- **Iran-Asset-Pool**: Kurations- und Hosting-Frage, kein Stack-Thema. Aber Asset-IDs müssen für Opus 4.7 als Tool-Call oder Asset-Liste im System-Prompt auffindbar sein.

## Compliance-Notiz (wichtig)

Beide Anbieter sind US-basiert (ElevenLabs USA/UK, Anthropic USA). Bei Minderjährigen + emotionalen Sprachaufnahmen ist das DSGVO + EU AI Act sensibel. Vor jedem realen Einsatz im Schul-Kontext: Datenschutz-Folgenabschätzung, Auftragsverarbeitungs-Vertrag (AVV), EU-Hosting-Region erzwingen. Für die reine Pitch-Bühnen-Demo (kein echtes Kind) entspannt; für Pilot/Real-Use **harter Blocker**.
