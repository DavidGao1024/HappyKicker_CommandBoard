# 队长标注功能设计文档

## 概述

为足球战术板添加队长标注功能，允许用户为主队和客队各指定一名队长，并在球员标记上显示队长身份。

## 需求

- 每支队伍只能有一个队长
- 队长标记显示为球员名字后的"(C)"文本
- 用户可在单个球员编辑弹窗和批量编辑弹窗中设置/取消队长
- 设置新队长时自动取消同队旧队长
- 队长标记在截图中正常显示

## 数据模型

### Player 类型扩展

在 `src/types/player.ts` 中为 `Player` 接口添加 `isCaptain` 字段：

```typescript
export interface Player {
  id: string
  team: Team
  name: string
  number: number | null
  x: number
  y: number
  isCaptain: boolean  // 新增：标识是否为队长
}
```

### 状态管理

在 `src/composables/usePlayers.ts` 中：

1. **初始化**：`createDefaultPlayers()` 创建球员时，所有球员的 `isCaptain` 默认为 `false`

2. **新增方法**：
   - `setCaptain(playerId: string)` — 设置指定球员为队长
     - 查找目标球员，获取其 `team`
     - 遍历同队所有球员，将 `isCaptain` 设为 `false`
     - 将目标球员的 `isCaptain` 设为 `true`
     - 通过替换数组元素触发响应式更新（保持现有 `updatePlayerInfo` 的模式）
   
   - `removeCaptain(playerId: string)` — 取消指定球员的队长身份
     - 查找目标球员，将其 `isCaptain` 设为 `false`
     - 通过替换数组元素触发响应式更新

3. **快照支持**：现有的 `getSnapshot()` 和 `restoreSnapshot()` 自动支持 `isCaptain` 字段，无需额外修改

## 视觉呈现

### PlayerMarker 组件

在 `src/components/PlayerMarker.vue` 中修改名字显示逻辑：

```vue
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

- 队长标记"(C)"使用与名字相同的颜色和字号
- 主队队长：白色"(C)"
- 客队队长：红色"(C)"

## UI 交互

### PlayerEditDialog（单个球员编辑弹窗）

在 `src/components/PlayerEditDialog.vue` 中：

1. **UI 布局**：在"姓名"字段下方添加"队长"复选框
   ```vue
   <div class="dialog-field">
     <label>队长</label>
     <input type="checkbox" v-model="localIsCaptain" />
   </div>
   ```

2. **本地状态**：添加 `localIsCaptain` ref，在 `watch(() => props.player)` 中初始化为 `p.isCaptain`

3. **事件传递**：修改 `confirm` 事件签名，添加 `isCaptain` 参数：
   ```typescript
   emit: {
     confirm: [id: string, name: string, number: number | null, isCaptain: boolean]
   }
   ```

4. **父组件处理**：`TacticalBoard.vue` 中接收 `isCaptain` 参数，根据值调用 `setCaptain` 或 `removeCaptain`

### RosterEditDialog（批量编辑弹窗）

在 `src/components/RosterEditDialog.vue` 中：

1. **UI 布局**：
   - 表头添加"队长"列
   - 每个球员输入行添加队长复选框
   ```vue
   <thead>
     <tr>
       <th>位置</th>
       <th>姓名</th>
       <th>队长</th>
     </tr>
   </thead>
   <tbody>
     <tr v-for="(player, idx) in teamPlayers">
       <td>{{ positionLabels[idx] }}</td>
       <td><input v-model="localNames[idx]" /></td>
       <td><input type="checkbox" v-model="localCaptains[idx]" /></td>
     </tr>
   </tbody>
   ```

2. **本地状态**：添加 `localCaptains` ref 数组，初始化为每个球员的 `isCaptain` 值

3. **确认逻辑**：
   - 遍历所有球员，比较 `localCaptains[i]` 与原始 `player.isCaptain`
   - 如果从 `false` 变为 `true`，调用 `setCaptain(player.id)`
   - 如果从 `true` 变为 `false`，调用 `removeCaptain(player.id)`
   - 由于 `setCaptain` 自动清除同队旧队长，无需额外处理互斥逻辑

## 撤销/重做支持

由于 `isCaptain` 字段存储在 `Player` 对象中，现有的快照机制（`useHistory`）自动支持队长状态的撤销/重做，无需额外开发。

## 截图功能

`TacticalBoard.vue` 中的 `onSaveScreenshot` 方法无需修改，队长标记"(C)"会随 SVG 一起被序列化并渲染到 Canvas 中。

## 实现顺序

1. 修改 `Player` 类型定义，添加 `isCaptain` 字段
2. 在 `usePlayers` 中实现 `setCaptain` 和 `removeCaptain` 方法
3. 修改 `PlayerMarker` 组件，显示队长标记
4. 扩展 `PlayerEditDialog`，添加队长复选框
5. 扩展 `RosterEditDialog`，添加队长列
6. 手动测试所有场景（设置、取消、切换、撤销、截图）

## 边界情况

- **空名字球员设为队长**：允许，但视觉上只显示"(C)"
- **阵型切换**：队长状态保持不变（`applyFormationToTeam` 只修改位置）
- **重置全部**：`resetAll()` 创建新球员时，所有 `isCaptain` 为 `false`
- **批量编辑中多个复选框被勾选**：最后一个勾选的生效（`setCaptain` 自动清除前面的）
