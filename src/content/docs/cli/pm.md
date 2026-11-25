---
title: "pnpm pm"
headingIds: ["example"]
---

`pnpm pm <command>` 语法始终运行 pnpm 内置命令，绕过 `package.json` 中任何同名脚本。

部分内置命令可以被脚本覆盖。例如，如果你的项目在 `package.json` 中定义了 `"clean"` 脚本，那么 `pnpm clean` 会运行该脚本而不是内置的 [pnpm clean](/docs/cli/clean)。使用 `pnpm pm clean` 可强制运行内置命令。

存在同名脚本时，以下命令会运行该脚本：

- [clean](/docs/cli/clean) 及其别名 `purge`
- [rebuild](/docs/cli/rebuild) 及其别名 `rb`
- [deploy](/docs/cli/deploy)
- [setup](/docs/cli/setup)
- [tasks](/docs/cli/tasks)

别名会查找自己对应的脚本名，因此 `pnpm rb` 运行的是 `rb` 脚本，而不是 `rebuild` 脚本。

在工作区中，如果根 `package.json` 有一个同名的脚本，从子目录运行上述命令会以 `ERR_PNPM_SCRIPT_OVERRIDE_IN_WORKSPACE_ROOT` 失败。运行 `pnpm pm <command>` 可以使用内置命令，或者在工作区根目录运行 `pnpm run <command>` 来运行脚本。

## 示例

package.json

```json
{
  "scripts": {
    "clean": "rm -rf dist"
  }
}
```

```sh
# Runs the "clean" script from package.json
pnpm clean
# or explicitly:
pnpm run clean

# Runs the built-in pnpm clean command
pnpm pm clean
```
