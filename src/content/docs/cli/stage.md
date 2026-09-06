---
title: "pnpm stage"
headingIds: ["subcommands","publish","list","view","approve","reject","download","options","--registry-url","--tag-tag","--access-publicrestricted","--json","--dry-run","--otp-otp","--recursive--r","--filter-package_selector"]
---

自 v11.3.0 起提供

使用 npm 的[分阶段发布](https://docs.npmjs.com/staged-publishing)工作流为发布准备包。分阶段的版本在明确批准之前不会被 `pnpm install` 解析，让你可以把在线证明（2FA）推迟到稍后的时间点，适用于验证发布产物、对 CI 做冒烟测试，或协调多包发布。

```bash
pnpm stage <subcommand> [options]
```

## 子命令

### publish

为一个包的发布做分阶段准备

```bash
pnpm stage publish [<tarball>|<dir>] [--tag <tag>] [--access <public|restricted>] [options]
```

接受与 [pnpm publish](/docs/cli/publish) 相同的参数，但把 tarball 上传到分阶段暂存，而不是提升到正式 registry。所产生的 **stage id** 会被打印出来，可用于其他子命令。

使用 `--recursive`（或 `-r`）暂存工作区中每个可发布的包

### list

列出所有分阶段的包版本，或列出某个特定包的分阶段版本

```bash
pnpm stage list [<package-spec>]
```

### view

显示某个特定分阶段的版本的详细信息

```bash
pnpm stage view <stage-id>
```

### approve

批准一个分阶段的版本，将其提升到正式 registry。这一步会消耗一次性密码

```bash
pnpm stage approve [<stage-id>...] [--otp <otp>]
```

自 v12.0.0 起，可以一次批准多个 stage id，不带任何 id 运行 `approve` 会在分阶段的版本上打开一个交互式选择器：

```bash
pnpm stage approve                     # pick interactively
pnpm stage approve <stage-id> <stage-id>
```

整批通过**一个**一次性密码批准；只在 registry 停止接受当前密码时，pnpm 才要求提供新的。

在工作区内，选定的包按依赖顺序批准；若某包的工作区依赖无法批准，该包会被跳过，而不是针对一个从未到达 registry 的依赖进行发布。

### reject

拒绝一个分阶段的版本，并将其从分阶段暂存中移除

```bash
pnpm stage reject <stage-id> [--otp <otp>]
```

### download

下载某个分阶段的版本的 tarball 以供检查

```bash
pnpm stage download <stage-id>
```

## 选项

### --registry <url>

npm registry 的基础 URL。默认为所配置的默认 registry

### --tag <tag>

以给定的 dist-tag 注册分阶段的包。默认为 `latest`

### --access <public|restricted>

告知 registry 分阶段的包应为公开还是受限

### --json

以 JSON 格式显示信息。适用于 `list`、`view`、`publish` 和 `download`

### --dry-run

执行 `stage publish` 会做的所有事情，除了上传到 registry

### --otp <otp>

`approve` 和 `reject` 的一次性密码

### --recursive, -r

暂存工作区中所有可发布的包

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
