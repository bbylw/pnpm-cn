---
title: "pnpm pm"
headingIds: ["example"]
---

`pnpm pm <command>` 语法始终运行 pnpm 内置命令，绕过 `package.json` 中任何同名脚本。

部分内置命令可以被脚本覆盖。例如，如果你的项目在 `package.json` 中定义了 `"clean"` 脚本，那么 `pnpm clean` 会运行该脚本而不是内置的 [pnpm clean](/docs/cli/clean)。使用 `pnpm pm clean` 可强制运行内置命令。

## 示例

package.json

```json
{
  "scripts": {
    "clean": "rm -rf dist"
  }
}
```

```bash
# Runs the "clean" script from package.json
pnpm clean
# or explicitly:
pnpm run clean

# Runs the built-in pnpm clean command (removes node_modules)
pnpm pm clean
```
