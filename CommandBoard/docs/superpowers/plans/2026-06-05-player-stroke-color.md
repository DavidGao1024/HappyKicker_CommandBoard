# 球员外圈颜色批量切换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在工具栏为主队、客队各增加一个外圈颜色选择器，支持从固定色板中批量切换该队全部球员的 SVG 圆圈描边色。

**Architecture:** 颜色作为队伍级状态存储在 `usePlayers` composable 中（模块级 ref），通过快照机制纳入撤销/重做。`PlayerMarker` 直接读取该状态渲染描边色。`Toolbar` 通过新增 props/emits 暴露颜色选择 UI，`TacticalBoard` 负责连接状态与视图。

**Tech Stack:** Vue 3, TypeScript, SVG, 无测试框架（以浏览器手动验证替代）

---

## 文件结构

| 文件 | 动作 | 职责 |
|------|------|------|
| `src/composables/usePlayers.ts` | 修改 | 新增 `homeStrokeColor`、`awayStrokeColor` 状态，`setStrokeColor` 方法，扩展快照/恢复/重置逻辑 |
| `src/components/PlayerMarker.vue` | 修改 | `strokeColor` 从硬编码改为从 `usePlayers` 动态读取 |
| `src/components/Toolbar.vue` | 修改 | 新增主队/客队颜色选择器 UI、props、emits |
| `src/components/TacticalBoard.vue` | 修改 | 向 Toolbar 注入颜色状态与 setter，处理重置恢复默认色 |

---

## 常量定义

色板常量定义在 `src/composables/usePlayers.ts` 中（与状态放一起，避免循环依赖）：

```ts
export const STROKE_COLORS = [
  '#333333', // 深灰（主队默认）
  '#B71C1C', // 深红（客队默认）
  '#000000', // 黑
  '#1565C0', // 蓝
  '#2E7D32', // 绿
  '#F9A825', // 金
  '#6A1B9A', // 紫
  '#E65100', // 橙
]

export const DEFAULT_HOME_STROKE = '#333333'
export const DEFAULT_AWAY_STROKE = '#B71C1C'
```

---

### Task 1: 扩展 usePlayers 状态与快照

**Files:**
- Modify: `src/composables/usePlayers.ts`

- [ ] **Step 1: 新增颜色状态与常量**

在文件顶部（`nextId` 函数之前或之后）新增：

```ts
export const STROKE_COLORS = [
  '#333333',
  '#B71C1C',
  '#000000',
  '#1565C0',
  '#2E7D32',
  '#F9A825',
  '#6A1B9A',
  '#E65100',
]

export const DEFAULT_HOME_STROKE = '#333333'
export const DEFAULT_AWAY_STROKE = '#B71C1C'

const homeStrokeColor = ref(DEFAULT_HOME_STROKE)
const awayStrokeColor = ref(DEFAULT_AWAY_STROKE)
```

- [ ] **Step 2: 新增 setter 函数**

在 `usePlayers` 函数体内（`removeCaptain` 之后）新增：

```ts
function setStrokeColor(team: Team, color: string) {
  if (team === 'home') {
    homeStrokeColor.value = color
  } else {
    awayStrokeColor.value = color
  }
}
```

- [ ] **Step 3: 扩展快照与恢复**

将 `getSnapshot` 修改为返回包含颜色状态的对象：

```ts
function getSnapshot(): { players: Player[]; homeStroke: string; awayStroke: string } {
  return {
    players: players.value.map(p => ({ ...p })),
    homeStroke: homeStrokeColor.value,
    awayStroke: awayStrokeColor.value,
  }
}
```

将 `restoreSnapshot` 修改为接受并恢复颜色：

```ts
function restoreSnapshot(snapshot: { players: Player[]; homeStroke: string; awayStroke: string }) {
  players.value = snapshot.players.map(p => ({ ...p }))
  homeStrokeColor.value = snapshot.homeStroke
  awayStrokeColor.value = snapshot.awayStroke
}
```

- [ ] **Step 4: 扩展重置逻辑**

将 `resetAll` 修改为同时恢复默认颜色：

```ts
function resetAll() {
  idCounter = 0
  players.value = createDefaultPlayers()
  homeStrokeColor.value = DEFAULT_HOME_STROKE
  awayStrokeColor.value = DEFAULT_AWAY_STROKE
}
```

- [ ] **Step 5: 导出新增状态和方法**

在 return 语句中追加：

```ts
return {
  // ... 原有导出 ...
  homeStrokeColor,
  awayStrokeColor,
  setStrokeColor,
}
```

- [ ] **Step 6: Commit**

```bash
git add src/composables/usePlayers.ts
git commit -m "feat: add per-team stroke color state and snapshots"
```

---

### Task 2: PlayerMarker 动态读取外圈颜色

**Files:**
- Modify: `src/components/PlayerMarker.vue`

- [ ] **Step 1: 引入 usePlayers**

在 `<script setup>` 的 import 区域新增：

```ts
import { usePlayers } from '@/composables/usePlayers'
```

在 `const { clampX, clampY } = usePitch()` 之后新增：

```ts
const { homeStrokeColor, awayStrokeColor } = usePlayers()
```

- [ ] **Step 2: 修改 strokeColor 计算属性**

将现有的 `strokeColor` computed 替换为：

```ts
const strokeColor = computed(() =>
  props.player.team === 'home' ? homeStrokeColor.value : awayStrokeColor.value
)
```

删除旧的硬编码 `strokeColor` 定义（原 106-108 行左右）。

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerMarker.vue
git commit -m "feat: read stroke color dynamically from usePlayers"
```

---

### Task 3: Toolbar 增加颜色选择器 UI

**Files:**
- Modify: `src/components/Toolbar.vue`

- [ ] **Step 1: 新增 props**

在 `defineProps` 中追加：

```ts
homeStrokeColor: string
awayStrokeColor: string
strokeColors: string[]
```

- [ ] **Step 2: 新增 emits**

在 `defineEmits` 中追加：

```ts
setHomeStrokeColor: [color: string]
setAwayStrokeColor: [color: string]
```

- [ ] **Step 3: 主队颜色选择器 UI**

在主队阵型 `<select>` 之后（同个 `.toolbar-section` 内）插入颜色选择器：

```html
      <div class="stroke-colors">
        <button
          v-for="color in strokeColors"
          :key="color"
          class="stroke-color-btn"
          :class="{ active: homeStrokeColor === color }"
          :style="{ backgroundColor: color }"
          :title="color"
          @click="$emit('setHomeStrokeColor', color)"
        />
      </div>
```

- [ ] **Step 4: 客队颜色选择器 UI**

在客队阵型 `<select>` 之后（同个 `.toolbar-section` 内）插入相同的结构：

```html
      <div class="stroke-colors">
        <button
          v-for="color in strokeColors"
          :key="color"
          class="stroke-color-btn"
          :class="{ active: awayStrokeColor === color }"
          :style="{ backgroundColor: color }"
          :title="color"
          @click="$emit('setAwayStrokeColor', color)"
        />
      </div>
```

- [ ] **Step 5: 添加样式**

在 `<style scoped>` 区域（如没有则添加）插入：

```html
<style scoped>
.stroke-colors {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.stroke-color-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}
.stroke-color-btn.active {
  border-color: #fff;
  box-shadow: 0 0 0 1px #333;
}
</style>
```

注意：检查是否已有 `<style scoped>`，避免重复创建 style 块。

- [ ] **Step 6: Commit**

```bash
git add src/components/Toolbar.vue
git commit -m "feat: add stroke color pickers in toolbar"
```

---

### Task 4: TacticalBoard 连接颜色状态

**Files:**
- Modify: `src/components/TacticalBoard.vue`

- [ ] **Step 1: 解构 usePlayers 新增导出**

将现有的 usePlayers 解构改为：

```ts
const {
  players,
  updatePlayerPosition,
  updatePlayerInfo,
  applyFormationToTeam,
  resetAll: resetPlayers,
  getSnapshot: getPlayersSnapshot,
  restoreSnapshot: restorePlayersSnapshot,
  setCaptain,
  removeCaptain,
  homeStrokeColor,
  awayStrokeColor,
  setStrokeColor,
} = usePlayers()
```

- [ ] **Step 2: 向 Toolbar 传递颜色 props**

在 `<Toolbar>` 组件上新增绑定：

```html
    <Toolbar
      :formations="formations"
      :home-formation="homeFormation"
      :away-formation="awayFormation"
      :active-tool="activeTool"
      :active-color="activeColor"
      :colors="DRAWING_COLORS"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :show-away-team="showAwayTeam"
      :home-stroke-color="homeStrokeColor"
      :away-stroke-color="awayStrokeColor"
      :stroke-colors="STROKE_COLORS"
      @home-formation="onHomeFormation"
      @away-formation="onAwayFormation"
      @set-tool="setTool"
      @set-color="(c) => (activeColor = c)"
      @undo="onUndo"
      @redo="onRedo"
      @clear-drawings="onClearDrawings"
      @reset-all="onResetAll"
      @edit-roster="rosterDialogVisible = true"
      @save-screenshot="onSaveScreenshot"
      @toggle-show-away="showAwayTeam = !showAwayTeam"
      @set-home-stroke-color="onSetHomeStrokeColor"
      @set-away-stroke-color="onSetAwayStrokeColor"
    />
```

- [ ] **Step 3: 处理颜色切换事件**

在 `<script setup>` 中新增事件处理函数（放在 `onResetAll` 之后即可）：

```ts
function onSetHomeStrokeColor(color: string) {
  pushState(takeSnapshot())
  setStrokeColor('home', color)
}

function onSetAwayStrokeColor(color: string) {
  pushState(takeSnapshot())
  setStrokeColor('away', color)
}
```

- [ ] **Step 4: 导入 STROKE_COLORS**

在 `import { usePlayers }` 同行区域确认已导入 `STROKE_COLORS`。由于 `usePlayers.ts` 导出它，所以解构时不需要额外导入，可直接在模板中使用 `STROKE_COLORS`。

检查当前导入：

```ts
import { usePlayers } from '@/composables/usePlayers'
```

改为：

```ts
import { usePlayers, STROKE_COLORS } from '@/composables/usePlayers'
```

- [ ] **Step 5: Commit**

```bash
git add src/components/TacticalBoard.vue
git commit -m "feat: wire stroke color state into toolbar and history"
```

---

### Task 5: 手动验证与构建

**Files:**
- 无文件修改，纯验证

- [ ] **Step 1: 类型检查**

Run: `npm run build`
Expected: 0 errors, 0 warnings

- [ ] **Step 2: 启动开发服务器**

Run: `npm run dev`
打开浏览器访问 `http://localhost:5173`（或终端输出的地址）

- [ ] **Step 3: 功能验证清单**

在浏览器中完成以下检查：

1. **主队换色**：点击 Toolbar 主队下方的颜色圆点，场上全部 9 个白圈的外圈颜色即时变化。
2. **客队换色**：点击 Toolbar 客队下方的颜色圆点，场上全部 9 个红圈的外圈颜色即时变化。
3. **独立选择**：主客队可选择不同颜色，也可选择相同颜色，互不干扰。
4. **默认激活态**：页面刷新后，主队颜色选择器的深灰圆点带有 `active` 样式（白边），客队深红圆点同样带有 `active` 样式。
5. **撤销颜色变更**：切换颜色后，点击撤销按钮，颜色应回退到上一状态。
6. **重做颜色变更**：撤销后点击重做按钮，颜色应恢复。
7. **重置恢复默认**：点击"重置全部"后，两队颜色恢复为深灰/深红默认值。
8. **截图导出**：点击"保存/分享"，导出的 PNG 中球员外圈颜色应与当前设置一致。

- [ ] **Step 4: Commit（如有额外修复）**

如果在验证中发现并修复了问题，单独 commit：

```bash
git add -A
git commit -m "fix: adjust stroke color picker styles/behavior"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] 固定色板 8 色 → Task 1 定义常量
- [x] 主队/客队独立批量切换 → Task 3 UI + Task 4 事件处理
- [x] 颜色状态纳入撤销/重做 → Task 1 扩展快照 + Task 4 pushState
- [x] 重置恢复默认 → Task 1 resetAll 扩展
- [x] PlayerMarker 描边色动态读取 → Task 2
- [x] 截图无需额外处理 → 计划中已说明（颜色已固化在 DOM）

**2. Placeholder scan:**
- [x] 无 TBD/TODO
- [x] 所有代码步骤包含完整代码
- [x] 所有命令包含预期输出

**3. Type consistency:**
- [x] `setStrokeColor(team: Team, color: string)` 签名一致
- [x] 快照类型 `{ players, homeStroke, awayStroke }` 在 Task 1 和 Task 4 中一致
- [x] `STROKE_COLORS` 导出名在各处一致
