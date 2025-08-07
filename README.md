# Profi Bolus Calc

Eine React + Vite + TypeScript Webanwendung zur Berechnung der Insulindosis basierend auf Kohlenhydraten, Fett-/Eiweiß-/Kaloriengehalt und aktuellem Blutzucker, inklusive FPE-Berechnung und Trendpfeil-Logik. Bootstrap wird für das UI und localStorage für die Speicherung verwendet.

## Medizinischer Disclaimer

**Achtung:** Dieses Tool dient ausschließlich zu experimentellen und nicht-medizinischen Zwecken. Es stellt keine medizinische Beratung dar und ersetzt keinesfalls die individuelle ärztliche Betreuung oder Therapieanpassung. Für die Richtigkeit der Berechnungen und deren Anwendung wird keine Haftung übernommen. Die Nutzung erfolgt auf eigene Verantwortung.

## Funktionen

- Berechnung der Insulindosis aus Kohlenhydraten, Fett/Eiweiß/Kalorien und aktuellem Blutzucker
- FPE (Fett-Protein-Einheiten) Berechnung nach medizinischen Regeln
- Trendpfeil-Empfehlungen
- Speicherung verabreichter Insulindosen und Anzeige der noch wirksamen Restinsulinmenge beim erneuten Aufruf
- Persönliche Einstellungen werden im Browser gespeichert

## Einrichtung

1. Abhängigkeiten installieren:

   ```sh
   npm install
   ```

2. Entwicklungsserver starten:

   ```sh
   npm run dev
   ```

## Nutzung

- Geben Sie die Mahlzeitendaten und Blutzuckerwerte im Formular ein
- Passen Sie die Einstellungen nach Bedarf an
- Speichern Sie Insulindosen, um das aktive Restinsulin zu verfolgen

## Lizenz

MIT
