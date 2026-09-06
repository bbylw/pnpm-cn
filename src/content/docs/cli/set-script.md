---
title: "pnpm set-script"
headingIds: ["examples","see-also"]
---

自 v11.3.0 起提供

别名： `ss`

在项目清单的 `scripts` 字段中添加或更新条目

```bash
pnpm set-script <name> <command>
```

支持 `package.json`、`package.json5` 和 `package.yaml` 清单格式

如果 `scripts` 字段不存在，则创建它。如果已存在同名的脚本，则会被覆盖

## 示例

```bash
pnpm set-script test "vitest run"
pnpm set-script build "tsc -p ."
pnpm ss lint "eslint ."
```

上述操作等同于手动编辑 `package.json`：

```json
{
  "scripts": {
    "test": "vitest run",
    "build": "tsc -p .",
    "lint": "eslint ."
  }
}
```

## 另见

- [pnpm pkg set](/docs/cli/pkg#set)，用于在 `package.json` 中设置任意字段，包括通过 `scripts.<name>=<command>` 设置单个脚本。
