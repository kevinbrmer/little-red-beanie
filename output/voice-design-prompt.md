# Voice-Design-Prompt — Little Red Beanie

> Eingabe für **ElevenLabs Voice Design**, das aus einer Text-Beschreibung + Sample-Text eine einzigartige Custom Voice generiert.
> **Stand 2026-05-28:** Männliche Puppe, **kein** Roboter-Hauch, Voice ist **Englisch**.

## Persona der Stimme

„Little Red Beanie" ist eine **Puppe** — keine Roboter-KI-Figur. Die Stimme muss klar **organisch, menschlich, puppenhaft** wirken — wie der weiche, ruhige Charakter einer geliebten Kinderzimmer-Plüschfigur, nicht wie ein Sprachassistent.

- **Geschlecht:** männlich
- **Alter der Stimme:** junge erwachsene Klangfarbe (Mitte 20 bis frühe 30) — nicht Vater/Lehrer (zu autoritär), nicht Junge (überhöht)
- **Charakter:** warm, sanft, geduldig, einladend, mit einem Hauch ruhiger Verspieltheit (Puppen-Persönlichkeit)
- **Sprache:** Englisch, neutraler Akzent (US/UK-neutral) — kein starker regionaler Einschlag
- **Sprech-Stil:** klar artikuliert, langsames Tempo, natürliche Atmung, organische Pausen
- **Identität:** „beste-Freund-aus-dem-Kinderzimmer", nicht „Erzieher", nicht „Performer", nicht „Maschine"

## Anti-Patterns (für die Auswahl wichtig)

| Vermeiden | Warum |
|---|---|
| Roboter-Klang, synthetischer Schliff, jede Art von KI-Hauch | Persona ist Puppe, nicht Roboter — Identität würde brechen |
| Theatralisch, hammy, „Märchen-Tante"-Pathos | Trauma-Sensitivität verlangt zurückhaltenden Ton |
| Säuselig, überhöht-kindlich | wirkt anbiedernd, Kinder fühlen sich nicht ernst genommen |
| Erwachsen-autoritär, lehrerhaft | unterläuft die sokratische Augenhöhe |
| Kalt, klinisch, sachlich | erzeugt emotionale Distanz, untergräbt Trost |
| Starker regionaler Akzent (Cockney, Texan, …) | störend in einem internationalen Setting, ablenkend |
| Sprech-Tempo zu schnell | Pause-Architektur kollabiert, Kind kann nicht folgen |
| Frauenstimme | Persona ist männlich gesetzt |

## Drei Varianten zum Generieren

Generiere von jeder Variante 2–3 Versionen in ElevenLabs Voice Design und vergleiche mit dem Sample-Text unten.

### Variante A — Puppet-Friend (empfohlen)

```text
A warm, gentle young-adult male voice in his mid-20s with the soft,
slightly playful character of a beloved children's puppet — think a
quieter, less performative cousin of a Jim Henson puppet, fully organic
and never robotic. Neutral English accent, clear articulation, generous
pace with natural breath and pauses. Sounds caring, safe, and a little
curious. Suitable for talking with a child aged 6 to 10 about feelings,
in a calm 'safe room' setting.
```

Profil: Puppen-Charme mit Wärme. Klar als Figur erkennbar, aber organisch. Mein Top-Pick.

### Variante B — Bedtime-Story Narrator

```text
A soft, warm, slightly higher young-adult male voice with the calm,
intimate quality of a children's bedtime-story narrator. Late 20s,
fully organic and human — no robotic or synthetic quality at all.
Slow, deliberate pace with natural breaths. Neutral English, very
clear articulation. Patient and attentive, never theatrical. Designed
to speak with a young child about feelings.
```

Profil: Erzählerische Wärme, intim, geringer Charakter-Anteil. Höchste Empathie, etwas weniger Persönlichkeit.

### Variante C — Quiet Companion

```text
A young-adult male voice in his mid-20s — warm, gentle, sincere.
Speaks neutral English with very clear articulation and a slow, calm
pace. The character is that of a quiet, attentive friend — not a
teacher, not a performer, not a robot. Natural breath and human
warmth. Suitable for emotionally sensitive conversations with
children aged 6 to 10.
```

Profil: Reduziert, minimaler Charakter. Sicherheit-by-Default, niedrigstes Risiko, niedrigste Persönlichkeit.

## Sample-Text für die Voice-Generierung (Englisch)

Diesen Text bei der Voice-Design-Generierung als Probe-Aufnahme verwenden — er deckt typische Dialog-Zeilen aus den fünf Phasen ab.

```text
Hi there. I'm Little Red Beanie. What's your name?
Nice to meet you, Kimi. How old are you?
Eight years old — that's wonderful.
Would you like to give yourself a color? Which color feels right for you today?
Take your time. You don't have to say anything you don't want to.
You did such a great job.
Say 'stop' when you see one that feels like you.
What's going on? Tell me a little more.
```

## Bewertungskriterien für die Auswahl

Pro generierter Voice 1–10 vergeben. Voice mit der höchsten Summe gewinnt — vorausgesetzt **keine** Einzelnote unter 6.

| Kriterium | Frage |
|---|---|
| Wärme / Empathie | Würde ich mein eigenes Kind diese Stimme hören lassen? |
| Verständlichkeit | Versteht ein Kind mit limitiertem Englisch jedes Wort? |
| Puppen-Charakter | Klingt es nach einer Figur, nicht nach einem Menschen-Sprecher und nicht nach einer KI? |
| Sicherheit / Vertrauen | Klingt es nach einem sicheren Begleiter, nicht nach einem Spielzeug? |
| Sprech-Tempo | Bleiben die Pausen zwischen Sätzen tragfähig? |
| Pitch-Robustheit | Bleibt der Charakter über alle acht Sample-Sätze konsistent? |
| **Roboter-Freiheit** | **Hört man irgendwo einen synthetischen Klang? Wenn ja: Abbruch.** |

## Test-Setup vor finaler Wahl

1. Drei Varianten generieren, je 2–3 Versionen → 6–9 Voice-IDs.
2. Sample-Text durch jede Voice laufen lassen, lokal anhören.
3. Shortlist von 2–3 Voices → A/B-Test mit Personen, die nicht am Projekt beteiligt sind (idealerweise eine Schulsozialarbeiterin oder eine Person, die mit Kindern arbeitet).
4. Voice-ID festschreiben in `.env` oder Config-Datei (`ELEVENLABS_VOICE_ID=...`).
5. Voice-Design-Prompt im Repo dokumentieren (diese Datei aktualisieren) — falls die Voice neu generiert werden muss, ist die Reproduktion nachvollziehbar.

## Iterations-Strategie

Voice Design ist generativ und stochastisch. Falls keine Variante überzeugt:

- **Prompt-Schärfung mit akustischen Adjektiven:** `warm`, `mellow`, `soft-spoken`, `breathy`, `airy`, `gentle`, `tender` — vermeide `husky`, `gravelly`, `raspy` (zu hart).
- **Genre-Anker variieren:** „like a friendly puppet in a quiet children's story", „like a soft-spoken animated character — not exaggerated", „like a gentle uncle reading a book".
- **Sample-Text variieren:** wenn die Voice an einer bestimmten Phrase scheitert (z. B. „What's going on?"), mit anderem Sample-Text erneut generieren.
- **Voice-Seed-Strategy:** Wenn eine Variante fast passt, sie als Seed nehmen und mit angepasstem Prompt feintunen (in ElevenLabs Voice Lab nachträglich modifizierbar).

## Offene Punkte

- ~~**Story-Sprache klären**~~ — **Geklärt 2026-05-28:** Demo ist komplett Englisch. Story (`input/pitch-story.md`) wurde nachgezogen, Voice spricht Englisch ohne Multilingual-Fallback.
- **Audio-Qualität auf der Puppe** prüfen — Voice-Wahl idealerweise auf der Ziel-Hardware (Lautsprecher in der Puppe oder Bluetooth-Speaker) verifizieren, nicht nur über Studio-Kopfhörer. Höhen können auf billigen Speakern verloren gehen.
- **Lizenz und Kommerz-Rechte:** Voice Design ist in den meisten ElevenLabs-Plänen für kommerzielle Nutzung freigegeben — vor öffentlichem Pitch kurz im aktuellen Tarif verifizieren.
