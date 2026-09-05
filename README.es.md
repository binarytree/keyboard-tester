<div align="center">

[English](README.md) | [简体中文](README.zh-CN.md) | **Español** | [Deutsch](README.de.md) | [日本語](README.ja.md)

</div>

# keyboard-tester

Probador de teclado de código abierto para el navegador: **distribuciones
ChromeOS, Windows y Mac**, una máquina de estados para las teclas e informes
listos para copiar. TypeScript y Svelte, sin servidor, sin telemetría. Cada
pulsación se queda en el navegador.

Impulsa [keyboardtestonline.com](https://keyboardtestonline.com).

## Ejecutar la demo

```bash
npm install
npm run dev
```

Abre la URL que imprime el comando. Pulsa teclas en tu teclado real y se
iluminarán en el teclado en pantalla. Cambia entre Win / Mac / ChromeOS en la
barra de herramientas. Compila una copia estática con `npm run build` y sirve
`dist-demo/` en cualquier lugar.

## Qué contiene

- `src/`, el núcleo sin framework. Distribuciones (ANSI, ISO, ChromeOS), la
  máquina de estados de teclas, la política de eventos del navegador, el
  formato de informes y la estimación de frecuencia de sondeo. No asume nada
  del DOM más allá de `KeyboardEvent`.
- `components/`, un componente de prueba en Svelte 5 que renderiza el núcleo.
  Insértalo en cualquier app Svelte; los textos de traducción son props con
  valores por defecto en inglés.

## No es un teclado Windows con otras etiquetas

Si buscas un probador de teclado Chromebook, casi todo lo que encuentras son
distribuciones Windows disfrazadas. Este es fiel al hardware:

- La tecla Search sustituye a Caps Lock, exactamente como en un Chromebook.
- La fila superior son teclas de acción reales de Chromebook (Atrás,
  Recargar, Pantalla completa, brillo, volumen), no F1-F12 disfrazados.
- `normalizeChromeosCode` convierte F1-F10 en los códigos de acción para
  Chromebooks en modo de teclas de función.
- Sin teclado numérico, sin bloque PrtSc, sin teclas Win o Menu sobrantes.

Esta es la distribución que necesita de verdad un control informático escolar
o quien compra un Chromebook de segunda mano, porque las teclas que les
preocupan son las que se ven mal en un probador Windows.

## La promesa de privacidad es el código

"Nunca subes tus pulsaciones" es fácil de decir y difícil de verificar. Aquí
se verifica en tres archivos:

- `src/keyState.ts`, la máquina de estados por la que pasa cada pulsación.
  Funciones puras, solo estado local.
- `src/keyboardEvents.ts`, qué teclas del navegador traga el probador para que
  la página no active atajos mientras pruebas.
- `src/keyReport.ts`, que formatea un informe de texto solo con los códigos de
  las teclas. Nunca ve lo que escribiste, porque no se recopiló nada.

Este paquete no contiene ninguna llamada de red. No hay nada más que revisar
que esos tres archivos.

## Distribuciones

- Teclados ANSI e ISO, con variantes de etiquetas Windows y Mac.
- La distribución ChromeOS descrita arriba, fiel al hardware.
- El colapso por tamaño (full, TKL, 75%, 65%, 60%) mantiene las columnas
  alineadas.

## Uso sin Svelte

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

42 tests cubren la máquina de estados, la estructura de distribuciones y el
filtrado por tamaño, la normalización de códigos ChromeOS y el formato de
informes.

## Demo en vivo

[keyboardtestonline.com](https://keyboardtestonline.com) ejecuta este núcleo.
La distribución ChromeOS está en
[/chromebook](https://keyboardtestonline.com/chromebook). También están las
pruebas de teclas muertas, rollover, latencia, frecuencia de sondeo, chatter,
CPS e interruptores.

## Licencia

MIT
