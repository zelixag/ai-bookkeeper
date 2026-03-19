# AI 记账 — 语音记账 H5 Web App

说一句话，自动记账。

---

## 技术栈

| 层面 | 选择 | 理由 |
|------|------|------|
| 框架 | Vue 3 (Composition API + script setup) | 主流、生态好 |
| 语言 | TypeScript strict | 类型安全 |
| 构建 | Vite + pnpm | 极速开发 |
| 样式 | TailwindCSS v4 | 原子化 CSS |
| UI 库 | Vant 4 | 移动端最成熟（70+ 组件） |
| 状态 | Pinia | Vue 官方推荐 |
| 路由 | Vue Router 4 | 标配 |
| 后端 | Express + TS | 纯 API 代理，不存数据 |
| 存储 | IndexedDB（前端本地） | 隐私优先 |
| AI | 豆包 API | 文本→结构化账单 |
| ASR | 腾讯云 | 语音→文字 |
| 规范 | ESLint + Prettier | 自动格式化 |
| 测试 | Vitest（后续） | Vite 原生 |

## 项目架构

```
src/
  views/        → 页面组件（路由级）
  components/   → UI 组件（纯展示 + 交互）
  composables/  → 业务逻辑复用（use*.ts）
  services/     → API 调用（与后端通信）
  stores/       → Pinia 状态管理
  types/        → TypeScript 类型定义
  utils/        → 纯工具函数

server/
  routes/       → API 路由（parse + asr）
  services/     → 外部 API 调用（豆包 + 腾讯云）
```

---

## AI 编程基础设施

这是本项目的核心实践——用 Claude Code 的完整能力搭建一套 **AI 协作开发流水线**。

### 目录总览

```
.claude/
├── CLAUDE.md                    # 项目规则
├── agents/                      # AI Agent 团队（5 个角色）
│   ├── architect.md             #   架构师
│   ├── senior-dev.md            #   资深工程师
│   ├── code-reviewer.md         #   代码审查员
│   ├── ui-designer.md           #   UI 设计师
│   └── debugger.md              #   调试专家
├── skills/                      # 自定义命令（3 个工作流）
│   ├── design/SKILL.md          #   /design [功能] → 架构+UI 设计
│   ├── implement/SKILL.md       #   /implement [功能] → 分层实现
│   └── review/SKILL.md          #   /review → 代码审查
├── settings.json                # Hooks 自动化
└── (hooks/)                     # Hook 脚本（按需添加）
.env                             # API Keys（不提交）
.gitignore
```

---

### 1. CLAUDE.md — 项目规则

**作用**：每次对话自动加载，确保 AI 遵循项目规范。

**内容**：
- 技术栈声明
- 分层架构定义
- 编码规范（缩进、命名、文件大小限制）
- 命令约定

**最佳实践**：
- 控制在 50 行以内，精简明确
- 只写"AI 不看代码就会犯错的事"
- 项目演进时同步更新

---

### 2. Custom Agents — AI 团队

**作用**：每个 Agent 是一个专业角色，有独立的系统提示、工具权限和工作流程。

| Agent | 文件 | 职责 | 模型 | 工具权限 |
|-------|------|------|------|---------|
| **architect** | `agents/architect.md` | 设计方案、模块划分、数据流 | opus | 只读（Read/Glob/Grep/Web） |
| **senior-dev** | `agents/senior-dev.md` | 实现代码、遵循规范 | opus | 读写（Read/Write/Edit/Bash） |
| **code-reviewer** | `agents/code-reviewer.md` | 审查质量、规范、安全 | sonnet | 只读（Read/Glob/Grep/Bash） |
| **ui-designer** | `agents/ui-designer.md` | 页面布局、组件拆分、交互 | opus | 只读（Read/Glob/Web） |
| **debugger** | `agents/debugger.md` | 分析日志、追踪数据流、定位 bug | opus | 只读 + Bash |

**计划添加**（按需）：

| Agent | 职责 | 使用时机 |
|-------|------|---------|
| `test-writer` | 写单元测试/集成测试 | 功能完成后 |
| `perf-optimizer` | 性能分析和优化 | 上线前 |
| `devops` | CI/CD、部署配置 | 部署阶段 |

**最佳实践**：
- 架构 Agent 不写代码，工程 Agent 不做设计
- 审查 Agent 用 sonnet（便宜快速），设计/实现用 opus（质量高）
- `disallowedTools` 限制权限，防止越界

---

### 3. Custom Skills — 工作流命令

**作用**：把多步操作封装成一个 `/命令`，标准化开发流程。

| 命令 | 触发 | 做什么 |
|------|------|--------|
| `/design 语音记账` | 手动 | architect 设计方案 + ui-designer 设计 UI → 等你审核 |
| `/implement 语音记账` | 手动 | senior-dev 按 types→services→composables→components→views 分层实现 |
| `/review` | 手动 | code-reviewer 审查 git diff → 输出问题列表 |

**最佳实践**：
- Skill 是流程编排，不是具体代码
- 每个 Skill 结束时给用户一个明确的下一步提示
- 使用 `$ARGUMENTS` 接收参数

---

### 4. Hooks — 自动化

**作用**：在特定事件（文件保存、工具调用）时自动执行脚本。

| 事件 | 触发时机 | 当前配置 |
|------|---------|---------|
| `PostToolUse (Edit/Write)` | 文件被修改后 | 自动 Prettier 格式化 |
| `PreToolUse (Edit/Write)` | 文件被修改前 | 阻止修改 .env 等敏感文件 |

**最佳实践**：
- Hook 脚本要快（< 1 秒），否则影响交互
- 用 exit code 2 阻止操作，stderr 输出原因
- 敏感文件保护是必备项

---

### 5. MCP — 外部工具（待配置）

**作用**：连接 GitHub、数据库等外部服务，让 AI 直接操作。

**计划接入**：
- GitHub MCP（PR、Issue 管理）
- 其他按需添加

---

## 开发流程

```
┌─────────────────────────────────────────────────────┐
│  1. 需求                                             │
│     你描述要做什么                                     │
│                                                      │
│  2. /design [功能]                                   │
│     architect → 技术方案                              │
│     ui-designer → UI 布局                            │
│     → 你审核确认                                      │
│                                                      │
│  3. /implement [功能]                                │
│     senior-dev → 分层实现代码                         │
│     (自动 Prettier 格式化)                            │
│                                                      │
│  4. /review                                          │
│     code-reviewer → 审查质量                          │
│     → 有问题就修，没问题就提交                          │
│                                                      │
│  5. git commit + push                                │
│                                                      │
│  (出 bug) → debugger 排查                            │
│  (后续) → test-writer / perf-optimizer / devops       │
└─────────────────────────────────────────────────────┘
```

---

## 命令

```bash
pnpm dev          # 启动前端
pnpm dev:server   # 启动后端
pnpm build        # 构建生产版本
pnpm lint         # 代码检查
```

---

## 如何复用这套基础设施

1. 复制 `.claude/` 目录到你的新项目
2. 修改 `CLAUDE.md` 中的技术栈和规范
3. 按需调整 Agent 的系统提示
4. 按需添加 Skills 和 Hooks
