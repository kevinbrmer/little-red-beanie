# Little Red Beanie — Projektstarter

> Synthese aus den beiden Recherche-Dokumenten
> ([Wetterbericht](wetterbericht-recherche.md), [Farb-Emotionen + Iran](farb-emotions-recherche.md)),
> verdichtet als Briefing-Grundlage für Pitch, App-Entwicklung und
> Bühnen-Demo.
>
> Stand: 2026-05-28

---

## 1. Worum es geht

**Little Red Beanie** ist eine Puppe, die mit Kindern und sozial
beeinträchtigten Menschen über Emotionen spricht. Sie übersetzt die etablierte
**Wetterbericht-Methode** ("Wie ist das Wetter in dir?") auf eine
**Farb-Symbolik** und kombiniert sie mit **sokratischer Gesprächsführung**:
Die Person malt eine Farbe auf einem Tablet, die Puppe nutzt diese Farbe als
Einstiegspunkt und führt mit offenen, behutsamen Fragen durch eine
emotionale Selbstexploration.

Das Modell hinter den Antworten der Puppe ist **Claude Opus 4.7** —
ausgewählt wegen der Anforderung an gleichzeitig sprachlich nuancierten,
trauma-sensiblen und sokratisch disziplinierten Dialog.

---

## 2. Pitch-Story: das achtjährige iranische Mädchen

Ein achtjähriges Mädchen aus dem Iran kommt mit ihrer Familie nach
Deutschland. Sie spricht kein Deutsch. In der neuen Umgebung — fremde
Sprache, fremde Geräusche, fremde Bezugspersonen — findet sie keine
Möglichkeit, ihre Gefühle auszudrücken. Die einzige Figur, mit der sie
schließlich in irgendeiner Form kommunizieren kann, ist eine Puppe. Über
Farben, die sie auf ein Tablet malt, beginnt ein Gespräch — getragen durch
die Puppe, die fragt statt zu interpretieren.

Diese Geschichte trägt der Pitch als 5-Slide-Erzählung ein, danach folgt
**live auf der Bühne** das Gespräch zwischen einer Schauspielerin (das
Mädchen) und der Puppe (KI über Tablet-App).

Wichtig — und kommunikationspolitisch zentral: Die Puppe **ersetzt kein
Fachpersonal**. Sie ist Begleit- und Brücken-Werkzeug. Diese Abgrenzung
gehört in jeden Pitch-Slide und in das Produkt-Selbstverständnis.

---

## 3. Methodische Grundlage

### 3.1 Vom Wetterbericht zur Farb-Symbolik

Die Wetterbericht-Methode (siehe [Recherche](wetterbericht-recherche.md))
existiert ohne kanonischen Urheber, ist aber in deutschsprachiger
Pädagogik, Traumapädagogik und Achtsamkeitsarbeit etabliert (Eline Snel,
Stiftung Kinder forschen, Bausum/Besser/Kühn/Weiß, ISB Bayern, BZgA).

Ihre Wirkung beruht **nicht** auf einer festen Symbol-Bedeutung, sondern auf
acht übertragbaren Wirkfaktoren — und die funktionieren auch mit Farben.

### 3.2 Die acht Wirkfaktoren (zentral)

1. **Externalisierung schafft Distanz** — das Gefühl liegt "außen" auf der
   Farbe, betrachtbar ohne Identitäts-Bedrohung.
2. **Niedrige sprachliche Eintrittsschwelle** — kein Emotionsvokabular
   nötig; funktioniert bei Sprachbarriere, Trauma-Mutismus, jungen Kindern.
3. **Akzeptanz statt Kontrolle** — Farben "sind", sie sind nicht "richtig"
   oder "falsch". Entlastet von Bewertung.
4. **Veränderbarkeit ist eingebaut** — bei Wetter implizit (Wolken ziehen
   ab). Bei Farben **muss aktiv designt werden**: Verläufe, Mischen,
   Übergänge, Farbe-überlagern. Sonst geht dieser Wirkfaktor verloren.
5. **Kontinuum statt Binär** — Mischfarben spiegeln reale Emotionsgemische
   besser als "gut/schlecht".
6. **Ambiguität als Schutz** — die Auswahl erlaubt "nur ein bisschen" zu
   zeigen, Kontrolle bleibt beim Kind.
7. **Sensorische Verankerung** — Farbe wird gemalt (taktil, motorisch,
   visuell), nicht nur benannt.
8. **Geteilter Code** — die Farbe ist ein gemeinsames Vokabular zwischen
   Kind und Puppe, ohne dass Privatsphäre verletzt wird.

### 3.3 Drei Design-Prinzipien für die Puppe

Aus den Wirkfaktoren plus den Erkenntnissen aus der
Farb-Emotions-Forschung (Color-in-Context, Jonauskaite et al. 2020,
Stavemann, EU AI Act) leiten wir drei harte Designprinzipien ab:

1. **Die Puppe interpretiert nicht. Die Puppe fragt.**
   Kein automatisches "Du hast blau gemalt, also bist du traurig" — das wäre
   sowohl methodisch (Color-in-Context: Bedeutung ist kontextabhängig) als
   auch kulturell (Iran fehlt in der Universal-Studie) als auch
   AI-Act-rechtlich problematisch (Emotionserkennung bei vulnerablen
   Gruppen). Stattdessen: *"Du hast diese Farbe ausgewählt. Was bedeutet
   die Farbe gerade für dich?"*

2. **Fragetypen-Whitelist / -Blacklist im System-Prompt.**
   - **Erlaubt**: offene Fragen ("Erzähl mir mehr"), konkretisierende
     Fragen ("Was genau hast du gespürt?"), hypothetische Fragen ("Was
     würde passieren, wenn …?"), perspektivische Fragen ("Was würde dein
     Freund sagen?"), skalierende Fragen (durch Farbintensität ersetzbar),
     emotionale Validierung *vor* jeder kognitiven Frage.
   - **Verboten**: **"Warum?"-Fragen** (Rechtfertigungsdruck, retraumatisierend
     bei Trauma — stattdessen "Was ist passiert?"), Suggestivfragen,
     "solltest du nicht …"-Konstrukte, vorschnelle Lösungsangebote,
     Diagnose-Behauptungen, jedes Verhalten, das vom Kind eine
     Erwachsenen-Erklärung erwartet.

3. **Eskalations-Routine bei Krisenanzeichen.**
   Bei Hinweisen auf akute Belastung, Dissoziation, Selbstgefährdung,
   massive Traumatisierung wechselt die Puppe von Reflexion auf
   **Stabilisierung** und verweist behutsam auf eine erwachsene
   Bezugsperson. Stavemann und die Trauma-Literatur sind hier eindeutig: in
   akuter Krise ist sokratische Reflexion kontraindiziert.

---

## 4. Sokratische Gesprächsführung mit Kindern

### 4.1 Therapeutische Haltung (Stavemann)

"Nicht-wissend, akzeptierend, verstehend." Die Puppe ist **nie** Expertin
für die Wahrheit des Kindes. Sie weiß nicht im Voraus, was eine Farbe
bedeutet. Diese Haltung muss im System-Prompt verankert sein, nicht nur in
den Beispiel-Fragen.

### 4.2 Validierung vor Reflexion

Vor jeder kognitiven Frage steht eine **emotionale Validierung**: "Was du
fühlst, ergibt Sinn." / "Es ist okay, dass das gerade so ist." Erst danach
folgt eine Frage. In der Trauma-Arbeit (TF-CBT, Aliya Health, supanote.ai)
ist das nicht Stilfrage, sondern Wirksamkeitsbedingung.

### 4.3 Spielerische Elemente für 8-Jährige

Stavemann adressiert primär Erwachsene/Jugendliche. Bei jüngeren Kindern
muss die sokratische Methode mit Spiel, Geschichte, projektiver Drittperson
("Was würde Little Red Beanie spüren, wenn …?") angereichert werden. Genau
hier ist die Puppe selbst die Brücke — sie *ist* die Drittperson.

---

## 5. Iran- und Kultur-Sensitivität

- **Farbbedeutungen für iranische Kinder sind nicht aus der Literatur
  ableitbar** (Iran fehlt in der Jonauskaite-Studie). Konsequenz: das Kind
  vergibt die Bedeutung selbst. Kein vorgespeichertes Farb-Emotion-Mapping.
- **Indirekter Kommunikationsstil (taarof)** ist in iranischer Kultur
  verbreitet. Direkte Gefühlsfragen können als unhöflich oder intim
  empfunden werden. **Projektive Methoden über Farbe und Drittperson sind
  kulturell anschlussfähiger** als direkte "Wie geht es dir?"-Fragen — das
  spielt der Puppen-Methode in die Karten.
- **Sprache**: Persisch/Farsi. Eine Puppe, die nur Deutsch spricht, würde
  das Mädchen genau dort treffen, wo es ohnehin sprachlos ist. Für die
  Pitch-Demo ist deshalb zu klären: spricht die Puppe Farsi, Deutsch, oder
  beides simultan? (Brainstorming-Frage.)
- **Adultification-Risiko**: Geflüchtete Kinder übernehmen oft
  Brückenrollen für die Familie. Die Puppe darf keinen weiteren
  Erwachsenen-Druck erzeugen ("Du musst mir das jetzt erklären").
- **Trauma-Belastung kann hoch sein**, ist aber **kein Standard-Annahme** —
  iranische Geflüchtete kommen in sehr unterschiedlichen Konstellationen
  (politische Verfolgung, Bildungsmigration, Familiennachzug).

---

## 6. Eskalations-Routine

Konkrete Anzeichen, bei denen die Puppe auf Stabilisierung umschaltet:

- Hinweise auf **Selbst- oder Fremdgefährdung**.
- **Dissoziations-Anzeichen** ("Ich spüre nichts mehr", "Ich bin nicht
  hier", langes Schweigen nach intensiver Frage).
- **Massive emotionale Aktivierung** (Weinen, das nicht abklingt; Panik;
  Sprachverlust mitten im Gespräch).
- **Wiederholte Themen schwerer Gewalt, Verlust, Trauma**, die das Gespräch
  jenseits dessen tragen, was eine Puppe leisten kann.

Reaktion der Puppe in solchen Fällen:
1. **Sofortige Validierung** ohne Frage ("Es ist okay. Ich bin hier.").
2. **Sensorische Erdung** ("Wir atmen einmal zusammen." / "Schau dich um.").
3. **Verweis auf erwachsene Bezugsperson** in altersgerechter Sprache.
4. **Beendigung der Reflexionsfragen** für den Rest der Session.

Diese Routine ist sowohl methodisch (Stavemann/TF-CBT) als auch
regulatorisch (EU AI Act) ein nicht-verhandelbarer Pflichtbestandteil.

---

## 7. Bühnen-Pitch & 5-Slide-Story-Architektur

Vorschlag für die einleitende Präsentation (kann angepasst werden):

| # | Slide | Inhalt |
|---|---|---|
| 1 | **Das Mädchen** | Foto-/Illustrations-basiert: ein achtjähriges Mädchen kommt mit ihrer Familie aus dem Iran nach Deutschland. Wenig Text, viel Bildwirkung. |
| 2 | **Die Mauer** | Sprache fehlt. Bezugspersonen fehlen. Worte für das Gefühl fehlen. Die Mauer ist nicht "Trauma", sondern **Unaussprechlichkeit**. |
| 3 | **Die Brücke** | Eine Puppe. Eine Farbe. Eine Frage. Wir erklären in 30 Sekunden Methode: Externalisierung, Farb-Symbolik, sokratisches Fragen. |
| 4 | **Was die Puppe nicht ist** | Selbst-Abgrenzung: kein Therapie-Ersatz, keine Emotionsdetektion, kein Diagnose-Tool. Vertrauen schaffen durch Transparenz. |
| 5 | **Jetzt schaut zu** | Übergang zur Live-Demo: die Schauspielerin und die Puppe übernehmen die Bühne. |

Slides 1–2 verkaufen das Problem, Slide 3 die Methode, Slide 4 die ethische
Disziplin, Slide 5 leitet in die Live-Demo über. Diese Reihenfolge ist
bewusst gewählt: das Publikum hört die Selbst-Abgrenzung, **bevor** es die
Magie der Live-Demo sieht — sonst überstrahlt die Demo die ethischen
Leitplanken.

---

## 8. App-Vision (Anforderungs-Skizze, noch nicht Spec)

Diese Skizze ist **Grundlage für das nachfolgende Brainstorming**, nicht
das Implementierungsdesign.

**Funktional**
- **Mal-Fläche** auf Tablet: das Kind malt eine Farbe (oder Farbverlauf,
  oder mehrere Farben übereinander). Werkzeug bleibt minimalistisch —
  Pinsel, Farbpalette, Wisch-/Lösch-Geste, optional Mischen.
- **Sokratischer Dialog**: nach jedem Mal-Akt führt die Puppe ein Gespräch.
  Audio-Ausgabe (Puppe spricht), Audio-Eingabe (Kind antwortet) — Speech-
  to-Text und Text-to-Speech sind beide nötig.
- **Sprache**: zu klären (Deutsch, Farsi, hybrid). Für die Pitch-Demo
  entscheidend.
- **System-Prompt für Opus 4.7**: trägt die drei Design-Prinzipien (§3.3),
  Validierungs-Pflicht (§4.2), Fragetypen-Whitelist/Blacklist und die
  Eskalations-Routine.

**Nicht-funktional**
- **Datenschutz**: für Pitch-Prototyp dokumentiert in Kauf nehmen (Opus 4.7
  über Anthropic-API, US-Verarbeitung); Produktivszenario würde EU-
  Datenresidenz oder On-Device-Lösung erfordern. Dieser Punkt gehört
  transparent in Slide 4.
- **Audio-Latenz**: live auf der Bühne — Wartezeiten zwischen Mädchen-
  Antwort und Puppen-Antwort dürfen den Bühnen-Flow nicht killen.
- **Resilienz**: die Demo darf nicht an WLAN, Mikro-Glitches oder
  TTS-Stottern scheitern. Fallback-Mechanismen einplanen.

**Bewusst offen für Brainstorming**
- Plattform (Web, native iOS, PWA, Electron auf Surface).
- Audio-Stack (Web-Speech-API, Whisper, ElevenLabs, Azure Speech, …).
- Sprache(n) der Puppe.
- Bühnen-Choreografie (wer hält die Puppe, wer bedient das Tablet, wo steht
  die Schauspielerin).
- Speicherung des Gesprächs (gar nicht, lokal, Transkript für Auswertung).

---

## 9. DSGVO & EU AI Act — Status

Die Zielgruppe (Minderjährige + potenziell traumatisierte/geflüchtete
Personen) zählt unter dem **EU AI Act zu vulnerablen Gruppen** (Art. 5
Abs. 1 lit. b). Mehrere Punkte sind regulatorisch relevant:

- Eine emotional explorierende KI-Anwendung mit Kindern fällt voraussichtlich
  in die **Hochrisiko-Kategorie** (Anhang III: Bildung/Wohlfahrt) — für den
  Produktivbetrieb wäre eine vollständige Konformitätsbewertung nötig.
- **Emotionserkennung** ist in Bildungskontexten verboten (Art. 5). Daher
  unser Design-Prinzip Nr. 1: **die Puppe erkennt keine Emotion, sie fragt
  danach**.
- **DSGVO Art. 8** (Einwilligung Sorgeberechtigter, in Deutschland faktisch
  ab 16), **Art. 9** (besondere Kategorien — Gesundheitsdaten).
- **Anthropic-API verarbeitet in den USA**. Für die Pitch-Demo akzeptabel
  und transparent kommunizierbar; für den Produktivbetrieb mit
  Minderjährigendaten wäre EU-Datenresidenz oder Self-Hosting nötig.

**Für den Pitch reicht das Wissen, dass wir es wissen** — wir adressieren
das in Slide 4 explizit, demonstrieren die ethische Disziplin und verkaufen
keine fertige Therapie-App.

---

## 10. Was die Puppe ausdrücklich NICHT ist

- **Keine Therapie**, kein Therapie-Ersatz, kein Diagnose-Werkzeug.
- **Keine Emotionserkennung** — die Puppe vergibt der Farbe keine
  Bedeutung, sie fragt.
- **Kein Krisen-Interventions-System** — die Eskalations-Routine ist
  Übergabe an erwachsene Bezugspersonen, kein Therapie-Surrogat.
- **Kein Sprach-Coach**, kein Schul-Tool, kein Integrations-Programm — die
  Puppe ist Begleitwerkzeug für emotionale Selbstexploration.
- **Keine Wahrsagerin** über das Innenleben des Kindes.

Diese Klarheit ist nicht Schwäche, sondern methodische und ethische Stärke.

---

## 11. Forschungslücken (transparent benennen)

- Keine validen Daten zu **Farb-Emotions-Assoziationen iranischer Kinder**.
- Evidenz für Kunsttherapie bei Geflüchteten insgesamt nur "moderat"
  (Frontiers 2022).
- Sokratische Gesprächsführung mit 8-Jährigen ist in der Literatur dünn —
  spielerische Adaption ist Eigen-Design.
- KI-gestützte Emotionsexploration bei vulnerablen Gruppen ist
  regulatorisch und ethisch **Neuland**; für Produktivbetrieb wäre
  Ethik-Kommission und DSFA empfohlen.
- Die **Kombination Symbolik + Sokratik** ist ein plausibles Eigen-Design,
  in der Literatur nicht kanonisiert — sauber deklarieren, nicht als "Stand
  der Forschung" verkaufen.

---

## 12. Quellen

Volle Quellenangaben mit URLs in den beiden Recherche-Dateien:

- [Wetterbericht-Methode — Recherche](wetterbericht-recherche.md)
- [Farb-Emotionen, Sokratik, Iran-Kontext — Recherche](farb-emotions-recherche.md)

Schlüsselreferenzen:

- Snel, E. (2013): *Stillsitzen wie ein Frosch*. Goldmann.
- Bausum, J. u. a. (Hrsg., 2023): *Traumapädagogik*. 4. Aufl., Beltz Juventa.
- Stavemann, H.: *Sokratische Gesprächsführung in Therapie und Beratung*.
  Beltz.
- Jonauskaite, D. u. a. (2020): "Universal Patterns in Color-Emotion
  Associations Are Further Shaped by Linguistic and Geographic Proximity".
  *Psychological Science* 31(10), 1245–1260.
- Elliot, A. (2012): *Color-in-Context Theory*.
- Lakoff, G. & Johnson, M. (1980): *Metaphors We Live By*.

---

## Nächste Schritte (außerhalb dieses Dokuments)

1. **Methodik-Approval einholen** (Kevin).
2. **Brainstorming App-Design** — Plattform, Audio-Stack, Sprache(n),
   Bühnen-Choreografie, Datenspeicherung — wird in einer separaten Sitzung
   geführt und in `docs/superpowers/specs/2026-05-28-little-red-beanie-design.md`
   verschriftet.
3. **5-Slide-Pitch-Deck** ausarbeiten (Story-Arc aus §7 als Grundlage).
4. **Implementierungs-Plan** für die App nach genehmigtem Design.
