---
name: design
description: 设计一个功能的架构方案和 UI 布局
argument-hint: "[功能描述]"
user-invocable: true
---

为功能「$ARGUMENTS」做完整设计：

1. 调用 architect Agent 输出技术方案（模块划分、数据流、API、文件列表）
2. 调用 ui-designer Agent 输出 UI 设计（布局、组件拆分、Vant 组件、交互流程）
3. 汇总为一份可执行的实施方案，等待用户确认后再进入实现
