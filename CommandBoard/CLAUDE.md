# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

CommandBoard（足球战术板）是一个基于 Vue 3 + TypeScript 的足球战术规划工具，用于可视化球队阵型和战术。支持球员拖拽、阵型切换、战术标注绘制（箭头/线条/自由画笔）、撤销/重做等功能。UI 语言为简体中文，针对九人制足球。

## 常用命令

```bash
npm run dev       # 启动开发服务器
npm run build     # TypeScript 类型检查 + Vite 生产构建（vue-tsc -b && vite build）
npm run preview   # 本地预览生产构建
```

项目未配置测试框架和 lint 工具。

## 架构设计

### 分层 SVG 渲染

应用采用分层 SVG 架构，三层叠加渲染：
1. **FootballPitch** — 静态球场标线
2. **DrawingsLayer** — 战术标注（箭头、线条、自由路径）
3. **PlayersLayer** — 可拖拽的球员标记

### 组件层级

```
App.vue
└── TacticalBoard.vue（编排器，组合所有 composable 并向下传递）
    ├── Toolbar.vue（工具栏控件）
    ├── FootballPitch.vue（SVG 球场）
    ├── DrawingsLayer.vue → DrawingElement.vue（×N）
    ├── PlayersLayer.vue → PlayerMarker.vue（×18，每队9人）
    ├── PlayerEditDialog.vue（双击球员弹出的编辑弹窗，含位置标签 + 名单快速选择）
    └── RosterEditDialog.vue（批量编辑球员弹窗，含位置标签 + 名单自动补全）
```

### 状态管理：模块级 Composable 单例

不使用 Vuex/Pinia，而是通过 `src/composables/` 下的组合函数管理状态。**状态定义在模块顶层**（函数外部），确保全局单例：

- **usePlayers** — 18 名球员的位置、姓名；`updatePlayerInfo` 通过替换数组元素（而非直接修改属性）触发响应式更新
- **useFormations** — 主客队当前阵型（6 种预设：3-3-2、3-2-3、2-3-3、1-3-2-2、3-4-1、2-4-2），每个阵型包含 `positionLabels`（9 个位置缩写如 GK、LB、CM 等）
- **useDrawing** — 当前绘图工具、颜色、绘图元素集合
- **useHistory** — 撤销/重做栈（快照模式，最多 50 层）
- **usePitch** — 球场尺寸与坐标转换工具

### 坐标系统

使用双坐标系：
- **分数坐标 (0-1)** — 阵型定义中使用，与球场尺寸无关
- **SVG 坐标** — 实际渲染像素位置

球场 SVG 尺寸：520×680（宽52m×长68m，含 30 单位内边距，总计 580×740）。`usePitch` 提供 `toSvgX/Y`、`toFracX/Y`、`clampX/Y` 等转换函数。

客队阵型通过垂直镜像实现：`y = 1 - y`。

### 撤销/重做（快照模式）

`useHistory` 在每次操作前拍摄完整状态快照（球员 + 绘图），存入 undoStack/redoStack。操作包括球员拖拽、阵型切换、绘图增删等。

### 事件处理

使用 Pointer Events API（兼容触屏和鼠标），通过 `setPointerCapture()` 实现平滑拖拽。绘图流程：`pointerdown` → 创建临时绘图 → `pointermove` → 更新预览 → `pointerup` → 提交。

## TypeScript 配置要点

- 严格模式全开（`strict: true`）
- 禁止未使用的局部变量和参数（`noUnusedLocals`、`noUnusedParameters`）
- 路径别名：`@/*` → `./src/*`

## 球员渲染与交互

### 渲染顺序

PlayersLayer 中 `sortedPlayers` 按客队（红色）→ 主队（白色）排序，SVG 后渲染的在上层，因此白队圆点始终覆盖红队。拖拽中的球员会被移到数组末尾以置顶显示。

### 动态圆点尺寸

球员圆点半径根据屏幕���适应，通过 ResizeObserver 监听 SVG 实际渲染尺寸：
- 横屏基础半径 20 SVG 单位，竖屏 9 SVG 单位
- 保证屏幕上至少 24px（小屏时自动放大 SVG 单位半径）
- 交互热区为可见半径的 2 倍，描边和字号等比缩放
- 竖屏时工具栏和球场容器 padding 压缩，最大化球场纵向空间

### 位置标签

位置缩写（GK、LB、CB 等）定义在 `Formation.positionLabels` 中，由阵型决定、不可编辑。TacticalBoard 计算 `positionLabelMap`（球员 ID → 位置缩写）传给编辑弹窗只读显示。圆点上只显示姓名。

### 球员名单

`src/data/roster.ts` 存放预设球员名单（32 人）。PlayerEditDialog 提供名字按钮网格（支持输入过滤），RosterEditDialog 通过 HTML5 datalist 提供自动补全。
