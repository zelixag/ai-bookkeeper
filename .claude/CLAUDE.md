# AI 记账 — 项目规则

## 技术栈
- Vue 3 (Composition API + `<script setup>`)
- TypeScript strict
- Vite + pnpm
- TailwindCSS v4 + Vant 4（移动端 UI）
- Pinia 状态管理
- 后端：Express（纯 API 代理，不存数据）
- 数据存储：前端 IndexedDB

## 分层架构
```
src/
  views/        → 页面组件（路由级）
  components/   → UI 组件（纯展示 + 交互）
  composables/  → 业务逻辑复用（use*.ts）
  services/     → API 调用（与后端通信）
  stores/       → Pinia 状态管理
  types/        → TypeScript 类型定义
  utils/        → 纯工具函数
```

## 编码规范
- 缩进 2 空格，单引号，无分号
- 文件名 kebab-case，组件 PascalCase
- 函数单一职责，每个文件 < 150 行
- 不用 `any`，不用 `var`
- 组件只负责 UI，逻辑放 composables
- API 调用只放 services/，不写在组件里

## 命令
- `pnpm dev` 启动前端
- `pnpm dev:server` 启动后端
- `pnpm build` 构建生产版本
- `pnpm lint` 代码检查

## 提交规范
- feat: 新功能
- fix: 修复
- refactor: 重构
- chore: 杂项
