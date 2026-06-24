# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 铁律（绝对不能违反）

1. **必须使用中文** — 所有交流、回复、解释一律使用中文。代码注释优先中文。
2. **默认只 commit，绝对不要 push** — 除非用户明确说了「推送」或「push」，否则永远不要执行 `git push`。
3. **不确定就问，不要猜** — 任何不确定的事情，先问用户。不要自作主张。
4. **遵循 Conventional Commits** — `feat:`、`fix:`、`docs:` 等格式。

## 用户信息

- 昵称：辰渊尘（小尘、阿尘、尘）
- 身份：高中生，自学前端，正在转向全栈
- 主力语言：Python（学过）、JS/TS（前端用）
- 前端框架优先：Astro > Vue
- 编辑器：VSCode，操作系统：Windows 11
- 缩进偏好：Tab

## Project Overview

班级抽人工具 (Class Random Student Picker) — a static web tool for randomly selecting students in a classroom setting. Supports file upload, manual name entry, and pre-configured class pages. All UI text is in Chinese (zh-CN).

## Commands

```bash
npm run dev       # Start dev server (astro dev)
npm run build     # Build static site to dist/ (astro build)
npm run preview   # Preview production build locally
```

No test framework is configured. No linter is configured.

## Architecture

**Framework:** Astro (static output mode, `build.format: 'file'`)

**Dual implementation pattern — this is important:**

- **`public/`** — Self-contained standalone HTML (`public/index.html`) with all CSS inlined and JS embedded. This is the original plain-HTML version that works without any build step.
- **`src/`** — Astro-based pages (`src/pages/index.astro`, `src/pages/js2451.astro`) that reference shared CSS/JS from `public/` and load class data from `src/data/classes/*.json` at build time.

Both versions coexist. The Astro build produces the final site, but `public/index.html` can be opened directly in a browser without building.

**JavaScript classes:**
- `RandomPicker` (in `public/scripts/main.js`) — main page logic for file upload + random selection
- `ClassPicker` (in `public/scripts/class-page.js`) — variant for pre-configured class pages, reads `window.CLASS_DATA` injected by Astro
- `SoundEffect` (in `public/scripts/audio.js`) — Web Audio API sound effects, exposes `window.soundEffect` globally

**Class data:** JSON files in `src/data/classes/` (and mirrored in `public/data/classes/`) with schema `{ class_name: string, students: string[] }`. The Astro class page imports JSON directly; the standalone version fetches via URL path matching (`/js{id}` → `/data/classes/js{id}.json`).

**Adding a new class:** Create `src/data/classes/<classname>.json` and a corresponding `src/pages/<classname>.astro` (copy `js2451.astro` as template). Also add `public/data/classes/<classname>.json` for the standalone URL-based loader in `main.js`.

## Key Technical Details

- Audio uses Web Audio API (no audio files) — synthesized tones for click and success sounds
- Random selection uses a "smart" algorithm that avoids picking the same student consecutively (`getSmartRandomIndex`)
- The rolling animation runs 25-35 iterations with progressive deceleration before settling on the winner
- Path alias `@data` → `./src/data` configured in `astro.config.mjs`
- Favicon served from `public/` as both `.ico` and `.svg`
