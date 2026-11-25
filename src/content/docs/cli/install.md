---
title: "pnpm install"
headingIds: ["tldr","options-for-filtering-dependencies","--prod--p","--dev--d","--no-optional","--optional","--no-runtime","options","--ignore-workspace","--force","--offline","--no-offline","--prefer-offline","--no-prefer-offline","--no-lockfile","--lockfile-only","--lockfile-dir-dir","--dry-run","--fix-lockfile","--update-checksums","--frozen-lockfile","--no-frozen-lockfile","--prefer-frozen-lockfile","--ignore-manifest-check","--trust-lockfile","--auto-dedupe","--minimum-release-age-minutes","--minimum-release-age-exclude-package-spec","--merge-git-branch-lockfiles","--merge-git-branch-lockfiles-branch-pattern-glob","--reportername","--shamefully-hoist","--ignore-scripts","--no-ignore-scripts","--ignore-pnpmfile","--node-linker-linker","--frozen-store","--network-concurrency-number","--fetch-timeout-ms","--fetch-warn-timeout-ms-ms","--fetch-min-speed-ki-bps-number","--user-agent-string","--pnpr-server-url","--allow-build","--filter-package_selector","--cpuname","--osname","--libcname"]
---

别名： `i`

`pnpm install` 用于安装项目的所有依赖。

超过 64 MiB 的包清单与归档元数据会被拒绝。

在 CI 环境中，如果存在锁文件但需要更新，安装会失败。要在 CI 中允许更新锁文件，请运行 `pnpm install --no-frozen-lockfile`。

在[工作区](/docs/workspaces)中，`pnpm install` 会安装所有项目的所有依赖。如果想禁用此行为，将 [`recursiveInstall`](/docs/settings/cli#recursiveinstall) 设置设为 `false`。

当某个工作区项目发生变化时，其它项目中未变化的直接依赖会保留其锁定的版本——只要这些版本仍满足它们声明的范围。使用 [`pnpm update`](/docs/cli/update) 来请求依赖更新。

工作区包的 `bin` 字段发生变化时，即使使用 `--frozen-lockfile` 且锁文件未变，也会在下一次安装时链接到其依赖方的 `node_modules/.bin` 中。

![](/img/demos/pnpm-install.svg)

## 摘要

| **Command** | **Meaning** |
| --- | --- |
| `pnpm i --offline` | 仅从存储进行离线安装 |
| `pnpm i --frozen-lockfile` | 不会更新 `pnpm-lock.yaml` |
| `pnpm i --lockfile-only` | 只更新 `pnpm-lock.yaml` |
| `pnpm i --dry-run` | 预览改动但不写入 |

## 过滤依赖的选项

没有锁文件时，pnpm 必须创建一个，且无论依赖如何过滤它都必须保持一致，因此在没有锁文件的目录中运行 `pnpm install --prod` 仍会解析开发依赖，如果解析不成功还会报错。此规则的唯一例外是 `link:` 依赖。

没有 `--frozen-lockfile` 时，pnpm 会检查 `file:` 依赖的过期信息，因此在 `file:` 目标已被移除的环境中不带 `--frozen-lockfile` 运行 `pnpm install --prod` 会报错。

### --prod, -P

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，pnpm 不会安装 `devDependencies` 中列出的任何包，若它们已安装则会被移除。为 `false` 时，pnpm 会安装 `devDependencies` 和 `dependencies` 中列出的所有包。

### --dev, -D

仅安装 `devDependencies`，若 `dependencies` 已安装则将其移除。

### --no-optional

不安装 `optionalDependencies`。

### --optional

即使 [`optional`](/docs/settings/dependency-resolution#optional) 设置排除了它们，也安装 `optionalDependencies`。

### --no-runtime

跳过安装运行时条目（例如通过 [devEngines.runtime](/docs/package_json#devenginesruntime) 下载的 Node.js）。锁文件保持不变，因此冻结安装仍会进行校验；仅跳过运行时的拉取和 bin 链接。此前某次安装已链接的运行时会从 `node_modules` 中移除。

这适用于运行时在 `pnpm install` 运行前已由外部预先配置的 CI 矩阵（例如通过 `pnpm runtime -g set node <version>`）。

也可以通过 `pnpm-workspace.yaml` 中的 `runtime=false` 配置设置。

## 选项

### --ignore-workspace

把当前项目当作独立项目安装，不在父目录中查找 `pnpm-workspace.yaml`。工作区的设置和其他项目都不生效。参见[`--ignore-workspace` 全局选项](/docs/pnpm-cli#--ignore-workspace)。

### --force

强制重新安装依赖：重新拉取存储中被修改的包，重建由不兼容版本的 pnpm 创建的锁文件和/或 modules 目录。`--force` 还会解除 [`engineStrict`](/docs/settings/cli#enginestrict)。

自 v12.7.0 起，`--force` 不再安装 `os`、`cpu` 或 `libc` 与宿主机不匹配的可选依赖。设置 [`forceIgnoresPlatform`](/docs/settings/dependency-resolution#forceignoresplatform) 为 `true` 可以照常安装它们。

### --offline

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，pnpm 只使用存储中已有的包。如果本地找不到某个包，安装将失败。

### --no-offline

即使 `offline` 设置为 `true`，也允许发起网络请求。

### --prefer-offline

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，将跳过缓存数据的过期检查，但缺失的数据仍会向服务器请求。要强制完全离线模式，使用 `--offline`。

### --no-prefer-offline

即使 `preferOffline` 设置为 `true`，也不优先使用缓存数据。

### --no-lockfile

不读取也不生成 `pnpm-lock.yaml` 文件。

### --lockfile-only

- 默认值：**false**
- 类型：**布尔值**

使用时，仅更新 `pnpm-lock.yaml` 和 `package.json`，不会向 `node_modules` 目录写入任何内容。

解析无关的改动时，pnpm 可以复用锁文件中已为未变化的直接依赖和传递依赖记录的 Git 提交。

### --lockfile-dir <dir>

创建 `pnpm-lock.yaml` 的目录。多个项目可以共用一份锁文件。它不能与 `--global` 同时使用。

### --dry-run

执行完整的依赖解析并报告真实安装会带来哪些变更，但不向磁盘写入任何内容。锁文件、清单或 `node_modules` 的变更均不会被保存。

完成的试运行即使报告真实安装会更新锁文件，也以退出码 0 结束。

`--dry-run` 不能与已配置的 pnpr 服务器一起使用，因为那条安装路径通过服务器进行解析和链接。

### --fix-lockfile

自动修复损坏的锁文件条目。

### --update-checksums

重新解析每个锁定的包，并把 registry 当前报告的完整性值记录到 `pnpm-lock.yaml`。当 registry 重写了它的 tarball，或在 registry 开始提供 [tar](/docs/registries#tar-registries)之后使用它。

默认情况下，完整性不匹配会导致硬性失败：`pnpm install` 以 `ERR_PNPM_TARBALL_INTEGRITY` 退出，而不是静默地从 registry 重新解析并覆盖锁定的完整性值。这保护了提交锁文件的项目：在干净的机器上，被攻破的 registry、代理或重新发布的版本无法用攻击者控制的内容进行替换。

`--update-checksums` 是针对合法场景（例如 registry 重写了它的 tarball，且你已验证新内容正确）的小范围显式启用选项。绕过生效时仍会打印警告，使该操作可被审计。

`--force` 和 `pnpm update` 有意**不**绕过完整性检查。`--frozen-lockfile` 保持不变，`--fix-lockfile` 保留其文档所述用途（补全缺失的锁文件条目），同样不是绕过手段。

### --frozen-lockfile

- 默认值：
  - 非 CI 时：**false**
  - CI 时：**true**（若存在锁文件）
- 类型：**布尔值**

为 `true` 时，pnpm 不会生成锁文件，并且在锁文件与清单不同步、需要更新或不存在锁文件时安装失败。

在 [CI 环境][CI environments]中此设置默认为 `true`。pnpm 使用与 [ci-info](https://github.com/watson/ci-info) 包相同的规则检测 CI 环境。设置 `CI=false` 可关闭检测。

[CI environments]: https://github.com/watson/ci-info#supported-ci-tools

在线校验已锁定的 tarball 时，若缓存的元数据没有包含锁定的版本，pnpm 会向 registry 索取一次最新的包元数据。

### --no-frozen-lockfile

允许在安装期间更新锁文件。它与 `--frozen-lockfile` 相反。

### --prefer-frozen-lockfile

使用现有锁文件而不重新解析，即使清单可能已经改变。与之相反的是 `--no-prefer-frozen-lockfile`，它总是针对 registry 重新解析。参见 [`preferFrozenLockfile`](/docs/settings/store#preferfrozenlockfile)。

### --ignore-manifest-check

跳过 `--frozen-lockfile` 下「`pnpm-lock.yaml` 是否与 `package.json` 保持同步」的检查。只在你刚刚自己写过锁文件时使用它。

### --trust-lockfile

跳过依据供应链策略校验锁文件。`--no-trust-lockfile` 即使在配置信任它时也仍会校验。参见 [`trustLockfile`](/docs/settings/dependency-resolution#trustlockfile)。

### --auto-dedupe

在安装期间对兼容的依赖版本去重。`--no-auto-dedupe` 在配置开启它时将其关闭。参见 [`autoDedupe`](/docs/settings/dependency-resolution#autodedupe)。

### --minimum-release-age <minutes>

自 v12.23.0 起提供

为本次运行设置 [`minimumReleaseAge`](/docs/settings/dependency-resolution#minimumreleaseage)，覆盖配置中的值。该值的单位是分钟。与配置值一样，除非 [`minimumReleaseAgeStrict`](/docs/settings/dependency-resolution#minimumreleaseagestrict) 另有配置，它会开启该设置。不是非负数的值属于错误。

### --minimum-release-age-exclude <package-spec>

自 v12.23.0 起提供

为本次运行设置 [`minimumReleaseAgeExclude`](/docs/settings/dependency-resolution#minimumreleaseageexclude)，替换配置中的列表。重复该选项可排除多个包：

```sh
pnpm install --minimum-release-age 1440 --minimum-release-age-exclude react --minimum-release-age-exclude webpack@5.98.0
```

### --merge-git-branch-lockfiles

合并所有 git 分支锁文件。[阅读更多关于 git 分支锁文件的说明。](/docs/git_branch_lockfiles)

### --merge-git-branch-lockfiles-branch-pattern <glob>

当当前分支匹配该模式时合并 git 分支锁文件。该选项可以重复使用。参见 [`mergeGitBranchLockfilesBranchPattern`](/docs/settings/store#mergegitbranchlockfilesbranchpattern)。

### --reporter=<name>

- 默认值：
  - TTY 标准输出时：**default**
  - 非 TTY 标准输出时：**append-only**
- 类型：**default**、**append-only**、**ndjson**、**silent**

允许你选择将在终端记录安装进度调试信息的 reporter。

- **silent**：不向控制台记录任何输出，即使是致命错误
- **default**：标准输出为 TTY 时的默认 reporter
- **append-only**：输出始终追加到末尾，不进行光标操作
- **ndjson**：最详细的 reporter，以 [ndjson](https://github.com/ndjson/ndjson-spec) 格式打印所有日志。致命错误记录还包含错误码；依赖解析错误还会在 `pkgsStack` 中包含父级包。

如果想更改打印的信息类型，使用 [loglevel](/docs/settings/cli#loglevel) 设置。

### --shamefully-hoist

- 默认值：**false**
- 类型：**布尔值**

创建扁平的 `node_modules` 结构，类似于 `npm` 或 `yarn`。**警告**：强烈不建议这样做。

### --ignore-scripts

- 默认值：**false**
- 类型：**布尔值**

不执行项目 `package.json` 及其依赖中定义的任何脚本。

### --no-ignore-scripts

即使 `ignoreScripts` 设置为 `true`，也运行生命周期脚本。

### --ignore-pnpmfile

不加载 `.pnpmfile.cjs` 中的钩子，包括配置依赖的 pnpmfile。

### --node-linker <linker>

- 类型：**isolated**、**hoisted**、**pnp**

为本次安装覆盖 [`nodeLinker`](/docs/settings/node-modules#nodelinker) 设置。

### --frozen-store

以只读方式打开存储并跳过所有存储写入，适用于存储位于只读文件系统上的情况。请与 `--offline --frozen-lockfile` 一起使用。`--no-frozen-store` 允许在配置开启只读存储时进行存储写入。参见 [`frozenStore`](/docs/settings/store#frozenstore)。

### --network-concurrency <number>

覆盖 [`networkConcurrency`](/docs/settings/network#networkconcurrency) 设置。

### --fetch-timeout <ms>

覆盖 [`fetchTimeout`](/docs/settings/network#fetchtimeout) 设置。

### --fetch-warn-timeout-ms <ms>

覆盖 [`fetchWarnTimeoutMs`](/docs/settings/network#fetchwarntimeoutms) 设置。

### --fetch-min-speed-ki-bps <number>

覆盖 [`fetchMinSpeedKiBps`](/docs/settings/network#fetchminspeedkibps) 设置。

### --user-agent <string>

向 registry 发请求时发送的 `User-Agent` 头。

### --pnpr-server <url>

覆盖 [`pnprServer`](/docs/settings/dependency-resolution#pnprserver) 设置。

### --allow-build

自 v12.7.0 起提供

允许指定的包在本次安装期间运行其生命周期脚本，并把它记录到 `pnpm-workspace.yaml` 的 [`allowBuilds`](/docs/settings/build#allowbuilds) 字段中，以便它持续处于被允许状态。给名称加上 `!` 前缀则改为拒绝它的脚本。该选项可以重复使用，或自 v12.23.0 起接受逗号分隔的列表：

```sh
pnpm install --allow-build=esbuild --allow-build='!core-js'
```

若要传入 git 或 tarball 的键，请为它单独使用一个 `--allow-build`。包含此类键的值不会在逗号处被拆分。

引号可以避免 POSIX shell 把 `!` 当作历史展开。在 Windows 的 `cmd.exe` 中则不要加引号。

写入：

```yaml
allowBuilds:
  esbuild: true
  core-js: false
```

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

### --cpu=<name>

自 v10.14.0 起提供

覆盖要安装的原生模块的 CPU 架构。可接受的值与 `package.json` 的 `cpu` 字段相同，来自 `process.arch`。

### --os=<name>

自 v10.14.0 起提供

覆盖要安装的原生模块的操作系统。可接受的值与 `package.json` 的 `os` 字段相同，来自 `process.platform`。

### --libc=<name>

自 v10.14.0 起提供

覆盖要安装的原生模块的 libc。可接受的值与 `package.json` 的 `libc` 字段相同。
