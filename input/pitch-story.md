# Pitch-Story — Little Red Beanie

> Vom Nutzer geliefert 2026-05-28, überarbeitete Fassung (Personalisierung, Selbst-Ausmal-Phase, Demo-Sprache **Englisch**). Das ist die EINE Szene, die im Pitch gespielt wird, und der ENGE Scope, den die App abdecken muss. Keine generische Plattform — nur dieses Szenario.
> Meta-Beschreibung auf Deutsch, **Story-Erzählung + Roboter-Dialog auf Englisch**.

## Setting

- **Ort:** „The Oasis" — Betreuungsraum der Schule, an dem Kinder zur Ruhe kommen dürfen, wenn ihnen alles zu viel wird.
- **Personen:**
  - **Kimi**, 8 Jahre alt, lebt erst seit kurzer Zeit mit ihrer Familie in Deutschland (Iran-Hintergrund). Spricht etwas Englisch — eher als Deutsch.
  - Schulsozialarbeiterin / school social worker — begleitet das Kind, schaltet die Puppe ein, ist im Raum.
  - **Little Red Beanie** — eine soziale Puppe mit Bildschirm und Sprachausgabe (englischsprachig). Klassische Stoffpuppe, ca. 50–60 cm: rote Mütze (Namensgeber), wuschelige schwarze Haare, blau-weiß gestreiftes Bretone-Shirt, grüne Hose, gelbe Schuhe. Tablet/Touchscreen in einer gelben Plastikrahmung am Bauch. Visuelle Referenz: [`puppe-fotos/`](puppe-fotos/) (4 Fotos, `puppe-01.jpeg` … `puppe-04.jpeg`).

## Scene

Eight-year-old Kimi walks into the school's quiet room — *The Oasis* — together with the school social worker. It is a place where children come to rest when everything becomes too much. Without saying a word, Kimi walks straight to Little Red Beanie. Her eyes look sad. The social worker can sense that the child is looking for comfort, even though she does not yet have the words. Gently, the social worker switches Little Red Beanie on.

In a calm voice, the puppet greets her: **„Hi there. I'm Little Red Beanie. What's your name?"**

Kimi hesitates for a moment. Then, very softly: „Kimi."

**Little Red Beanie: „Nice to meet you, Kimi. How old are you?"**

She thinks for a moment, then answers carefully: „Eight."

**Little Red Beanie: „Eight years old — that's wonderful, Kimi."**

On the screen, the outline of a little girl appears — dark, curly hair, child-like proportions, clear and strong borders. Above her, in soft, flowing letters, her name: **Kimi**. The figure is only an empty shape — waiting to be filled.

**Little Red Beanie: „Would you like to give yourself a color, Kimi? Which color feels right for you today?"**

Different color fields light up along the edge of the screen — warm, bright, cool tones. Kimi's finger slowly moves past them, until it reaches the black. Carefully, she taps on it.

**Little Red Beanie: „Now color yourself in, Kimi. In your color."**

With calm, circling movements, Kimi traces her finger across the outline. Black fills the little girl figure, layer by layer. She takes her time. The room is quiet. The app keeps the color strictly within the silhouette — the borders are the end; nothing goes past them.

**Little Red Beanie: „You did such a great job, Kimi."**

To understand Kimi's feelings better, Little Red Beanie now shows her different facial expressions. Happy, surprised, scared, and sad faces appear one after another. Softly, the puppet asks: **„Say 'stop' when you see one that feels like you, Kimi."**

When a sad face appears, she looks at it for a long time, and finally whispers: „Stop."

Little Red Beanie recognizes her sadness, and asks gently: **„What's going on, Kimi?"**

But Kimi stays silent. Not because she does not want to answer, but because her words are not enough to describe what she misses. After a long moment, she says only one word: **„Iran."**

In this single word lives all her sadness. Her missed home. Familiar smells, voices, places, and people, suddenly far away.

Then, images from Iran appear on Little Red Beanie's screen: familiar landscapes, streets, colors, and impressions of her homeland. Her expression changes immediately. Her eyes begin to light up, her posture softens. For the first time today, she does not seem alone with her feelings. You can feel her being understood — without many words.

## Abgeleitete App-Flow-Phasen

Aus der Szene ergeben sich fünf klar abgegrenzte Phasen, die die App technisch tragen muss:

1. **Onboarding + Personalisierung** — Audio-Begrüßung, Roboter fragt nach Name und Alter (englisch). Die Alters-Frage lockert das Gespräch auf und gibt der Puppe einen warmen Aufhänger. Name wird zum Anker jeder späteren Anrede.
2. **Selbst-Ausmalen** — Auf dem Bildschirm erscheint die feste Silhouette (kleines iranisches Mädchen mit dunklen Locken, kräftige Rahmenlinien für Finger-Malen) mit dem Namen darüber. Das Kind wählt am Rand eine Farbe und malt die Silhouette mit dem Finger aus. **Übermalen wird software-seitig unterbunden** (Strich-Clipping auf die Silhouetten-Maske) — der Rahmen ist Schluss. „Schwarz" ist Teil der angebotenen Palette.
3. **Gesichts-Karussell mit Stopp-Trigger** — Vier oder mehr Gesichtsausdrücke nacheinander; Spracherkennung auf „stop"; alternativ Touch-Stopp.
4. **Offene Spiegelfrage** — „What's going on, [Name]?" als sokratische Öffnung. Akzeptiert Schweigen, Ein-Wort-Antworten, Sprache.
5. **Multimodale Validierungs-Antwort** — Bilder aus dem genannten Kontext (hier: Iran) aus einem kuratierten Asset-Pool. LLM entscheidet, was gezeigt wird.

## Personalisierung — warum sie zentral ist

- **Name als Beziehungs-Anker:** Jede spätere Anrede nutzt den Namen. „What's going on, Kimi?" trifft anders als „What's going on?". Verstärkt das Gefühl, gesehen zu werden.
- **Alter als Gesprächs-Auflockerung:** Die Puppe nutzt die Antwort, um warm und altersgerecht weiterzusprechen. Im MVP keine Silhouette-Variation — Persona ist fest auf das achtjährige iranische Mädchen ausgelegt.
- **Selbst-Ausmalen statt nur Auswählen:** Das Kind färbt nicht eine abstrakte Fläche, sondern sich selbst. Identifikation und Selbstausdruck verschmelzen. Maltherapeutisch dichter als reine Auswahl.

## Scope-Definition (verbindlich)

- **Wir bauen die App für GENAU diese Szene.** Kein generisches Framework für beliebige Emotionsarbeit.
- Konsequenz: Asset-Pool ist Iran-spezifisch. Demo-Sprache ist **Englisch** (Roboter-Dialog, Slide-Deck, Pitch-Erzählung).
- **Genau eine Silhouette:** kleines iranisches Mädchen, dunkle Locken, kindliche Proportionen, starke Rahmenlinien (Finger-friendly). Keine alternativen Varianten im MVP.
- Mal-Werkzeug strikt auf die Silhouetten-Maske beschränkt — kein Übermalen, kein Out-of-Bounds.
- Skalierung auf andere Szenarien explizit aus dem MVP ausgenommen.

## Sicherheits-Kontext

- **Die Schulsozialarbeiterin ist im Raum.** Sie ist die menschliche Fallback-Instanz. Die Puppe agiert nicht autonom mit dem Kind.
- Eskalations-Logik = nonverbale/verbale Cues an die Sozialarbeiterin, nicht an einen abstrakten externen Empfänger.

## Geklärt 2026-05-28

- **Alter-Eingabe:** wird beim Onboarding erfragt — primär STT auf das gesprochene Wort („eight"), Touch-/Sozialarbeiter-Fallback. Zweck: das Gespräch warm und persönlich starten, nicht für Logik-Verzweigung.
- **Silhouette:** genau eine — kleines iranisches Mädchen, dunkle Locken, starke Rahmenlinien für Finger-Malen.
- **Mal-Mechanik:** software-seitiges Strich-Clipping auf die Silhouetten-Maske. Übermalen ist nicht möglich; das ist eine bewusste UX-Eigenschaft.
- **Persistenz:** Name + Alter session-only. Keine Speicherung über die Session hinaus (DSGVO + EU AI Act).
- **Demo-Sprache:** Englisch — Voice ist englisch (siehe `output/voice-design-prompt.md`), Story-Dialog und Slide-Deck-Inhalt entsprechend englisch. Story-Erzählung im Pitch in englischer Sprache.
