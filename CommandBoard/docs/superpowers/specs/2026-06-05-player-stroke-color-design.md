# 球员圆圈外圈颜色批量切换

## 概述

在工具栏为主队、客队各增加一个外圈颜色选择器，支持从固定色板中批量切换该队全部 9 名球员的 SVG 圆圈描边色（`stroke`）。

当前默认：主队白圈灰边 `#333333`，客队红圈深红边 `#B71C1C`。填充色（fill）保持不变。

## 动机

用户希望在不改变填充色的前提下，通过更换外圈颜色实现视觉区分或美观效果。需求为**按队伍批量切换**，不需要逐个球员设置。

## 方案

### 颜色预设

提供 8 种外圈颜色，保证在白底（主队）和红底（客队）上都有足够对比度：

| 名称 | 色值 | 备注 |
|------|------|------|
| 深灰 | `#333333` | 主队默认 |
| 深红 | `#B71C1C` | 客队默认 |
| 黑色 | `#000000` | |
| 蓝色 | `#1565C0` | |
| 绿色 | `#2E7D32` | |
| 金色 | `#F9A825` | |
| 紫色 | `#6A1B9A` | |
| 橙色 | `#E65100` | |

### 状态管理

在 `usePlayers` composable 中新增两个模块级 ref：

```ts
const homeStrokeColor = ref('#333333')
const awayStrokeColor = ref('#B71C1C')
```

新增方法：

```ts
function setStrokeColor(team: Team, color: string) {
  if (team === 'home') homeStrokeColor.value = color
  else awayStrokeColor.value = color
}
```

快照与恢复逻辑扩展为包含颜色状态，确保撤销/重做能正确回退颜色变更。

### 组件改动

#### Toolbar.vue

在主队阵型选择器和客队阵型选择器旁，各新增一排颜色圆点按钮：

- 圆点直径 18px，当前选中的颜色显示白色内圈描边或外发光作为激活态
- 点击后立即切换该队外圈颜色
- 色板用 `STROKE_COLORS` 常量数组驱动

#### PlayerMarker.vue

`strokeColor` 计算属性不再硬编码，改为从 `usePlayers()` 读取对应队伍颜色：

```ts
const { homeStrokeColor, awayStrokeColor } = usePlayers()
const strokeColor = computed(() =>
  props.player.team === 'home' ? homeStrokeColor.value : awayStrokeColor.value
)
```

其他视觉属性（`fillColor`、`nameColor`）保持不变。

#### TacticalBoard.vue

将颜色选择事件从 Toolbar 透传至 `usePlayers.setStrokeColor`，并在阵型切换、重置等操作中保持颜色状态（重置全部时恢复默认颜色）。

#### 截图导出

截图功能使用克隆的 SVG，PlayerMarker 的颜色为响应式计算属性，克隆时已固化到 DOM 属性中，无需额外处理。

## 交互细节

- 点击颜色圆点后即时生效，无需确认对话框
- 颜色变更纳入撤销/重做栈（通过快照机制自动支持）
- 重置全部时，颜色恢复为各自默认值
- 切换阵型不改变颜色
- 主客队可独立选择，允许同色

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/composables/usePlayers.ts` | 修改 | 新增颜色状态、setter、快照/恢复扩展 |
| `src/components/Toolbar.vue` | 修改 | 新增主队/客队颜色选择器 UI |
| `src/components/PlayerMarker.vue` | 修改 | strokeColor 从硬编码改为响应式读取 |
| `src/components/TacticalBoard.vue` | 修改 | 透传颜色选择事件，重置时恢复默认色 |
| `src/types/player.ts` | 无需修改 | Player 接口不包含颜色字段（队伍级状态） |

## 不在本需求范围内

- 每个球员独立设置不同颜色
- 颜色持久化（localStorage）
- 自定义颜色（色盘）
- 修改填充色或名字颜色
