# Little Red Beanie

> 🏆 **Gewinner des Audience Award (Publikumspreis) bei der Nexster Startup Safari 2026.**

Ein sozialer Roboter in Gestalt einer Stoffpuppe mit Touchscreen im Bauch, der
Kindern hilft, Emotionen zu erkennen und auszudrücken — über einen
mehrstufigen, niedrigschwelligen Sprach- und Touch-Dialog. Gedacht für die
Schul-„Oase" (den Ruheraum), im Beisein einer Schulsozialarbeiterin. **Kein**
klinisches Diagnose- oder Therapie-Werkzeug — die Puppe ergänzt eine Fachkraft,
sie ersetzt sie nicht.

**Zielgruppe:** Kinder mit eingeschränktem Emotions-Vokabular — sprachlich
limitiert (Flucht-/Migrationshintergrund), neurodivergent oder traumatisiert.

Demo-Sprache und Roboter-Dialog sind **Englisch**. Die Pitch-Szene zeigt
„Kimi", ein achtjähriges iranisches Mädchen, das erst seit Kurzem in
Deutschland lebt.

---

## Was die Puppe macht — der Gesprächsverlauf

Die App führt das Kind durch **fünf Phasen**. Sie kombiniert gesprochenen
Dialog (Sprachausgabe + Spracherkennung) mit einfachen Touch-Interaktionen auf
dem Bauch-Bildschirm. Das Kind färbt eine Silhouette von sich selbst, wählt ein
Gesicht, das zu seiner Stimmung passt, und wird am Ende mit vertrauten Bildern
und Klängen getröstet — nicht gedeutet, sondern gespiegelt.

So lief das Gespräch in der Live-Demo (Roboter-Zeilen englisch):

| Phase | Was passiert | Roboter (englisch) | Kind |
|------|--------------|--------------------|------|
| **1 — Begrüßung & Personalisierung** | Die Sozialarbeiterin schaltet die Puppe ein. Sie fragt nach Name und Alter und merkt sich beides für den Rest des Gesprächs. | „Hi there. I'm Little Red Beanie. What's your name?" · „Nice to meet you, Kimi. How old are you?" · „Eight years old — that's wonderful, Kimi." | „Kimi." … „Eight." |
| **2 — Sich selbst ausmalen** | Eine Silhouette eines Kindes mit dem Namen darüber erscheint. Das Kind wählt eine Farbe; ein Tipp füllt die Kleidung der Figur (Haar und Haut bleiben). | „Which color feels right for you today, Kimi?" · „Now color yourself in, Kimi. In your color." · „You did such a great job, Kimi." | wählt **Schwarz**, tippt die Silhouette |
| **3 — Gesichts-Karussell** | Die eben gefärbte Silhouette bleibt; ihr Gesicht wechselt durch happy / surprised / scared / sad. Das Kind tippt, wenn der passende Ausdruck erscheint. | „Tap when you see the face that feels like you, Kimi." · „You picked this one, Kimi." | tippt beim **traurigen** Gesicht |
| **4 — Sanfte Einladung** | Eine warme, offene Frage — ohne „Warum?", ohne Drängen. Schweigen ist erlaubt. | „Do you want to talk about it, Kimi?" | „I miss my home in Iran." |
| **5 — Comforting Mirror** | Die Puppe spiegelt das Gesagte kurz und bietet Trost an. Sagt das Kind „yes", erscheinen ruhige Bilder des iranischen Meeres mit sanftem Wellenrauschen und leiser traditioneller Musik. | „Iran…" · „Would you like to see the sea, Kimi?" → bei „Yes": zeigt die Küste des Iran | „Yes." |

Der gestalterische Kern: Die Puppe **fragt und spiegelt, statt zu
interpretieren**. Es gibt keine feste „Farbe = Gefühl"-Zuordnung — die
Bedeutung entsteht im Gespräch. Bei belastenden Themen bleibt die Puppe ruhig
und nonverbal; die Schulsozialarbeiterin im Raum ist die menschliche Instanz.

Die vollständige, wörtliche Szene steht in
[`input/pitch-story.md`](input/pitch-story.md).

---

## Wie es gebaut ist

Für den Pitch wurde eine fokussierte, voll funktionsfähige **Web-PWA** gebaut,
die genau diese eine Szene end-to-end trägt:

- **Frontend:** React + Vite + TypeScript + Tailwind, läuft im Chrome-Vollbild
  als Kiosk auf einem Android-Tablet (das „im Bauch" der Puppe steckt). Code in
  [`app/`](app/).
- **Voice-Layer:** [ElevenLabs Conversational AI](https://elevenlabs.io/)
  bündelt Spracherkennung, Turn-Taking und Sprachausgabe in einem Dienst. Als
  „Gehirn" hängt **Claude Opus 4.7** als LLM-Backend daran; die Stimme ist eine
  warm-kindzugewandte Custom Voice.
- **Dialog-Steuerung:** Die fünf Phasen werden in der App per Timer und
  Touch-/Sprach-Events orchestriert; der Agent ruft bei Bedarf Werkzeuge auf
  (`show_assets` für die Trost-Bilder/-Klänge, `mark_escalation` als
  Sicherheits-Signal). Ein ausführlicher System-Prompt erzwingt die sokratische
  Frage-Architektur und Sicherheits-Regeln.
- **Push-to-Talk:** Das Mikrofon ist standardmäßig stumm und öffnet nur,
  während gesprochen wird — robust gegen Bühnenlärm.
- **Deployment:** Containerisiert via Docker + nginx, ausgeliefert über Coolify
  als installierbare PWA (Manifest, Service Worker, Kiosk-Hardening).

**Datenschutz by design:** Name und Alter bleiben rein session-lokal, es gibt
keine Persistenz von Gesprächsinhalten. Bei Minderjährigen und emotionsnaher
Interaktion sind DSGVO und EU AI Act durchgängig mitgedacht.

---

## Repo-Aufbau

Alle Projekt-Doku liegt **auf Deutsch** im Repo (außer der Story und den
Roboter-Zeilen, die der englischen Demo entsprechen).

- **[`CLAUDE.md`](CLAUDE.md)** — Hauptdoku: Konzept, Demo-Szenario,
  Phasen-Tabelle, physischer Puppen-Steckbrief, Architektur, Designprinzipien.
  Einstiegspunkt für jede Session.
- **[`HANDOFF.md`](HANDOFF.md)** — technischer Snapshot der App: Phasen-Mechanik,
  Voice-Layer, ElevenLabs-Agent-Settings, bekannte Limitationen.
- **[`app/`](app/)** — die Web-PWA (React/Vite/TS/Tailwind, Dockerfile,
  nginx-Config, PWA-Shell).
- **[`prompts/`](prompts/)** — System-Prompts der Puppe: der tatsächlich
  deployte Prompt inkl. Voice-Details
  ([`system-prompt-elevenlabs.md`](prompts/system-prompt-elevenlabs.md)) und die
  Arbeitsfassung ([`system-prompt-v1.md`](prompts/system-prompt-v1.md)) sowie
  Iran- und Audio-Asset-Manifeste.
- **[`evals/`](evals/)** — deterministische Test-Suite für Dialog-Architektur
  und Sicherheits-Constraints.
- **[`input/pitch-story.md`](input/pitch-story.md)** — die wörtliche Pitch-Szene
  (Englisch) inkl. Phasen-Ableitung. **[`input/puppe-fotos/`](input/puppe-fotos/)**
  — 4 Fotos der physischen Puppe.
- **`output/`** — Recherche und Konzeption:
  [`methoden-grundlagen.md`](output/methoden-grundlagen.md) (Plutchik,
  Adams/Osgood, Maltherapie, Sokratik, Trauma-Sensitivität),
  [`projektstarter.md`](output/projektstarter.md) (Pitch-Brief, Story-Arc),
  [`tech-stack.md`](output/tech-stack.md) (Architektur-Entscheidung),
  [`voice-design-prompt.md`](output/voice-design-prompt.md),
  [`system-prompt-design.md`](output/system-prompt-design.md) (kanonische Spec
  für Post-Pitch-Iteration) sowie die Roh-Recherchen
  [`farb-emotions-recherche.md`](output/farb-emotions-recherche.md) und
  [`wetterbericht-recherche.md`](output/wetterbericht-recherche.md).

---

## Lokal starten

```bash
cd app
npm install
cp .env.example .env.local   # ELEVENLABS_API_KEY + VITE_ELEVENLABS_AGENT_ID eintragen
npm run dev                  # http://localhost:5173
```

Im Browser: *Tap to begin* → **SPACE gedrückt halten und sprechen** (Push-to-Talk),
beginnend mit dem Namen („Kimi"). Details und Agent-Settings in
[`HANDOFF.md`](HANDOFF.md).

---

## Status

Stand 2026-06-01: Die Pitch-Variante v1.0 ist gebaut, lief in der Live-Demo
end-to-end durch und hat den **Audience Award der Nexster Startup Safari 2026**
gewonnen. Die kanonische Spec für eine vollwertige Post-Pitch-Iteration (echtes
Strich-Clipping beim Malen, breiterer Asset-Pool, Failover-Audio) bleibt in
[`output/system-prompt-design.md`](output/system-prompt-design.md) und
[`output/methoden-grundlagen.md`](output/methoden-grundlagen.md) dokumentiert.
