# Principle Bar Race Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Remotion animation that shows 30 constitutional principles moving through yearly cumulative citation rankings.

**Architecture:** Keep the existing static deck untouched and add a focused Remotion app under `remotion-principle-bar-race`. A data-prep script converts the existing yearly CSV into JSON frames; the Remotion component renders the smooth ranked bar animation from that JSON.

**Tech Stack:** Node.js, pnpm, Remotion, React, TypeScript, local CSV parsing script.

## Global Constraints

- Use `C:\Users\je235\Downloads\第五章量化 - 5_07_各原則逐年引用篇數表.csv` as the source data.
- Track all 30 principles.
- Display all 30 bars, with top 15 emphasized and bottom 15 visually quieter.
- Match the story deck's paper background, teal-yellow-pink palette, rounded hand-drawn buttons/cards, and projector-friendly typography.
- Output target: 1920x1080, 60 fps, about 45-60 seconds.
- No external data sources.

---

### Task 1: Data Prep

**Files:**
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\scripts\build-data.mjs`
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\src\data\principle-race.json`
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\src\data\summary.json`

**Interfaces:**
- Produces `principle-race.json`:
  ```ts
  type YearFrame = {
    year: number;
    max: number;
    items: { name: string; value: number; rank: number; yearly: number }[];
  };
  ```
- Produces `summary.json`:
  ```ts
  type Summary = { minYear: number; maxYear: number; principleCount: number; maxValue: number };
  ```

- [ ] **Step 1: Create the data script**

Write a Node script that reads the CSV, groups by year and principle, fills missing years with zero, computes cumulative values, ranks each year, and writes JSON.

- [ ] **Step 2: Run the script**

Run:
```powershell
& "C:\Users\je235\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" "C:\Users\je235\Documents\New project\remotion-principle-bar-race\scripts\build-data.mjs"
```
Expected: JSON files written with 1949-2021 frames and 30 principles.

- [ ] **Step 3: Verify data**

Check that the final 2021 top entries match the deck totals: 比例原則 140, 平等原則 112, 法律明確性原則 64, 法律保留原則 64, 最小侵害原則／必要性原則 55.

### Task 2: Remotion Scaffold

**Files:**
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\package.json`
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\tsconfig.json`
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\remotion.config.ts`
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\src\Root.tsx`
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\src\index.ts`

**Interfaces:**
- Produces a Remotion composition named `PrincipleBarRace`.
- Composition reads `principle-race.json` and `summary.json`.

- [ ] **Step 1: Add Remotion package files**

Create a minimal Remotion TypeScript project with scripts:
```json
{
  "preview": "remotion preview src/index.ts",
  "render": "remotion render src/index.ts PrincipleBarRace out/principle-bar-race.mp4"
}
```

- [ ] **Step 2: Install dependencies**

Run:
```powershell
& "C:\Users\je235\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" install
```
Expected: dependencies install under the Remotion folder.

### Task 3: Animation Component

**Files:**
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\src\PrincipleBarRace.tsx`
- Create: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\src\style.ts`

**Interfaces:**
- Consumes `YearFrame[]` and `Summary`.
- Renders 30 bars, interpolating between adjacent year frames.

- [ ] **Step 1: Implement interpolation**

Map video frame to fractional year index, interpolate each principle's value and rank position between the two nearest year frames.

- [ ] **Step 2: Render bars**

Render all 30 bars. Top 15 use larger height, stronger opacity, larger labels; ranks 16-30 use smaller height and lighter opacity.

- [ ] **Step 3: Add deck styling**

Use cream lined paper background, teal-to-yellow gradient bars, pink hand-written year label, dark brown borders, and subtle shadows.

- [ ] **Step 4: Add final hold**

Hold on 2021 long enough for reading.

### Task 4: Verification And Render

**Files:**
- Modify only if needed: Remotion files from earlier tasks.
- Create if render succeeds: `C:\Users\je235\Documents\New project\remotion-principle-bar-race\out\principle-bar-race.mp4`

**Interfaces:**
- Produces a previewable and renderable animation.

- [ ] **Step 1: Validate source data**

Run the build script and verify final totals.

- [ ] **Step 2: Validate Remotion bundle**

Run:
```powershell
& "C:\Users\je235\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" exec remotion compositions src/index.ts
```
Expected: `PrincipleBarRace` is listed.

- [ ] **Step 3: Render or report blocker**

Run render. If Chromium/codec rendering fails in the local environment, report the exact error and leave the previewable Remotion project complete.

- [ ] **Step 4: Commit**

Commit the completed Remotion animation source and generated data.
