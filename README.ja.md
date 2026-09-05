<div align="center">

[English](README.md) | [简体中文](README.zh-CN.md) | [Español](README.es.md) | [Deutsch](README.de.md) | **日本語**

</div>

# keyboard-tester

ブラウザで動くオープンソースのキーボードテスター: **ChromeOS・Windows・Mac
レイアウト**、キー状態マシン、コピー対応のレポート。TypeScript と Svelte 製、
サーバー不要、テレメトリなし。すべてのキー入力はブラウザ内に留まります。

[keyboardtestonline.com](https://keyboardtestonline.com) を支えています。

## デモを実行

```bash
npm install
npm run dev
```

表示された URL を開き、実際のキーボードのキーを押すと、画面上のキーボードが
連動して光ります。ツールバーで Win / Mac / ChromeOS を切り替えられます。
`npm run build` で静的コピーを生成し、`dist-demo/` をどこにでも配信できます。

## 内容

- `src/`: フレームワーク非依存のコア。レイアウト(ANSI・ISO・ChromeOS)、
  キー状態マシン、ブラウザのキーイベントポリシー、レポート整形、
  ポーリングレート推定。`KeyboardEvent` 以外の DOM 前提はありません。
- `components/`: コアを描画する Svelte 5 テスターコンポーネント。任意の
  Svelte アプリに組み込めます。翻訳文字列は props で、デフォルトは英語です。

## ラベルを変えただけの Windows キーボードではない

Chromebook キーボードテスターを検索すると、ほとんどはキーキャップを
差し替えた Windows レイアウトです。これはハードウェアに忠実です:

- Search キーが Caps Lock の位置にあり、実際の Chromebook と同じです。
- 最上段は本物の Chromebook アクションキー(戻る・再読み込み・全画面・
  輝度・音量)であり、F1-F12 の偽装ではありません。
- `normalizeChromeosCode` は F1-F10 をアクションコードに変換し、
  ファンクションキーモードの Chromebook に対応します。
- テンキーなし、PrtSc ブロックなし、余分な Win・Menu キーなし。

学校の IT 点検や中古 Chromebook の購入者が本当に必要とするレイアウトです。
彼らが心配するキーは、Windows テスターでは異常に見えるからです。

## プライバシー宣言はコードそのもの

「キー入力をアップロードすることはありません」は言うのは簡単ですが、
検証は難しい。ここでは 3 つのファイルで検証できます:

- `src/keyState.ts`: キー入力が通る状態マシン。純関数、ローカル状態のみ。
- `src/keyboardEvents.ts`: テスト中にページのショートカットが発動しない
  よう、テスターが吸収するブラウザキー。
- `src/keyReport.ts`: キーコードだけからテキストレポートを整形します。
  入力内容を見ることはありません。収集されていないからです。

このパッケージにはネットワーク呼び出しが一切ありません。この 3 ファイル
以上を調べる必要はありません。

## レイアウト

- ANSI・ISO キーボード、Windows・Mac のラベルバリアント。
- 上記の ChromeOS レイアウト。ハードウェアに忠実。
- サイズ縮小(full・TKL・75%・65%・60%)で列の整列を維持。

## Svelte を使わない場合の使い方

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

## テスト

```bash
npm test
```

42 のテストが、状態マシン、レイアウト構造とサイズフィルタ、ChromeOS
コード正規化、レポート整形をカバーします。

## ライブデモ

[keyboardtestonline.com](https://keyboardtestonline.com) はこのコアで
動作しています。ChromeOS レイアウトは
[/chromebook](https://keyboardtestonline.com/chromebook) にあります。
デッドキー、ロールオーバー、レイテンシ、ポーリングレート、チャッター、
CPS、スイッチのテストもすべて揃っています。

## ライセンス

MIT
