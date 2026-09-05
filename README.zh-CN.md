<div align="center">

[English](README.md) | **简体中文** | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md)

</div>

# keyboard-tester

开源的浏览器键盘测试器：**ChromeOS、Windows、Mac 布局**，按键状态机，可复制的测试报告。TypeScript 与 Svelte 实现，零服务器、无遥测。每一次按键都留在浏览器里。

驱动 [keyboardtestonline.com](https://keyboardtestonline.com)。

## 运行演示

```bash
npm install
npm run dev
```

打开输出的网址，在真实键盘上按键，屏幕上的键盘会同步点亮。在工具栏切换 Win / Mac / ChromeOS。用 `npm run build` 生成静态版本，`dist-demo/` 可部署到任意位置。

## 仓库内容

- `src/`，不依赖框架的核心。布局（ANSI、ISO、ChromeOS）、按键状态机、浏览器按键事件策略、报告格式化、轮询率估算。除 `KeyboardEvent` 外不做任何 DOM 假设。
- `components/`，渲染核心的 Svelte 5 测试器组件。可放入任意 Svelte 应用；翻译文案是 props，默认英文。

## 不是换了个标签的 Windows 键盘

搜索 Chromebook 键盘测试器，找到的大多是套着不同键帽的 Windows 键盘布局。本项目忠实还原硬件：

- Search 键替代 Caps Lock，与真实 Chromebook 一致。
- 顶行是真正的 Chromebook 动作键（返回、刷新、全屏、亮度、音量），不是伪装成 F1-F12。
- `normalizeChromeosCode` 将 F1-F10 映射回动作码，支持功能键模式下的 Chromebook。
- 没有数字键盘、没有 PrtSc 区、没有多余的 Win 或 Menu 键。

学校 IT 检查或二手 Chromebook 买家真正需要的正是这种布局，因为他们担心的按键在 Windows 测试器上会显示异常。

## 隐私声明就是代码

"你永远不会上传按键内容"说起来容易，验证起来难。这里只需三个文件即可验证：

- `src/keyState.ts`，按键经过的状态机。纯函数，仅本地状态。
- `src/keyboardEvents.ts`，测试器吞掉哪些浏览器按键，避免测试时触发页面快捷键。
- `src/keyReport.ts`，仅凭按键码格式化文本报告。它永远看不到你输入的内容，因为从未收集过。

本包不存在任何网络调用。审查这三个文件即可，无需看更多。

## 布局

- ANSI 与 ISO 键盘，Windows 和 Mac 标签变体。
- 上述 ChromeOS 布局，忠实于硬件。
- 尺寸缩放（full、TKL、75%、65%、60%）保持列对齐。

## 不使用 Svelte 的用法

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

## 测试

```bash
npm test
```

42 个测试覆盖状态机、布局结构与尺寸过滤、ChromeOS 码归一化、报告格式化。

## 在线演示

[keyboardtestonline.com](https://keyboardtestonline.com) 运行本项目核心。ChromeOS 布局位于 [/chromebook](https://keyboardtestonline.com/chromebook)。死键、rollover、延迟、轮询率、chatter、CPS、开关测试也都提供。

## 许可

MIT
