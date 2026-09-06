---
title: "工作区"
headingIds: ["workspace-protocol-workspace","referencing-workspace-packages-through-aliases","referencing-workspace-packages-through-their-relative-path","publishing-workspace-packages","release-workflow","troubleshooting","usage-examples","configuration","linkworkspacepackages","injectworkspacepackages","dedupeinjecteddeps","syncinjecteddepsafterscripts","preferworkspacepackages","sharedworkspacelockfile","saveworkspaceprotocol","includeworkspaceroot","ignoreworkspacecycles","disallowworkspacecycles","failifnomatch"]
---

pnpm 内置支持 monorepo（单体仓库，也称多包仓库、多项目仓库或单体仓库）。你可以创建一个工作区，将多个项目统一到单个仓库中。

工作区的根目录必须有一个 [pnpm-workspace.yaml](/docs/settings) 文件。

:::tip[提示]

如果你在研究 monorepo 管理，也可以了解一下 [Bit](https://bit.dev/?utm_source=pnpm&utm_medium=workspace_page)。Bit 底层使用 pnpm，但能自动化许多在传统 pnpm/npm/Yarn 工作区中需要手动完成的事情。有一篇关于 `bit install` 的文章对此做了介绍：[用 Bit 实现无痛的 monorepo 依赖管理](https://bit.dev/blog/painless-monorepo-dependency-management-with-bit-l4f9fzyw?utm_source=pnpm&utm_medium=workspace_page)。

:::

## 工作区协议（workspace:）

如果把 [linkWorkspacePackages](#linkworkspacepackages) 设为 `true`，当工作区中可用的包与声明的范围匹配时，pnpm 会链接这些包。例如，如果 `bar` 的 dependencies 中有 `"foo": "^1.0.0"`，并且工作区中存在 `foo@1.0.0`，那么 `foo@1.0.0` 会被链接进 `bar`。不过，如果 `bar` 的 dependencies 中有 `"foo": "2.0.0"`，而工作区中没有 `foo@2.0.0`，那么 `foo@2.0.0` 将从 registry 安装。这种行为会带来一些不确定性。

好在 pnpm 支持 `workspace:` 协议。使用该协议时，pnpm 只会解析到本地工作区包，不会解析为其他内容。因此，如果你设置 `"foo": "workspace:2.0.0"`，这次安装就会失败，因为工作区中不存在 `"foo@2.0.0"`。

当 [linkWorkspacePackages](#linkworkspacepackages) 选项设为 `false` 时，这个协议尤其有用。在这种情况下，只有使用了 `workspace:` 协议的包，pnpm 才会从工作区链接它们。

### 通过别名引用工作区包

假设工作区中有一个名为 `foo` 的包。通常你会写成 `"foo": "workspace:*"`。

如果你想用另一个别名，下面的语法同样可行：`"bar": "workspace:foo@*"`。

发布前，别名会被转换为普通的别名依赖。上面的示例会变成：`"bar": "npm:foo@1.0.0"`。

### 通过相对路径引用工作区包

在一个包含 2 个包的工作区中：

```
+ packages
	+ foo
	+ bar
```

`bar` 可以在其依赖中把 `foo` 声明为 `"foo": "workspace:../foo"`。发布前，这些说明符会被转换为所有包管理器都支持的普通版本说明符。

### 发布工作区包

当工作区包被打包成归档文件时（无论是通过 `pnpm pack` 还是像 `pnpm publish` 这样的发布命令），我们会动态地替换任意 `workspace:` 依赖，替换为：

- 目标工作区中对应的版本（如果你使用 `workspace:`、`workspace:*`、`workspace:~` 或 `workspace:^`）
- 关联的 semver 范围（对于其他任何范围类型）

不带版本范围的裸 `workspace:` 会被视为 `workspace:*`。

例如，如果工作区中有 `foo`、`bar`、`qar`、`zoo`，且它们都是 `1.5.0` 版本，那么下面这些：

```json
{
	"dependencies": {
		"foo": "workspace:*",
		"bar": "workspace:~",
		"qar": "workspace:^",
		"zoo": "workspace:^1.5.0"
	}
}
```

会被转换为：

```json
{
	"dependencies": {
		"foo": "1.5.0",
		"bar": "~1.5.0",
		"qar": "^1.5.0",
		"zoo": "^1.5.0"
	}
}
```

这个功能让你可以依赖本地工作区包，同时仍能把生成的包发布到远程 registry，而无需中间的发布步骤。你的使用方可以像使用任何其他包一样使用你发布的工作区，同时享受 semver 带来的保证。

## 发布流程

在工作区内为包做版本管理是一项复杂的任务，pnpm 目前并未提供内置的解决方案。不过，有 2 个经过充分测试的工具可以处理版本管理并支持 pnpm：

- [changesets](https://github.com/changesets/changesets)
- [Rush](https://rushjs.io)

关于如何使用 Rush 搭建仓库，阅读[该页面](https://rushjs.io/pages/maintainer/setup_new_repo)。

关于将 Changesets 与 pnpm 一起使用，阅读[本指南](/docs/using-changesets)。

## 故障排查

如果工作区依赖之间存在循环，pnpm 无法保证脚本按拓扑顺序运行。如果 pnpm 在安装期间检测到循环依赖，会发出警告。如果 pnpm 能找出是哪些依赖导致了循环，也会一并显示出来。

如果你看到 `There are cyclic workspace dependencies` 这条消息，检查 `dependencies`、`optionalDependencies` 和 `devDependencies` 中声明的工作区依赖。

## 用法示例

以下是几个使用 pnpm 工作区功能的最受欢迎的开源项目：

| **Project** | **Stars** | **迁移日期** | **迁移提交** |
| --- | --- | --- | --- |
| [Next.js](https://github.com/vercel/next.js) | ![](https://img.shields.io/github/stars/vercel/next.js) | 2022-05-29 | [f7b81316aea4fc9962e5e54981a6d559004231aa](https://github.com/vercel/next.js/commit/f7b81316aea4fc9962e5e54981a6d559004231aa) |
| [n8n](https://github.com/n8n-io/n8n) | ![](https://img.shields.io/github/stars/n8n-io/n8n) | 2022-11-09 | [736777385c54d5b20174c9c1fda38bb31fbf14b4](https://github.com/n8n-io/n8n/commit/736777385c54d5b20174c9c1fda38bb31fbf14b4) |
| [Material UI](https://github.com/mui/material-ui) | ![](https://img.shields.io/github/stars/mui/material-ui) | 2024-01-03 | [a1263e3e5ef8d840252b4857f85b33caa99f471d](https://github.com/mui/material-ui/commit/a1263e3e5ef8d840252b4857f85b33caa99f471d) |
| [Vite](https://github.com/vitejs/vite) | ![](https://img.shields.io/github/stars/vitejs/vite) | 2021-09-26 | [3e1cce01d01493d33e50966d0d0fd39a86d229f9](https://github.com/vitejs/vite/commit/3e1cce01d01493d33e50966d0d0fd39a86d229f9) |
| [Nuxt](https://github.com/nuxt/nuxt) | ![](https://img.shields.io/github/stars/nuxt/nuxt) | 2022-10-17 | [74a90c566c936164018c086030c7de65b26a5cb6](https://github.com/nuxt/nuxt/commit/74a90c566c936164018c086030c7de65b26a5cb6) |
| [Vue](https://github.com/vuejs/core) | ![](https://img.shields.io/github/stars/vuejs/core) | 2021-10-09 | [61c5fbd3e35152f5f32e95bf04d3ee083414cecb](https://github.com/vuejs/core/commit/61c5fbd3e35152f5f32e95bf04d3ee083414cecb) |
| [Astro](https://github.com/withastro/astro) | ![](https://img.shields.io/github/stars/withastro/astro) | 2022-03-08 | [240d88aefe66c7d73b9c713c5da42ae789c011ce](https://github.com/withastro/astro/commit/240d88aefe66c7d73b9c713c5da42ae789c011ce) |
| [Prisma](https://github.com/prisma/prisma) | ![](https://img.shields.io/github/stars/prisma/prisma) | 2021-09-21 | [c4c83e788aa16d61bae7a6d00adc8a58b3789a06](https://github.com/prisma/prisma/commit/c4c83e788aa16d61bae7a6d00adc8a58b3789a06) |
| [Novu](https://github.com/novuhq/novu) | ![](https://img.shields.io/github/stars/novuhq/novu) | 2021-12-23 | [f2ea61f7d7ac7e12db4c9e70767082841ed98b2b](https://github.com/novuhq/novu/commit/f2ea61f7d7ac7e12db4c9e70767082841ed98b2b) |
| [Slidev](https://github.com/slidevjs/slidev) | ![](https://img.shields.io/github/stars/slidevjs/slidev) | 2021-04-12 | [d6783323eb1ab1fc612577eb63579c8f7bc99c3a](https://github.com/slidevjs/slidev/commit/d6783323eb1ab1fc612577eb63579c8f7bc99c3a) |
| [Turborepo](https://github.com/vercel/turborepo) | ![](https://img.shields.io/github/stars/vercel/turborepo) | 2022-03-02 | [fd171519ec02a69c9afafc1bc5d9d1b481fba721](https://github.com/vercel/turborepo/commit/fd171519ec02a69c9afafc1bc5d9d1b481fba721) |
| [Quasar Framework](https://github.com/quasarframework/quasar) | ![](https://img.shields.io/github/stars/quasarframework/quasar) | 2024-03-13 | [7f8e550bb7b6ab639ce423d02008e7f5e61cbf55](https://github.com/quasarframework/quasar/commit/7f8e550bb7b6ab639ce423d02008e7f5e61cbf55) |
| [Element Plus](https://github.com/element-plus/element-plus) | ![](https://img.shields.io/github/stars/element-plus/element-plus) | 2021-09-23 | [f9e192535ff74d1443f1d9e0c5394fad10428629](https://github.com/element-plus/element-plus/commit/f9e192535ff74d1443f1d9e0c5394fad10428629) |
| [NextAuth.js](https://github.com/nextauthjs/next-auth) | ![](https://img.shields.io/github/stars/nextauthjs/next-auth) | 2022-05-03 | [4f29d39521451e859dbdb83179756b372e3dd7aa](https://github.com/nextauthjs/next-auth/commit/4f29d39521451e859dbdb83179756b372e3dd7aa) |
| [Ember.js](https://github.com/emberjs/ember.js) | ![](https://img.shields.io/github/stars/emberjs/ember.js) | 2023-10-18 | [b6b05da662497183434136fb0148e1dec544db04](https://github.com/emberjs/ember.js/commit/b6b05da662497183434136fb0148e1dec544db04) |
| [Qwik](https://github.com/BuilderIO/qwik) | ![](https://img.shields.io/github/stars/BuilderIO/qwik) | 2022-11-14 | [021b12f58cca657e0a008119bc711405513e1ee9](https://github.com/BuilderIO/qwik/commit/021b12f58cca657e0a008119bc711405513e1ee9) |
| [VueUse](https://github.com/vueuse/vueuse) | ![](https://img.shields.io/github/stars/vueuse/vueuse) | 2021-09-25 | [826351ba1d9c514e34426c85f3d69fb9875c7dd9](https://github.com/vueuse/vueuse/commit/826351ba1d9c514e34426c85f3d69fb9875c7dd9) |
| [SvelteKit](https://github.com/sveltejs/kit) | ![](https://img.shields.io/github/stars/sveltejs/kit) | 2021-09-26 | [b164420ab26fa04fd0fbe0ac05431f36a89ef193](https://github.com/sveltejs/kit/commit/b164420ab26fa04fd0fbe0ac05431f36a89ef193) |
| [Verdaccio](https://github.com/verdaccio/verdaccio) | ![](https://img.shields.io/github/stars/verdaccio/verdaccio) | 2021-09-21 | [9dbf73e955fcb70b0a623c5ab89649b95146c744](https://github.com/verdaccio/verdaccio/commit/9dbf73e955fcb70b0a623c5ab89649b95146c744) |
| [Vercel](https://github.com/vercel/vercel) | ![](https://img.shields.io/github/stars/vercel/vercel) | 2023-01-12 | [9c768b98b71cfc72e8638bf5172be88c39e8fa69](https://github.com/vercel/vercel/commit/9c768b98b71cfc72e8638bf5172be88c39e8fa69) |
| [Vitest](https://github.com/vitest-dev/vitest) | ![](https://img.shields.io/github/stars/vitest-dev/vitest) | 2021-12-13 | [d6ff0ccb819716713f5eab5c046861f4d8e4f988](https://github.com/vitest-dev/vitest/commit/d6ff0ccb819716713f5eab5c046861f4d8e4f988) |
| [Cycle.js](https://github.com/cyclejs/cyclejs) | ![](https://img.shields.io/github/stars/cyclejs/cyclejs) | 2021-09-21 | [f2187ab6688368edb904b649bd371a658f6a8637](https://github.com/cyclejs/cyclejs/commit/f2187ab6688368edb904b649bd371a658f6a8637) |
| [Milkdown](https://github.com/Saul-Mirone/milkdown) | ![](https://img.shields.io/github/stars/Saul-Mirone/milkdown) | 2021-09-26 | [4b2e1dd6125bc2198fd1b851c4f00eda70e9b913](https://github.com/Saul-Mirone/milkdown/commit/4b2e1dd6125bc2198fd1b851c4f00eda70e9b913) |
| [Nhost](https://github.com/nhost/nhost) | ![](https://img.shields.io/github/stars/nhost/nhost) | 2022-02-07 | [10a1799a1fef2f558f737de3bb6cadda2b50e58f](https://github.com/nhost/nhost/commit/10a1799a1fef2f558f737de3bb6cadda2b50e58f) |
| [Logto](https://github.com/logto-io/logto) | ![](https://img.shields.io/github/stars/logto-io/logto) | 2021-07-29 | [0b002e07850c8e6d09b35d22fab56d3e99d77043](https://github.com/logto-io/logto/commit/0b002e07850c8e6d09b35d22fab56d3e99d77043) |
| [Rollup plugins](https://github.com/rollup/plugins) | ![](https://img.shields.io/github/stars/rollup/plugins) | 2021-09-21 | [53fb18c0c2852598200c547a0b1d745d15b5b487](https://github.com/rollup/plugins/commit/53fb18c0c2852598200c547a0b1d745d15b5b487) |
| [icestark](https://github.com/ice-lab/icestark) | ![](https://img.shields.io/github/stars/ice-lab/icestark) | 2021-12-16 | [4862326a8de53d02f617e7b1986774fd7540fccd](https://github.com/ice-lab/icestark/commit/4862326a8de53d02f617e7b1986774fd7540fccd) |
| [ByteMD](https://github.com/bytedance/bytemd) | ![](https://img.shields.io/github/stars/bytedance/bytemd) | 2021-02-18 | [36ef25f1ea1cd0b08752df5f8c832302017bb7fb](https://github.com/bytedance/bytemd/commit/36ef25f1ea1cd0b08752df5f8c832302017bb7fb) |
| [Stimulus Components](https://github.com/stimulus-components/stimulus-components) | ![](https://img.shields.io/github/stars/stimulus-components/stimulus-components) | 2024-10-26 | [8e100d5b2c02ad5bf0b965822880a60f543f5ec3](https://github.com/stimulus-components/stimulus-components/commit/8e100d5b2c02ad5bf0b965822880a60f543f5ec3) |
| [Serenity/JS](https://github.com/serenity-js/serenity-js) | ![](https://img.shields.io/github/stars/serenity-js/serenity-js) | 2025-01-01 | [43dbe6f440d8dd81811da303e542381a17d06b4d](https://github.com/serenity-js/serenity-js/commit/43dbe6f440d8dd81811da303e542381a17d06b4d) |
| [kysely](https://github.com/kysely-org/kysely) | ![](https://img.shields.io/github/stars/kysely-org/kysely) | 2025-07-29 | [5ac19105ddb17af310c67e004c11fa3345454b66](https://github.com/kysely-org/kysely/commit/5ac19105ddb17af310c67e004c11fa3345454b66) |

## 配置

### linkWorkspacePackages

- 默认值：**false**
- 类型：**true**、**false**、**deep**

启用后，本地可用的包会被链接到 `node_modules`，而不是从 registry 下载。这在 monorepo 中非常方便。如果你还需要把本地包链接到子依赖，可以使用 `deep` 设置。

否则，包会从 registry 下载并安装。不过，仍然可以通过 `workspace:` 范围协议链接工作区包。

只有当包的版本满足依赖范围时才会被链接。

### injectWorkspacePackages

- 默认值：**false**
- 类型：**Boolean**

对所有本地工作区依赖启用硬链接，而不是符号链接。或者，也可以通过 [dependenciesMeta.injected](/docs/package_json#dependenciesmetainjected) 实现，它允许针对特定依赖选择性地启用硬链接。

:::note[说明]

即使启用了这个设置，pnpm 仍会优先使用符号链接对注入的依赖去重，除非因对等依赖不匹配而需要多份依赖图。此行为由 `dedupeInjectedDeps` 设置控制。

:::

### dedupeInjectedDeps

- 默认值：**true**
- 类型：**Boolean**

启用此设置后，只要有可能，[被注入的依赖](/docs/package_json#dependenciesmetainjected)就会从工作区进行符号链接。如果依赖方项目和被注入的依赖引用了相同的对等依赖，就没必要把被注入的依赖物理复制到依赖方的 `node_modules` 中，符号链接就够了。

### syncInjectedDepsAfterScripts

自 v10.5.0 起提供

- 默认值：**undefined**
- 类型：**String[]**

注入的工作区依赖是一组硬链接，当源发生变化时不会添加或删除文件。这会在需要构建的包中引发问题（例如 TypeScript 项目）。

此设置是一组脚本名称。当在工作区包中执行其中任意脚本时，`node_modules` 内被注入的依赖也会同步。

### preferWorkspacePackages

- 默认值：**false**
- 类型：**Boolean**

启用后，会优先使用工作区中的本地包，而不是 registry 中的包，即使 registry 里有该包的更新版本。

只有在工作区未使用 `saveWorkspaceProtocol` 时，此设置才有用。

### sharedWorkspaceLockfile

- 默认值：**true**
- 类型：**Boolean**

启用后，pnpm 会在工作区根目录创建一个 `pnpm-lock.yaml` 文件。这也意味着工作区包的所有依赖都会放在一个 `node_modules` 中（并为 Node 的模块解析符号链接到各自包的 `node_modules` 目录）。

此选项的优势：

- 每个依赖都是单例
- monorepo 中安装更快
- 由于都在一个文件中，代码评审时的改动更少

:::note[说明]

尽管所有依赖都会硬链接到根 `node_modules`，但每个包只能访问其 `package.json` 中声明的那些依赖，因此 pnpm 的严格性得以保留。这正是前面所说的符号链接带来的效果。

:::

### saveWorkspaceProtocol

- 默认值：**rolling**
- 类型：**true**、**false**、**rolling**

此设置控制从工作区链接的依赖如何被添加到 `package.json`。

如果工作区中有 `foo@1.0.0`，而你在该工作区的另一个项目中运行 `pnpm add foo`，下面展示的是 `foo` 会被如何添加到 dependencies 字段。`savePrefix` 设置也会影响说明符的生成方式。

| **saveWorkspaceProtocol** | **savePrefix** | **spec** |
| --- | --- | --- |
| false | `''` | `1.0.0` |
| false | `'~'` | `~1.0.0` |
| false | `'^'` | `^1.0.0` |
| true | `''` | `workspace:1.0.0` |
| true | `'~'` | `workspace:~1.0.0` |
| true | `'^'` | `workspace:^1.0.0` |
| rolling | `''` | `workspace:*` |
| rolling | `'~'` | `workspace:~` |
| rolling | `'^'` | `workspace:^` |

### includeWorkspaceRoot

- 默认值：**false**
- 类型：**Boolean**

在工作区中递归执行命令时，也在根工作区项目上执行。

### ignoreWorkspaceCycles

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，不再打印工作区依赖循环的警告。它还会把递归运行中的 `ERR_PNPM_TASK_CYCLE` 降级为警告，该循环中的任务彼此之间不再有保证的执行顺序。另见[工作区任务编排](/docs/workspace-task-orchestration#cycles)。

### disallowWorkspaceCycles

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，如果工作区存在循环，安装就会失败。

### failIfNoMatch

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，如果没有包匹配所提供的过滤器，CLI 将以非零退出码退出。

例如，下面的命令将以非零退出码退出，因为工作区中不存在 `bad-pkg-name`：

```bash
pnpm --filter=bad-pkg-name test
```
