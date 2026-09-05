<div align="center">

[English](README.md) | [简体中文](README.zh-CN.md) | [Español](README.es.md) | **Deutsch** | [日本語](README.ja.md)

</div>

# keyboard-tester

Open-Source-Tastaturtester für den Browser: **ChromeOS-, Windows- und
Mac-Layouts**, eine Tasten-Zustandsmaschine und kopierfertige Berichte.
TypeScript und Svelte, kein Server, keine Telemetrie. Jeder Tastendruck bleibt
im Browser.

Betreibt [keyboardtestonline.com](https://keyboardtestonline.com).

## Demo ausführen

```bash
npm install
npm run dev
```

Öffne die ausgegebene URL und drücke Tasten auf deiner echten Tastatur; sie
leuchten auf dem Bildschirm-Keyboard auf. Wechsle in der Werkzeugleiste
zwischen Win / Mac / ChromeOS. Mit `npm run build` erstellst du eine statische
Kopie und lieferst `dist-demo/` überall aus.

## Was enthalten ist

- `src/`, der frameworkfreie Kern. Layouts (ANSI, ISO, ChromeOS), die
  Tasten-Zustandsmaschine, Browser-Tasten-Event-Policy, Berichtsformatierung
  und Polling-Rate-Schätzung. Keine DOM-Annahmen über `KeyboardEvent` hinaus.
- `components/`, eine Svelte-5-Testerkomponente, die den Kern rendert. In jede
  Svelte-App einbaubar; Übersetzungstexte sind Props mit englischen
  Standardwerten.

## Keine Windows-Tastatur mit anderen Etiketten

Wer nach einem Chromebook-Tastaturtester sucht, findet meist Windows-Layouts
mit anderen Tastenkappen. Dieses hier ist der Hardware treu:

- Die Search-Taste ersetzt Caps Lock, genau wie bei einem Chromebook.
- Die obere Reihe sind echte Chromebook-Aktionstasten (Zurück, Aktualisieren,
  Vollbild, Helligkeit, Lautstärke), nicht getarnte F1-F12.
- `normalizeChromeosCode` bildet F1-F10 auf die Aktionscodes ab, für
  Chromebooks im Funktionsmodus.
- Kein Nummernblock, kein PrtSc-Block, keine übrigen Win- oder
  Menu-Tasten.

Dieses Layout braucht wirklich, wer Schulgeräte prüft oder ein gebrauchtes
Chromebook kauft, denn die Tasten, die sie beschäftigen, sehen auf einem
Windows-Tester falsch aus.

## Der Datenschutzanspruch ist der Code

"Du lädst nie Tastendrücke hoch" ist leicht gesagt und schwer zu prüfen. Hier
ist es in drei Dateien prüfbar:

- `src/keyState.ts`, die Zustandsmaschine, durch die jeder Tastendruck läuft.
  Reine Funktionen, nur lokaler Zustand.
- `src/keyboardEvents.ts`, welche Browsertasten der Tester schluckt, damit die
  Seite beim Testen keine Verknüpfungen auslöst.
- `src/keyReport.ts`, das aus Tastencodes allein einen Textbericht formatiert.
  Es sieht nie, was du getippt hast, weil nichts erfasst wurde.

Dieses Paket enthält keinen einzigen Netzwerkaufruf. Mehr als diese drei
Dateien gibt es nicht zu prüfen.

## Layouts

- ANSI- und ISO-Tastaturen, mit Windows- und Mac-Beschriftungsvarianten.
- Das ChromeOS-Layout oben, der Hardware treu.
- Die Größenreduktion (full, TKL, 75%, 65%, 60%) hält die Spalten
  ausgerichtet.

## Nutzung ohne Svelte

```ts
import {
  getBoardRows,
  keyStateReducer,
  shouldPreventBrowserKey,
} from "./src/index";

const rows = getBoardRows("chromeos", "full");
let state = emptyKeyState();

document.addEventListener("keydown", (e) => {
  if (shouldPreventBrowserKey(e)) e.preventDefault();
  state = keyStateReducer(state, {
    type: "down",
    press: { code: e.code, key: e.key, location: e.location, repeat: e.repeat },
  });
});
```

## Tests

```bash
npm test
```

42 Tests decken die Zustandsmaschine, Layoutstruktur und Größenfilterung,
ChromeOS-Code-Normalisierung und Berichtsformatierung ab.

## Live-Demo

[keyboardtestonline.com](https://keyboardtestonline.com) läuft mit diesem
Kern. Das ChromeOS-Layout ist unter
[/chromebook](https://keyboardtestonline.com/chromebook). Tests für tote
Tasten, Rollover, Latenz, Polling-Rate, Chatter, CPS und Schalter sind dort
ebenfalls verfügbar.

## Lizenz

MIT
