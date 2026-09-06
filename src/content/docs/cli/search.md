---
title: "pnpm search"
headingIds: ["examples","options","--json","--search-limit-number"]
---

自 v11.0.0 起提供

别名： `s`, `se`, `find`

在 registry 中搜索与给定关键词匹配的包

```bash
pnpm search <keyword> [<keyword> ...]
```

## 示例

```bash
pnpm search webpack plugin
pnpm search @types/node
```

## 选项

### --json

以 JSON 格式输出搜索结果

### --search-limit <number>

- 默认值：**20**

显示的最大结果数
