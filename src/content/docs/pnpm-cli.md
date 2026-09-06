---
title: "pnpm CLI"
headingIds: ["short-aliases","differences-vs-npm","options","-c-path---dir-path","-w---workspace-root","commands","environment-variables"]
---

## 短别名

自 v11.0.0 起提供

`pn` 是 `pnpm` 的短别名，[pnx](/docs/cli/pnx) 是 `pnpm dlx` 的短别名。凡是能用 `pnpm` 或 `pnpx` 的地方都可以使用它们：

```bash
pn install
pn add express
pn build
pn test
pnx create-vue my-app
```

## 与 npm 的差异

与 npm 不同，pnpm 会校验所有选项。例如，`pnpm install --target_arch x64` 会失败，因为 `--target_arch` 不是 `pnpm install` 的有效选项。

不过，某些依赖可能使用 `npm_config_` 环境变量，该变量由 CLI 选项填充。这种情况下，你有以下选择：

1. 显式设置环境变量：`npm_config_target_arch=x64 pnpm install`
2. 用 `--config.` 强制传入未知选项：`pnpm install --config.target_arch=x64`

## 选项

### -C <path>, --dir <path>

视同 pnpm 从 `<path>` 而非当前工作目录启动来执行。

### -w, --workspace-root

视同 pnpm 从[工作区](/docs/workspaces)根目录而非当前工作目录启动来执行。

## 命令

更多信息见各个 CLI 命令的文档。以下是一份实用的 npm 等价命令列表，供你快速上手：

| **npm 命令** | **pnpm 等价命令** |
| --- | --- |
| `npm install` | [pnpm install](/docs/cli/install) |
| `npm i <pkg>` | [pnpm add <pkg>](/docs/cli/add) |
| `npm run <cmd>` | [pnpm <cmd>](/docs/cli/run) |
| `npx <pkg>` | [pnx <pkg>](/docs/cli/pnx) |

使用未知命令时，pnpm 会查找同名的脚本，因此 `pnpm run lint` 与 `pnpm lint` 等价。若不存在指定名称的脚本，pnpm 会将该命令作为 shell 脚本执行，所以你可以运行 `pnpm eslint` 这类命令（参见 [pnpm exec](/docs/cli/exec)）。

## 环境变量

一些与 pnpm 无关的环境变量也可能改变 pnpm 的行为：

- [CI](/docs/cli/install#--frozen-lockfile)

以下环境变量可能影响 pnpm 存储全局信息所使用的目录：

- `XDG_CACHE_HOME`
- `XDG_CONFIG_HOME`
- `XDG_DATA_HOME`
- `XDG_STATE_HOME`

你可以搜索文档，找到利用这些环境变量的设置。
