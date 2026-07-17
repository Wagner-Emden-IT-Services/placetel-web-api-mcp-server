# Security Policy

## Unterstuetzte Versionen

| Version | Unterstuetzt       |
|---------|:------------------:|
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Sicherheitsproblem melden

Falls du eine Sicherheitsluecke in diesem Projekt findest, melde sie bitte **nicht** ueber ein oeffentliches GitHub Issue.

Stattdessen sende eine E-Mail an: **security@wagner-emden.de**

Bitte beschreibe:

- Art der Sicherheitsluecke
- Schritte zur Reproduktion
- Moegliche Auswirkungen
- Falls vorhanden: Vorschlag zur Behebung

Wir bestaetigen den Eingang innerhalb von **48 Stunden** und arbeiten an einer Loesung. Nach der Behebung wird ein Security Advisory veroeffentlicht.

## Allgemeine Sicherheitshinweise

- **API-Keys** gehoeren ausschliesslich in `.env`-Dateien, niemals in den Quellcode. `PLACETEL_API_KEY` wird nur aus der Umgebung gelesen.
- Die `.env`-Datei ist in `.gitignore` gelistet und wird nicht committed.
- Der Server validiert alle Tool-Eingaben ueber Zod-Schemas.
- HTTPS wird fuer alle API-Aufrufe an `api.placetel.de` verwendet.
- Der Server laeuft lokal ueber stdio; es wird kein Netzwerk-Port geoeffnet.
