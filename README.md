# Little Red Beanie

Sozialarbeit-Projekt: eine sprechende Stoffpuppe mit Tablet-Bildschirm im Bauch, die
Kindern und sozial beeinträchtigten Menschen hilft, Emotionen zu erkennen und
auszudrücken — über einen mehrstufigen, niedrigschwelligen Dialog:
**Personalisierung (Name + Alter) → Selbst-Ausmalen einer eigenen Silhouette →
Gesichts-Karussell → offene Frage → multimodale Spiegel-Antwort (Bilder)**.

Demo-Sprache und Roboter-Dialog sind **Englisch**. Pitch-Szene: ein achtjähriges
iranisches Mädchen („Kimi") in der Schul-„Oase", begleitet von einer
Schulsozialarbeiterin.

## Projekt-Doku

Alle Doku liegt **auf Deutsch** im Repo (außer der Story und den Roboter-Zeilen,
die der Demo entsprechend Englisch sind).

- **[`CLAUDE.md`](CLAUDE.md)** — Hauptdoku mit Konzept, Demo-Szenario, Phasen-Tabelle, physischer Puppen-Beschreibung, Architektur, Designprinzipien. Einstiegspunkt für jede Session.
- **[`input/pitch-story.md`](input/pitch-story.md)** — die genaue Pitch-Szene (Englisch), inklusive Phasen-Ableitung.
- **[`input/puppe-fotos/`](input/puppe-fotos/)** — 4 Fotos der Puppe (visuelle Referenz).
- **[`output/methoden-grundlagen.md`](output/methoden-grundlagen.md)** — Methoden-Recherche mit Quellen (Plutchik, Adams/Osgood, Maltherapie, sokratische Methode, Trauma-Sensitivität).
- **[`output/projektstarter.md`](output/projektstarter.md)** — Pitch-Brief mit Story-Arc, 5-Slide-Architektur, Wirkfaktoren.
- **[`output/tech-stack.md`](output/tech-stack.md)** — Architektur-Entscheidung (ElevenLabs Conversational AI + Opus 4.7 + Voice Design), Latenz-Erwartungen, Compliance-Hinweise.
- **[`output/voice-design-prompt.md`](output/voice-design-prompt.md)** — Voice-Design-Prompts (Englisch) für ElevenLabs, drei Varianten, Sample-Text, Bewertungskriterien.
- **[`output/wetterbericht-recherche.md`](output/wetterbericht-recherche.md)** und **[`output/farb-emotions-recherche.md`](output/farb-emotions-recherche.md)** — Roh-Recherchen mit voller Quellenliste.

## Status

Stand 2026-05-28: Methoden-Recherche, Story, Tech-Stack-Entscheidung und Voice-Design-Prompt sind durch.
Noch offen: System-Prompt für Opus 4.7, App-Architektur (Front-End, Mal-Funktion mit Strich-Clipping), Iran-Asset-Pool, 5-Slide-Pitch-Deck.
