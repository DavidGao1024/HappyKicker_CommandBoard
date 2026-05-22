# 云端同步登录功能实现计划

## 项目目标

为 CommandBoard 足球战术板添加用户登录和云端数据同步功能，支持跨设备保存和加载自定义阵型、球员名单及个人偏好设置。

---

## 技术方案

### 数据存储方案：GitHub 仓库作为数据库

**核心思路：**
- 使用 GitHub API 直接读写 JSON 文件
- 每个用户数据存储为独立文件（避免多用户写入冲突）
- 前端直接调用 GitHub API，无需独立后端服务器

**仓库结构：**
```
CommandBoard（代码仓库）
  ├── src/（前端代码）
  └── dist/（构建产物，部署到 GitHub Pages）

CommandBoard-Data（新建数据仓库，独立管理）
  └── users/
      ├── user_abc123.json（用户 A 的数据）
      ├── user_def456.json（用户 B 的数据）
      └── ...
```

**优点：**
- ✅ 完全免费
- ✅ 不需要额外服务器部署
- ✅ 数据自动备份（Git 历史记录）
- ✅ 适合中小规模使用

**局限性：**
- ⚠️ 同一用户在多设备同时保存可能冲突（通过重试机制缓解）
- ⚠️ 不适合高并发场景（个人/小团队项目足够）

---

## 实现步骤

### 阶段一：准备工作

**1.1 创建数据仓库**
- 在 GitHub 新建仓库 `CommandBoard-Data`（Public 或 Private）
- 初始化 README.md
- 创建 `users/` 目录

**1.2 生成 GitHub Personal Access Token**
- 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- 生成 token，权限勾选：`repo`（完整仓库访问权限）
- 保存 token（只显示一次）

---

### 阶段二：前端功能实现

**2.1 新增 Composables**

**`src/composables/useAuth.ts`**
- 用户认证状态管理
- 功能：
  - 注册（用户名 + 密码，密码使用 SHA-256 哈希）
  - 登录（验证密码哈希）
  - 登出
  - 自动登录（localStorage 保存 token）
- 数据结构：
  ```typescript
  interface User {
    id: string;           // 唯一标识（UUID）
    username: string;     // 用户名
    passwordHash: string; // 密码哈希
    createdAt: string;    // 注册时间
  }
  ```

**`src/composables/useGitHubStorage.ts`**
- GitHub API 封装
- 功能：
  - 读取文件（GET /repos/{owner}/{repo}/contents/{path}）
  - 写入文件（PUT /repos/{owner}/{repo}/contents/{path}）
  - 冲突重试机制（获取最新 SHA 后重新提交）
- 配置：
  ```typescript
  const GITHUB_CONFIG = {
    owner: 'YourGitHubUsername',
    repo: 'CommandBoard-Data',
    token: 'ghp_xxxxx', // Personal Access Token
    branch: 'main'
  };
  ```

**`src/composables/useUserData.ts`**
- 用户数据同步管理
- 功能：
  - 加载云端数据（登录后自动调用）
  - 保存数据到云端（防抖 2 秒，避免频繁提交）
  - 离线模式（未登录时使用 localStorage）
- 数据结构：
  ```typescript
  interface UserData {
    formations: {
      home: Formation[];  // 主队自定义阵型
      away: Formation[];  // 客队自定义阵型
    };
    players: Player[];    // 球员名单
    preferences: {
      defaultTeam: 'home' | 'away';
      defaultDrawColor: string;
      autoSave: boolean;
    };
    lastModified: string; // 最后修改时间
  }
  ```

**2.2 修改现有 Composables**

**`src/composables/usePlayers.ts`**
- 添加数据变更监听
- 变更时触发 `useUserData.saveToCloud()`

**`src/composables/useFormations.ts`**
- 支持自定义阵型的增删改
- 变更时触发云端保存

**2.3 新增 UI 组件**

**`src/components/LoginDialog.vue`**
- 登录/注册表单
- 切换登录/注册模式
- 错误提示（用户名已存在、密码错误等）
- 样式与现有 Dialog 组件保持一致

**`src/components/UserMenu.vue`**
- 显示当前登录用户
- 登出按钮
- 同步状态指示器（同步中/已同步/同步失败）

**2.4 修改主界面**

**`src/components/Toolbar.vue`**
- 添加"登录"按钮（未登录时显示）
- 添加用户菜单（已登录时显示）

**`src/components/TacticalBoard.vue`**
- 集成 `useAuth` 和 `useUserData`
- 登录成功后自动加载云端数据
- 登出时清空数据（可选保留到 localStorage）

---

### 阶段三：安全性增强

**3.1 密码加密**
- 使用 Web Crypto API 的 SHA-256 哈希
- 不存储明文密码

**3.2 Token 安全**
- GitHub Token 存储在环境变量（`.env` 文件）
- 生产构建时通过 Vite 注入
- 不提交到代码仓库（`.gitignore` 排除 `.env`）

**3.3 数据校验**
- 加载云端数据时校验 JSON 格式
- 防止恶意数据注入

---

### 阶段四：用户体验优化

**4.1 自动保存**
- 使用防抖（debounce）机制，2 秒无操作后自动保存
- 保存时显示"同步中"提示

**4.2 冲突处理**
- 检测到冲突时自动重试（最多 3 次）
- 重试失败时提示用户手动刷新

**4.3 离线支持**
- 未登录时数据存储在 localStorage
- 登录后提示是否上传本地数据到云端

**4.4 加载状态**
- 登录时显示加载动画
- 数据同步时显示进度提示

---

## 数据流程图

```
用户操作（拖拽球员/切换阵型）
    ↓
Composable 状态更新（usePlayers/useFormations）
    ↓
useUserData 监听变更
    ↓
防抖 2 秒
    ↓
useGitHubStorage.writeFile()
    ↓
GitHub API PUT 请求
    ↓
提交到 CommandBoard-Data 仓库
```

---

## 文件清单

### 新增文件
```
src/composables/
  ├── useAuth.ts              # 用户认证
  ├── useGitHubStorage.ts     # GitHub API 封装
  └── useUserData.ts          # 数据同步

src/components/
  ├── LoginDialog.vue         # 登录/注册弹窗
  └── UserMenu.vue            # 用户菜单

src/utils/
  └── crypto.ts               # 密码哈希工具

.env.example                  # 环境变量模板
```

### 修改文件
```
src/composables/
  ├── usePlayers.ts           # 添加数据变更监听
  └── useFormations.ts        # 添加自定义阵型管理

src/components/
  ├── Toolbar.vue             # 添加登录按钮/用户菜单
  └── TacticalBoard.vue       # 集成认证和数据同步

.gitignore                    # 排除 .env 文件
```

---

## 部署配置

### 环境变量配置

**开发环境（`.env`）：**
```env
VITE_GITHUB_OWNER=YourGitHubUsername
VITE_GITHUB_REPO=CommandBoard-Data
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

**生产环境（GitHub Pages）：**
- 在 GitHub Actions 中配置 Secrets
- 构建时注入环境变量

### GitHub Actions 配置

**`.github/workflows/deploy.yml`**
```yaml
- name: Build
  env:
    VITE_GITHUB_OWNER: ${{ secrets.GITHUB_OWNER }}
    VITE_GITHUB_REPO: ${{ secrets.GITHUB_REPO }}
    VITE_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: npm run build
```

---

## 测试计划

### 功能测试
- [ ] 注册新用户
- [ ] 登录已有用户
- [ ] 密码错误提示
- [ ] 用户名重复提示
- [ ] 保存阵型到云端
- [ ] 加载云端阵型
- [ ] 多设备同步
- [ ] 登出清空数据

### 边界测试
- [ ] 网络断开时的错误处理
- [ ] GitHub API 限流处理（每小时 5000 次请求）
- [ ] 并发写入冲突重试
- [ ] 大数据量保存（>100KB JSON）

### 安全测试
- [ ] 密码哈希验证
- [ ] Token 不泄露到前端代码
- [ ] XSS 防护（用户名输入过滤）

---

## 时间估算

| 阶段 | 预计时间 |
|------|---------|
| 准备工作（创建仓库、生成 Token） | 0.5 小时 |
| 实现 Composables | 3 小时 |
| 实现 UI 组件 | 2 小时 |
| 集成到主界面 | 1 小时 |
| 安全性增强 | 1 小时 |
| 测试和调试 | 2 小时 |
| **总计** | **9.5 小时** |

---

## 后续扩展

### 可选功能
- 分享阵型（生成分享链接）
- 阵型模板库（公共阵型）
- 数据导出/导入（JSON 文件）
- 多语言支持（英文界面）

### 迁移到真实数据库
如果用户量增长，可迁移到：
- Supabase（PostgreSQL 云数据库）
- Firebase（Google 云服务）
- 自建后端（Node.js + SQLite/PostgreSQL）

---

## 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| GitHub API 限流 | 用户无法保存数据 | 添加限流检测和提示 |
| Token 泄露 | 数据仓库被恶意修改 | 使用 GitHub Actions Secrets |
| 并发冲突 | 数据丢失 | 实现重试机制 + 用户提示 |
| 数据仓库过大 | Git 性能下降 | 定期归档旧数据 |

---

## 文档输出

完成后提供以下文档：
1. **用户使用手册**（如何注册、登录、同步数据）
2. **部署指南**（如何配置 GitHub Token 和环境变量）
3. **开发者文档**（API 接口说明、数据结构）

---

**计划制定时间：** 2026-05-22  
**预计开始时间：** 待用户确认  
**预计完成时间：** 开始后 2-3 天（按每天 3-4 小时开发时间计算）
