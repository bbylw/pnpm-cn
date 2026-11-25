---
title: "pnpm permissions"
headingIds: ["commands","pnpm-permissions-approve","--all","--global--g","pnpm-permissions-list"]
---

自 v12.11.0 起提供

审查依赖可以做什么：运行构建脚本（`build`）和提供 [Agent 技能](/docs/agent-skills)（`skills`）。这些决策保存在 `pnpm-workspace.yaml` 的 [`permissions`](/docs/settings/build#permissions) 设置中。

## 命令

### pnpm permissions approve

别名：`pnpm approve`

批准或拒绝待批准的依赖所请求的权限。跳过某个包的构建脚本或技能的安装会把它记录为待批准，因此请先运行 `pnpm install`。每个包只出现一次，并列出它请求的全部内容：

```
drizzle-kit  build, skills
esbuild      build
```

不带包参数也不带 `--all` 时，会通过交互式提示选择包。在 CI 中或没有交互式终端时，如果还有待批准的包，不带包参数和 `--all` 运行 `pnpm approve` 会以 `ERR_PNPM_APPROVE_NON_INTERACTIVE` 失败。你没有选中的包会被拒绝。对于你批准且包含多个技能的包，后续提示会列出这些技能，由你选择要链接哪些。未被选中的技能既不会被链接也不会再次提供：记录的列表即 pnpm 可以链接的技能清单。当你的项目首次批准技能时，pnpm 还会询问要链接到哪些 Agent 技能目录，并把选择记录为 [`skills.dirs`](/docs/settings/build#skillsdirs)。若一个目录都不选，则由检测到的目录决定。

你也可以直接传入包名，用 `!` 前缀表示拒绝：

```sh
pnpm approve drizzle-kit !esbuild
```

被指名的包会就其请求的全部内容一并批准或拒绝，包括它附带的每个技能。如果被指名的包没有待处理的请求，pnpm 会询问要预先授予哪些权限。每项权限初始都未勾选。保持某项未勾选即保留它当前的设置。取消提示不会保存本次命令的任何决策。

在 CI 中或没有交互式终端时，指名批准一个没有待处理请求的包会在保存任何决策之前失败。若要无人值守地使用，请显式设置该包的 [`permissions`]，或使用 [`pnpm approve-builds`](/docs/cli/approve-builds) 做构建决策。显式拒绝（`!<pkg>`）在没有待处理请求时仍会拒绝所有能力。

每个 Git 包按仓库各出现一次。按 **空格** 批准其待处理的提交，或按 **R** 同时包含未来的提交。按 **回车** 保存。要批准单个修订，请把完整的提交选择器传给 `pnpm approve`。`--all` 只批准待处理的提交。

若想在更新过程中无需提示就批准某个 Git 包，请传入包名以及不带提交或分支后缀的 `git+` 仓库 URL。对于 `github:` 依赖，URL 以 `.git` 结尾。参见[仓库匹配规则](/docs/settings/build#allowbuilds)。

```sh
pnpm approve 'example@git+https://github.com/example/project.git'
```

这会批准来自该仓库的任意提交所请求的能力。如果裸包名或分支选择器无法匹配到待处理的 Git 包，pnpm 会列出有效的选择器，并且不保存任何决策。

决策写入后，pnpm 会重建被批准构建的包，并链接被批准的 Agent 技能。

只有当 `pnpm-workspace.yaml` 中已经存在 `permissions` 设置时，`build` 决策才会写入 `permissions`。否则会写入 [`allowBuilds`](/docs/settings/build#allowbuilds)，旧版 pnpm 也能读取它。

#### --all

不做交互式提示，直接批准所有待批准的内容。

#### --global, -g

为[全局安装的包](/docs/global-packages)批准权限。

pnpm 会收集每个[隔离安装组](/docs/global-packages#isolated-installations)中待批准的包，统一询问一次，并把决策写入全局 `config.yaml` 的 [`globalPackagesConfig.permissions`](/docs/configuring#settings-for-global-packages)。技能目录的选择会写入 `globalPackagesConfig.skills.dirs`。随后只有真正包含已批准包的组会被重建，已批准的技能会被链接到用户主目录下的 Agent 技能目录中。

### pnpm permissions list

别名：`pnpm permissions`、`pnpm permissions ls`

列出已授予和已拒绝的权限，以及待批准的包。
