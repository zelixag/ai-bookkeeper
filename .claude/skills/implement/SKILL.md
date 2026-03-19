---
name: implement
description: 按照设计方案实现功能代码
argument-hint: "[功能描述或设计方案引用]"
user-invocable: true
---

实现功能「$ARGUMENTS」：

1. 阅读 CLAUDE.md 确认规范
2. 确认设计方案已存在（如无，先提示用户运行 /design）
3. 调用 senior-dev Agent 按分层顺序实现：
   - types/ → 类型定义
   - services/ → API 调用
   - composables/ → 业务逻辑
   - components/ → UI 组件
   - views/ → 页面组装
   - stores/ → 状态管理（如需要）
4. 每完成一层，验证 TypeScript 无报错
5. 完成后提示用户运行 /review
