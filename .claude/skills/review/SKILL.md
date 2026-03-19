---
name: review
description: 审查当前变更的代码质量
user-invocable: true
---

审查当前代码变更：

1. 运行 `git diff` 获取所有变更
2. 调用 code-reviewer Agent 逐文件审查
3. 输出审查结果（必须修复 / 建议修复 / 可选优化）
4. 如有必须修复项，等待修复后再提交
5. 全部通过后提示用户可以提交
