---
title: "pnpm view"
headingIds: ["usage","options","--json"]
---

自 v11.0.0 起提供

别名： `info`, `show`

从 registry 查看包元数据。

```bash
pnpm view <pkg>
pnpm view <pkg> [field]
pnpm view [field]
```

## 用法

显示某个包的全部元数据：

```bash
pnpm view express
```

显示特定字段：

```bash
pnpm view express version
pnpm view express dependencies
pnpm view express dist-tags
```

显示特定版本的元数据：

```bash
pnpm view express@4.18.0
```

未提供包名时，`pnpm view` 会向上查找最近的项目清单文件（`package.json`、`package.yaml` 或 `package.json5`）并使用其 `name` 字段。若清单文件存在但没有 `name`，命令将失败。

## 选项

### --json

以 JSON 格式输出元数据。
