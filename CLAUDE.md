@~/.claude/CLAUDE.md

# Little Red Beanie

> Stand: 2026-05-28. Status: Kick-off, Methoden-Recherche abgeschlossen. Technisches Konzept, App-Architektur und Slide-Deck stehen aus.

## Konzept in einem Satz

Ein sozialer Roboter namens „Little Red Beanie" mit Bildschirm und Sprachausgabe — gestützt auf Opus 4.7 — begleitet Kinder durch ein mehrstufiges, niedrigschwelliges Emotionsgespräch: **Personalisierung (Name + Alter) → Selbst-Ausmalen einer eigenen Silhouette → Gesichts-Karussell → offene Frage → multimodale Spiegel-Antwort (Bilder)**. Eingesetzt in der Schul-„Oase", im Beisein einer Schulsozialarbeiterin.

## Domäne

Soziale Arbeit / Pädagogik / nicht-klinische emotionale Begleitung. **Kein** klinisches Diagnostik- oder Therapie-Tool — die Puppe ergänzt, ersetzt keine Fachkraft.

## Zielgruppe

- **Primär:** Kinder mit eingeschränktem Emotions-Vokabular — sprachlich limitiert (Flucht-/Migrationshintergrund), neurodivergent, traumatisiert.
- **Sekundär:** Sozial beeinträchtigte Erwachsene mit kommunikativen Barrieren.

## Demo-Szenario (Live-Pitch)

**Vollständige Story:** [`input/pitch-story.md`](input/pitch-story.md) — verbindliche Quelle für Setting, Dialog und App-Flow.

**Demo-Sprache:** Englisch — siehe Roboter-Zitate unten und `input/pitch-story.md`. Voice ist englisch (siehe `output/voice-design-prompt.md`).

**Kurzfassung:** 8-jährige iranische Schülerin („Kimi") betritt mit der Schulsozialarbeiterin den Betreuungsraum („The Oasis"). Sie läuft direkt zur Puppe. Die Sozialarbeiterin schaltet ein, die Puppe fragt nach Name und Alter, zeigt eine Silhouette mit Kimis Namen darüber. Kimi wählt eine Farbe und malt ihre Silhouette aus. Dann Gesichts-Karussell („Say stop"), offene Frage „What's going on, Kimi?" → sie sagt nur „Iran". Die Puppe zeigt Bilder aus dem Iran als wortlose Spiegelung.

**App-Flow (fünf Phasen) — Quick-Reference:**

| Phase | Puppe (Englisch) | Kind | Technisch |
|-------|------------------|------|-----------|
| 1. Onboarding + Personalisierung | „Hi there. I'm Little Red Beanie. What's your name?" → „Nice to meet you. How old are you?" | nennt Name + Alter | STT auf Name + Alter, Touch-/Sozialarbeiter-Fallback. Beides als Session-Kontext gesetzt. |
| 2. Selbst-Ausmalen | zeigt feste Silhouette mit Namen darüber + Farbpalette; „Would you like to give yourself a color, [Name]? Now color yourself in." | wählt Farbe, malt Silhouette mit dem Finger aus | Touch-Auswahl Farbe (HSL → LLM-Prior) + Mal-Funktion mit Strich-Clipping auf die Silhouetten-Maske |
| 3. Gesichts-Karussell | zeigt vier Gesichter nacheinander, „Say 'stop' when you see one that feels like you, [Name]." | sagt „stop" | STT (Stopp-Trigger) + Touch-Fallback |
| 4. Offene Frage | „What's going on, [Name]?" | schweigt oder sagt ein Wort („Iran") | STT, akzeptiert Schweigen |
| 5. Spiegel-Antwort | wählt Bilder aus kuratiertem Iran-Asset-Pool und zeigt sie | wird ruhiger | LLM-gesteuerte Asset-Auswahl |

**Pitch-Ablauf:**
1. **5-Slide-Präsentation** leitet die Geschichte ein (Setting Oase, Mädchen, Bedeutung des Roboters).
2. **Live-Gespräch auf der Bühne** — eine Person spielt das Mädchen, interagiert mit dem Roboter (Touchscreen + Sprache).
3. Roboter durchläuft die fünf Phasen exakt wie in der Story.

**Scope (verbindlich):** Wir bauen die App für **genau diese eine Szene**. Kein generisches Framework. Asset-Pool ist Iran-spezifisch, Persona des Roboters ist fest. Skalierung auf andere Szenarien explizit aus dem MVP ausgeschlossen.

## Physische Puppe — visueller Steckbrief

> **Visuelle Referenz:** 4 Fotos vom 2026-05-28 in [`input/puppe-fotos/`](input/puppe-fotos/) (`puppe-01.jpeg` … `puppe-04.jpeg`)

- **Größe:** ca. 50–60 cm, klassische Sitz-Figur mit baumelnden Beinen
- **Kopf:** runder Stoffkopf, helle Hautfarbe, große runde Cartoon-Augen, markante Nase, freundlicher roter Mund
- **Haar:** wuschelig-krause schwarze Wollfäden
- **Mütze:** **rote Beanie** — Namensgeber „Little Red Beanie"
- **Oberteil:** klassisch blau-weiß gestreiftes Langarmshirt (Bretone-Stil)
- **Hose:** grün mit weißen Seitenstreifen
- **Schuhe:** gelbe Stoff-Slipper
- **Bauchschild:** **gelb gerahmter Touchscreen am Bauch** — das ist die UI-Oberfläche der App
- **Bauchredner-/Handpuppen-Bauart:** Reißverschluss am Rücken, Mund vermutlich manuell manipulierbar — optional nutzbar im Live-Pitch, kein technischer Anspruch der App

### Persona-Implikationen
- Jung, junghaft-männlich → passt zur männlichen Voice-Wahl
- Freundlich, sportlich, klassische Plüsch-Optik → keine spezifische Nationalitäts-Anmutung, neutral für den Cross-Cultural-Brückenschlag mit Kimi
- Eindeutig **Puppe**, kein Roboter-Look → konsistent mit „kein KI-Hauch in der Stimme"

### Design-Konsequenzen für die App
- **Kleiner Bildschirm** (geschätzt 5–7 Zoll) → UI kompakt, Touch-Targets finger-friendly (mind. 44 × 44 px), kurze Audio-Cues statt langer Texte
- **Portrait-Orientierung** wahrscheinlich (Bauchschild-Layout)
- **Marken-Farbpalette** für Slide-Deck und App-UI: **Blau (Shirt) · Weiß (Streifen) · Rot (Mütze, Mund) · Grün (Hose) · Gelb (Schuhe, Bildschirmrahmen)** — warme, bunte, kindgerechte Palette

## Methodische Grundlagen

Drei Dokumente im `output/`:

- [`output/methoden-grundlagen.md`](output/methoden-grundlagen.md) — fundierte
  Methoden-Synthese (Plutchik, Adams/Osgood, Maltherapie, Sokratik,
  Iran-Kontext) mit zehn konkreten Designempfehlungen. **Kanonische
  Grundlage** für Design- und Dialog-Entscheidungen.
- [`output/projektstarter.md`](output/projektstarter.md) — Pitch-Brief mit
  Story-Arc, 5-Slide-Architektur, drei harten Designprinzipien
  (Puppe-fragt-statt-interpretiert, Fragetypen-Whitelist, Eskalations-Routine)
  und Acht-Wirkfaktoren-Übertragung der Wetterbericht-Methode auf Farben.
  Liest sich als Briefing für Bühne und App-Vision.
- [`output/wetterbericht-recherche.md`](output/wetterbericht-recherche.md) und
  [`output/farb-emotions-recherche.md`](output/farb-emotions-recherche.md) —
  Roh-Recherchen mit voller Quellenliste (Jonauskaite 2020, Elliot
  Color-in-Context, Stavemann, EU AI Act, …).

Hinweis Spannungspunkt: `methoden-grundlagen.md` verwirft die
Wetterbericht-Methode explizit; `projektstarter.md` übernimmt ihre
**Wirkmechanik** (acht Wirkfaktoren) und überträgt sie auf Farben. Das ist
keine Widersprüchlichkeit der Praxis — beide kommen zu „keine feste
Farb→Emotion-Zuordnung" —, aber unterschiedliche Begründungsstränge.

Kernpunkte:

### Weather-Report-Methode → Inspirationsquelle, nicht übernommen
Etablierte Symbol-Methode (Sonne/Wolke/Regen/Gewitter) für Emotions-Check-ins. **Verworfen, weil:** Wetter-Symbole sind westlich-kulturell überformt, erfordern Metapher-Verstehen und sind für ein iranisches Kind ohne Deutsch nicht universell zugänglich. Empirisch dünn.

### Farb-Methode → gewählt
- **Plutchik's Wheel of Emotions** als wissenschaftlicher Anker (Freude=Gelb, Wut=Rot, Trauer=Blau, Furcht=Grün, Vertrauen=Hellgrün, Überraschung=Hellblau, Ekel=Violett, Erwartung=Orange).
- **Adams/Osgood 1973** (23 Kulturen): Helligkeit/Sättigung sind universelle Affekt-Marker; spezifische Farbtöne sind kulturell variant.
- **Maltherapie** stützt freien Farb-Ausdruck als etablierte Methode für traumatisierte und sprachlich limitierte Kinder.
- **Konsequenz:** Keine feste Farb→Emotion-Zuordnung in der App. Das Kind malt frei, die Puppe fragt sokratisch: „Was ist dieses Rot für dich?"

### Sokratische Gesprächsführung
- Offene Fragen, Spiegelung des Wortlauts, keine Interpretation.
- Eine Frage pro Turn, Pausen erlauben.
- **Risiko bei Fluchterfahrung:** Re-Traumatisierung. Kein „Warum?" zu Belastendem.
- **Schutzmechanismus:** Stop-Wort-Architektur, Stabilisierung vor Exploration, Eskalation an menschliche Fachkraft.

## Technische Architektur (vorläufig — Brainstorming offen)

### Komponenten
- **Sozialer Roboter „Little Red Beanie":** Physische Hülle (Plüsch/Stoff) mit integriertem Touchscreen und Lautsprecher — pragmatisch realisiert als Roboter-Hülle um ein Tablet. Bildschirm ist UI-Träger, kein separates Tablet daneben.
- **App auf dem Bildschirm:** Phasen-gesteuerter Flow (Begrüßung+Personalisierung → Selbst-Ausmalen → Gesichts-Karussell → Frage → Bild-Spiegelung). Vordefinierte Farbpalette + Mal-Funktion innerhalb der Silhouette-Maske; **Strich-Clipping** verhindert Übermalen — der Rahmen ist hart.
- **Silhouette (fest, eine):** kleines iranisches Mädchen mit dunklen Locken, kindliche Proportionen, **starke Rahmenlinien** für Finger-Malen. Keine Varianten im MVP.
- **Voice & LLM Stack (entschieden 2026-05-28):** **ElevenLabs Conversational AI** als Voice-Layer (STT + VAD + Turn-Taking + TTS in einem Service). LLM-Backend ist **Opus 4.7** (`claude-opus-4-7`) via Anthropic SDK, eingehängt als LLM-Konfiguration der Conversational-AI-Session. Stimme ist eine **Voice-Design-generierte Custom Voice** (warm, ruhig, leicht heller, kindzugewandt mit leichtem Roboter-Charme).
- **Sprachen:** Deutsch zwingend (System-Voice Deutsch). Farsi-Anteile optional, z. B. für tröstende Floskeln in Phase 5.
- **Latenz-Ziel:** ~700–1000 ms first-audio nach Sprechende des Kindes. Höhere Werte zerstören die Live-Wirkung im Pitch. Architektur-Doku → [`output/tech-stack.md`](output/tech-stack.md).
- **Iran-Asset-Pool:** Kuratierte Bildersammlung (Landschaften, Straßen, Alltagsmotive, Symbole). Wird vom LLM in Phase 5 kontextbezogen ausgespielt.

### LLM-Dialog-Constraints
- System-Prompt erzwingt sokratische Frage-Architektur (eine offene Frage pro Turn, Spiegelung, keine Interpretation, **kein „Warum?"**).
- **Personalisierungs-Kontext:** Name und Alter werden in Phase 1 erfasst. Name fließt in jede spätere Anrede ein. Alter dient primär der Gesprächs-Auflockerung und einem warmen, altersgerechten Sprachregister — **nicht** der Logik-Verzweigung (Silhouette ist fest, Persona ist fest).
- **Input pro Turn:** Aktuelle Phase + Name + Alter + ausgewählter Farb-Code (HSL) + Mal-Verlauf-Marker (z. B. zögerlich/zügig/leer) + ausgewähltes Gesicht (Emotion-Label) + Sprach-/Text-Antworten + Stille-Marker.
- **Farb-Bewertung:** Helligkeit/Sättigung als Prior („dunkel/entsättigt → belastet"), **nie als Diagnose**. Das Gesichts-Karussell präzisiert die Emotion — Farbe bleibt mehrdeutig.
- **Stopp-Mechanik:** „Stopp" im Karussell ist **Auswahl-Signal**. „Stopp" außerhalb oder Schweigen >X Sek. ist **Veto-Signal** → Wechsel zu Co-Regulation.
- **Asset-Auswahl:** Bei Ein-Wort-Antworten (z. B. „Iran") wählt das LLM Bilder aus dem kuratierten Pool, die **spiegeln statt deuten**. Modellrichtlinie: zeige Vertrautes, kein Pathos.
- **Eskalation:** Bei Trauma-Markern → Roboter wechselt zu Co-Regulation (ruhige Stimme, weiches Bild). Die anwesende Sozialarbeiterin ist die menschliche Instanz; der Roboter setzt nonverbale Cues, schiebt nicht tiefer in die Exploration.
- **Privacy:** Name + Alter bleiben **session-only**, keine Persistenz über die Session hinaus (DSGVO + EU AI Act bei Minderjährigen).

### Privacy / Compliance
- **DSGVO + EU AI Act** beachten: Minderjährige + emotionales Profiling = Hochrisiko.
- Strokes lokal verarbeiten.
- LLM-Antworten ephemer; **keine Roh-Inhalt-Persistenz ohne explizite Einwilligung**.
- Nur aggregierte Stimmungs-Marker an Bezugsperson — und nur mit deren Freigabe.

## Deliverables

- [ ] **5-Slide-Pitch-Deck** zur Geschichte (iranisches Mädchen, Setting, Bedeutung der Puppe)
- [ ] **Tablet-App** mit Farb-Canvas + sokratischem Dialog
- [ ] **System-Prompt** für Puppe (Opus 4.7) mit allen Sicherheits-Constraints
- [ ] **Live-Demo-Skript** für Bühne (abgestimmte Trigger zwischen „Mädchen" und Puppe)

## Designprinzipien (verbindlich)

1. **Keine feste Farb→Emotion-Zuordnung erzwingen** — Bedeutung wird im Gespräch erfragt.
2. **Stabilisierung vor Exploration** — Puppe baut erst Beziehung auf (2–3 Turns), dann Affekt-Arbeit.
3. **Keine „Warum?"-Fragen zu Belastendem** — stattdessen „Erzähl mir mehr…", „Wie fühlt sich das an?", „Was würde dem Rot helfen?".
4. **Stop-Wort-Architektur** — Kind hat jederzeit Veto-Recht ohne Begründung.
5. **Sprachfreier Fallback** — Smileys/Farbflächen als Touch-Antworten, wenn Sprache nicht trägt.
6. **Farsi-Anteile optional** — die Story zeigt deutsche Begrüßung (das Kind versteht). Farsi als Empowerment-Element, wo es trägt (z. B. einzelne tröstende Begriffe in der Bild-Spiegelung). Nicht erzwingen.
7. **Eskalation = Co-Regulation, nicht Tiefenarbeit** — bei Trauma-Markern bleibt der Roboter ruhig und nonverbal. Die Schulsozialarbeiterin im Raum ist die menschliche Fallback-Instanz; der Roboter setzt keine eigene Diagnose und drängt nicht in die Tiefe.
8. **Privacy-by-default** — keine Roh-Inhalts-Persistenz ohne explizite Einwilligung.
9. **Modell:** Opus 4.7 (`claude-opus-4-7`) ist gesetzt. Niedrigere Stufen nur diskutieren, wenn Latenz/Kosten zum Problem werden — Reasoning-Tiefe ist Sicherheits-Argument.

## Konventionen

- **Sprache:** Deutsch für Projekt-Doku und Code-Kommentare. **Demo-Sprache, Roboter-Dialog, Slide-Deck-Inhalt und App-UI-Texte: Englisch** (entschieden 2026-05-28).
- **Voice/LLM-Stack:** ElevenLabs Conversational AI + Anthropic Opus 4.7 + Voice Design Custom Voice. Begründung und Latenz-Annahmen in [`output/tech-stack.md`](output/tech-stack.md).
- **App / Front-End:** noch offen — wird in der App-Architektur-Session festgelegt (Touchscreen-App, Mal-Funktion mit Strich-Clipping auf Silhouetten-Maske).
- **Tests:** Dialog-Architektur muss explizit getestet werden (Stop-Wort, Eskalation, Sicherheits-Constraints, Latenz < 1 s).

## Ein- und Ausgabe

- Eingaben: `input/`
- Erzeugte Artefakte: `output/` (Methoden-Recherche, Slide-Decks, System-Prompts, App-Code-Drafts)
- Plan- und Lessons-Dateien: `tasks/` (anlegen, sobald Implementierungs-Tracking nötig)

## Wiedereinstieg

Bei neuer Session zuerst [`output/projektstarter.md`](output/projektstarter.md)
als Briefing-Übersicht lesen, danach [`output/methoden-grundlagen.md`](output/methoden-grundlagen.md)
für die fundierte Methoden-Synthese. Die zwei Roh-Recherchen sind
nur bei spezifischen Quellen-Fragen nötig.
