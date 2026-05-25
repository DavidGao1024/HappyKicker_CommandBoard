# 队长标注功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为足球战术板添加队长标注功能，允许用户为主队和客队各指定一名队长，并在球员标记上显示"(C)"标识。

**Architecture:** 在 Player 类型中添加 `isCaptain` 字段，在 usePlayers 中提供 `setCaptain` 和 `removeCaptain` 方法处理互斥逻辑，在 PlayerMarker 中渲染队长标记，在两个编辑弹窗中添加队长复选框。

**Tech Stack:** Vue 3, TypeScript, SVG

---

## File Structure

**Modified files:**
- `src/types/player.ts` — 添加 `isCaptain` 字段
- `src/composables/usePlayers.ts` — 添加队长管理方法
- `src/components/PlayerMarker.vue` — 渲染队长标记
- `src/components/PlayerEditDialog.vue` — 添加队长复选框
- `src/components/RosterEditDialog.vue` — 添加队长列
- `src/components/TacticalBoard.vue` — 处理队长设置事件

---

### Task 1: 扩展 Player 类型定义

**Files:**
- Modify: `src/types/player.ts:1-10`

- [ ] **Step 1: 添加 isCaptain 字段到 Player 接口**

```typescript
export type Team = 'home' | 'away'

export interface Player {
  id: string
  team: Team
  name: string
  number: number | null
  x: number
  y: number
  isCaptain: boolean
}
```

- [ ] **Step 2: 验证类型定义**

Run: `npm run build`
Expected: TypeScript 编译通过（可能有未使用字段的警告，后续步骤会使用）

- [ ] **Step 3: 提交类型定义**

```bash
git add src/types/player.ts
git commit -m "feat: add isCaptain field to Player type"
```

---

### Task 2: 实现队长管理逻辑

**Files:**
- Modify: `src/composables/usePlayers.ts:13-44,96-104`

- [ ] **Step 1: 修改 createDefaultPlayers 初始化 isCaptain**

在 `createDefaultPlayers` 函数中，为每个球员添加 `isCaptain: false`：

```typescript
function createDefaultPlayers(): Player[] {
  const formation = FORMATIONS[0] // default 3-3-2
  const players: Player[] = []

  // Home team
  for (let i = 0; i < 9; i++) {
    const pos = formation.positions[i]
    players.push({
      id: nextId(),
      team: 'home',
      name: '',
      number: null,
      x: toSvgX(pos.x),
      y: toSvgY(pos.y),
      isCaptain: false,
    })
  }

  // Away team (mirrored vertically)
  for (let i = 0; i < 9; i++) {
    const pos = formation.positions[i]
    players.push({
      id: nextId(),
      team: 'away',
      name: '',
      number: null,
      x: toSvgX(pos.x),
      y: toSvgY(1 - pos.y),
      isCaptain: false,
    })
  }

  return players
}
```

- [ ] **Step 2: 添加 setCaptain 方法**

在 `usePlayers` 函数的 return 语句之前添加：

```typescript
  function setCaptain(playerId: string) {
    const targetPlayer = players.value.find(p => p.id === playerId)
    if (!targetPlayer) return

    const team = targetPlayer.team
    
    // 清除同队所有球员的队长标记，并设置目标球员为队长
    players.value = players.value.map(p => {
      if (p.team === team) {
        return { ...p, isCaptain: p.id === playerId }
      }
      return p
    })
  }

  function removeCaptain(playerId: string) {
    const idx = players.value.findIndex(p => p.id === playerId)
    if (idx !== -1) {
      players.value[idx] = { ...players.value[idx], isCaptain: false }
    }
  }
```

- [ ] **Step 3: 导出新方法**

修改 return 语句，添加新方法：

```typescript
  return {
    players,
    updatePlayerPosition,
    updatePlayerInfo,
    applyFormationToTeam,
    resetAll,
    getSnapshot,
    restoreSnapshot,
    setCaptain,
    removeCaptain,
  }
```

- [ ] **Step 4: 验证编译**

Run: `npm run build`
Expected: TypeScript 编译通过

- [ ] **Step 5: 提交队长管理逻辑**

```bash
git add src/composables/usePlayers.ts
git commit -m "feat: add setCaptain and removeCaptain methods"
```

---

### Task 3: 在 PlayerMarker 中显示队长标记

**Files:**
- Modify: `src/components/PlayerMarker.vue:46-61`

- [ ] **Step 1: 修改名字显示逻辑，添加队长标记**

找到名字显示的 `<text>` 元素（约第 46-61 行），修改为：

```vue
    <!-- Name below circle -->
    <text
      v-if="player.name"
      :x="player.x"
      :y="player.y + props.radius + nameOffset"
      text-anchor="middle"
      dominant-baseline="hanging"
      :fill="nameColor"
      :font-size="nameFontSize"
      font-weight="bold"
      font-family="Arial, sans-serif"
      pointer-events="none"
      style="user-select: none"
    >
      {{ displayName }}{{ player.isCaptain ? '(C)' : '' }}
    </text>
```

- [ ] **Step 2: 启动开发服务器测试**

Run: `npm run dev`
Expected: 页面正常加载，球员圆点正常显示（暂时看不到队长标记，因为所有 isCaptain 都是 false）

- [ ] **Step 3: 提交视觉呈现**

```bash
git add src/components/PlayerMarker.vue
git commit -m "feat: display captain mark (C) after player name"
```

---

### Task 4: 扩展 PlayerEditDialog 添加队长复选框

**Files:**
- Modify: `src/components/PlayerEditDialog.vue:10-21,46-97`

- [ ] **Step 1: 在模板中添加队长复选框**

在"姓名"字段下方（约第 21 行之后）添加队长字段：

```vue
        <div class="dialog-field">
          <label>姓名</label>
          <input
            type="text"
            v-model="localName"
            maxlength="10"
            placeholder="输入姓名或从下方选择"
            ref="nameInput"
            @keydown.enter="onConfirm"
            @click="localName = ''"
          />
        </div>
        <div class="dialog-field">
          <label>队长</label>
          <input type="checkbox" v-model="localIsCaptain" />
        </div>
```

- [ ] **Step 2: 添加 localIsCaptain 状态**

在 script setup 中，找到 `const localName = ref('')` 附近（约第 62 行），添加：

```typescript
const localName = ref('')
const localIsCaptain = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)
```

- [ ] **Step 3: 在 watch 中初始化 localIsCaptain**

修改 watch 函数（约第 72-78 行）：

```typescript
watch(() => props.player, (p) => {
  if (p) {
    localName.value = p.name
    localIsCaptain.value = p.isCaptain
    hideRoster.value = false
    nextTick(() => nameInput.value?.select())
  }
})
```

- [ ] **Step 4: 修改 emit 类型定义**

修改 emit 定义（约第 57-60 行）：

```typescript
const emit = defineEmits<{
  close: []
  confirm: [id: string, name: string, number: number | null, isCaptain: boolean]
}>()
```

- [ ] **Step 5: 修改 onConfirm 传递 isCaptain**

修改 onConfirm 函数（约第 90-96 行）：

```typescript
function onConfirm() {
  if (props.player) {
    const num = pickedNumber.value ?? ROSTER.find(e => e.name === localName.value)?.number ?? null
    emit('confirm', props.player.id, localName.value, num, localIsCaptain.value)
  }
  emit('close')
}
```

- [ ] **Step 6: 验证编译**

Run: `npm run build`
Expected: TypeScript 编译通过

- [ ] **Step 7: 提交单个球员编辑弹窗**

```bash
git add src/components/PlayerEditDialog.vue
git commit -m "feat: add captain checkbox to PlayerEditDialog"
```

---

### Task 5: 扩展 RosterEditDialog 添加队长列

**Files:**
- Modify: `src/components/RosterEditDialog.vue:1-165`

- [ ] **Step 1: 在主队表格中添加队长复选框列**

找到主队的 roster-row（约第 12-31 行），修改为：

```vue
            <div
              v-for="(p, i) in homePlayers"
              :key="p.id"
              class="roster-row"
            >
              <span class="roster-index">{{ i + 1 }}</span>
              <span class="roster-pos-label">{{ positionLabels[p.id] || '--' }}</span>
              <div class="roster-input-wrapper">
                <input
                  ref="inputRefs[p.id]"
                  type="text"
                  class="roster-name"
                  :value="localData[p.id]"
                  maxlength="10"
                  placeholder="点击选择"
                  readonly
                  @click.stop="toggleDropdown(p.id, $event)"
                />
              </div>
              <input type="checkbox" v-model="localCaptains[p.id]" class="roster-captain-checkbox" />
            </div>
```

- [ ] **Step 2: 在客队表格中添加队长复选框列**

找到客队的 roster-row（约第 38-57 行），同样添加复选框：

```vue
            <div
              v-for="(p, i) in awayPlayers"
              :key="p.id"
              class="roster-row"
            >
              <span class="roster-index">{{ i + 1 }}</span>
              <span class="roster-pos-label">{{ positionLabels[p.id] || '--' }}</span>
              <div class="roster-input-wrapper">
                <input
                  ref="inputRefs[p.id]"
                  type="text"
                  class="roster-name"
                  :value="localData[p.id]"
                  maxlength="10"
                  placeholder="点击选择"
                  readonly
                  @click.stop="toggleDropdown(p.id, $event)"
                />
              </div>
              <input type="checkbox" v-model="localCaptains[p.id]" class="roster-captain-checkbox" />
            </div>
```

- [ ] **Step 3: 添加 localCaptains 状态**

在 script setup 中，找到 `const localData = reactive<Record<string, string>>({})` 附近（约第 103 行），添加：

```typescript
const localData = reactive<Record<string, string>>({})
const localCaptains = reactive<Record<string, boolean>>({})
const activeDropdown = ref<string | null>(null)
```

- [ ] **Step 4: 在 watch 中初始化 localCaptains**

修改 watch 函数（约第 112-119 行）：

```typescript
watch(() => props.visible, (v) => {
  if (v) {
    for (const p of props.players) {
      localData[p.id] = p.name
      localCaptains[p.id] = p.isCaptain
    }
    activeDropdown.value = null
  }
})
```

- [ ] **Step 5: 修改 emit 类型定义**

修改 emit 定义（约第 98-101 行）：

```typescript
const emit = defineEmits<{
  close: []
  confirm: [changes: { id: string; name: string; number: number | null; isCaptain: boolean }[]]
}>()
```

- [ ] **Step 6: 修改 onConfirm 处理队长变更**

修改 onConfirm 函数（约第 153-164 行）：

```typescript
function onConfirm() {
  const changes: { id: string; name: string; number: number | null; isCaptain: boolean }[] = []
  for (const p of props.players) {
    const name = localData[p.id]
    const isCaptain = localCaptains[p.id]
    const nameChanged = name !== undefined && name !== p.name
    const captainChanged = isCaptain !== p.isCaptain
    
    if (nameChanged || captainChanged) {
      const num = ROSTER.find(e => e.name === name)?.number ?? null
      changes.push({ id: p.id, name: name ?? p.name, number: num, isCaptain })
    }
  }
  emit('confirm', changes)
  emit('close')
}
```

- [ ] **Step 7: 添加队长复选框样式**

在 `<style scoped>` 部分末尾（约第 206 行之后）添加：

```vue
.roster-captain-checkbox {
  margin-left: 8px;
  cursor: pointer;
}
```

- [ ] **Step 8: 验证编译**

Run: `npm run build`
Expected: TypeScript 编译通过

- [ ] **Step 9: 提交批量编辑弹窗**

```bash
git add src/components/RosterEditDialog.vue
git commit -m "feat: add captain column to RosterEditDialog"
```

---

### Task 6: 在 TacticalBoard 中处理队长设置

**Files:**
- Modify: `src/components/TacticalBoard.vue:96-104,263-277`

- [ ] **Step 1: 从 usePlayers 中解构队长方法**

修改 usePlayers 解构（约第 96-104 行）：

```typescript
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
} = usePlayers()
```

- [ ] **Step 2: 修改 onEditConfirm 处理队长设置**

修改 onEditConfirm 函数（约第 263-266 行）：

```typescript
function onEditConfirm(id: string, name: string, num: number | null, isCaptain: boolean) {
  pushState(takeSnapshot())
  updatePlayerInfo(id, name, num)
  
  const player = players.value.find(p => p.id === id)
  if (player) {
    if (isCaptain && !player.isCaptain) {
      setCaptain(id)
    } else if (!isCaptain && player.isCaptain) {
      removeCaptain(id)
    }
  }
}
```

- [ ] **Step 3: 修改 onRosterConfirm 处理队长设置**

修改 onRosterConfirm 函数（约第 271-277 行）：

```typescript
function onRosterConfirm(changes: { id: string; name: string; number: number | null; isCaptain: boolean }[]) {
  if (changes.length === 0) return
  pushState(takeSnapshot())
  
  for (const c of changes) {
    updatePlayerInfo(c.id, c.name, c.number)
    
    const player = players.value.find(p => p.id === c.id)
    if (player) {
      if (c.isCaptain && !player.isCaptain) {
        setCaptain(c.id)
      } else if (!c.isCaptain && player.isCaptain) {
        removeCaptain(c.id)
      }
    }
  }
}
```

- [ ] **Step 4: 验证编译**

Run: `npm run build`
Expected: TypeScript 编译通过，无错误

- [ ] **Step 5: 提交 TacticalBoard 集成**

```bash
git add src/components/TacticalBoard.vue
git commit -m "feat: integrate captain management in TacticalBoard"
```

---

### Task 7: 手动测试所有场景

**Files:**
- Test: 所有修改的组件

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 应用正常启动，无控制台错误

- [ ] **Step 2: 测试单个球员编辑设置队长**

操作步骤：
1. 点击主队任意球员圆点
2. 在弹窗中输入姓名"张三"
3. 勾选"队长"复选框
4. 点击确定

Expected: 球员名字显示为"张三(C)"

- [ ] **Step 3: 测试队长互斥逻辑**

操作步骤：
1. 点击主队另一个球员圆点
2. 输入姓名"李四"
3. 勾选"队长"复选框
4. 点击确定

Expected: "李四(C)"显示，"张三"后面的"(C)"消失

- [ ] **Step 4: 测试取消队长**

操作步骤：
1. 点击"李四"球员
2. 取消勾选"队长"复选框
3. 点击确定

Expected: "李四"后面的"(C)"消失

- [ ] **Step 5: 测试批量编辑设置队长**

操作步骤：
1. 点击工具栏"编辑球员"按钮
2. 为主队第一个球员选择名字"王五"
3. 勾选该球员的队长复选框
4. 为客队第一个球员选择名字"赵六"
5. 勾选该球员的队长复选框
6. 点击确定

Expected: 主队显示"王五(C)"，客队显示"赵六(C)"

- [ ] **Step 6: 测试撤销/重做**

操作步骤：
1. 点击工具栏"撤销"按钮
2. 点击工具栏"重做"按钮

Expected: 撤销后队长标记消失，重做后队长标记恢复

- [ ] **Step 7: 测试截图功能**

操作步骤：
1. 确保场上有队长标记
2. 点击工具栏"保存/分享"按钮
3. 检查下载的图片

Expected: 图片中队长标记"(C)"正常显示

- [ ] **Step 8: 测试阵型切换**

操作步骤：
1. 设置主队某球员为队长
2. 切换主队阵型

Expected: 队长标记保持不变（位置改变但队长身份不变）

- [ ] **Step 9: 测试重置全部**

操作步骤：
1. 设置队长
2. 点击工具栏"重置"按钮

Expected: 所有球员恢复初始状态，无队长标记

- [ ] **Step 10: 最终提交**

```bash
git add -A
git commit -m "test: verify captain marking feature works correctly"
```

---

## 实现完成

所有任务完成后，队长标注功能已完全集成到战术板中。用户可以通过单个编辑弹窗或批量编辑弹窗设置/取消队长，队长标记会在球员名字后显示"(C)"，并在截图中正常显示。撤销/重做功能自动支持队长状态。
