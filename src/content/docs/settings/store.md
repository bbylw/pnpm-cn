---
title: "存储与锁文件设置"
headingIds: ["store-settings","storedir","verifystoreintegrity","userunningstoreserver","strictstorepkgcontentcheck","frozenstore","lockfile-settings","lockfile","preferfrozenlockfile","excludelinksfromlockfile","lockfileincludetarballurl","lockfileincluderesolutionsettings","lockfileintegritytarget","lockfileformat","reading-and-writing-the-format","gitbranchlockfile","mergegitbranchlockfilesbranchpattern","peerssuffixmaxlength"]
---

## 存储设置

### storeDir

- 默认值：
  - 若已设置 **$PNPM_HOME** 环境变量，则为 **$PNPM_HOME/store**
  - 若已设置 **$XDG_DATA_HOME** 环境变量，则为 **$XDG_DATA_HOME/pnpm/store**
  - 在 Windows 上：**~/AppData/Local/pnpm/store**
  - 在 macOS 上：**~/Library/pnpm/store**
  - 在 Linux 上：**~/.local/share/pnpm/store**
- 类型：**path**

所有包在磁盘上的保存位置。

存储应始终位于进行安装的同一磁盘上，因此每个磁盘会有一个存储。如果当前磁盘上有主目录，则存储创建在其中。如果磁盘上没有主目录，则在文件系统根目录创建存储。例如，如果在挂载于 `/mnt` 的文件系统上进行安装，则存储将创建于 `/mnt/.pnpm-store`。Windows 系统也是如此。

可以设置位于不同磁盘的存储，但这种情况下 pnpm 会从存储复制包而不是创建硬链接，因为硬链接只能在同一文件系统上进行。

如果项目之上的任何目录都不接受硬链接——例如仅授予项目写权限的 agent 沙箱，或仅将项目以可写方式 bind mount 挂载的容器——则存储改为创建在项目内部：位于 `node_modules/.pnpm-store`。将其放在主目录中要么会因主目录只读而失败，要么会落在另一个卷上，从而复制每个包而不是创建硬链接（[#13525](https://github.com/pnpm/pnpm/issues/13525)）。

:::important[重要]

pnpm 存储仅应在相互信任的用户、任务和进程之间共享。如果你配置了共享的 `storeDir`，用文件系统权限加以保护，使不受信任的用户无法向其写入。存储是 pnpm 信任域的一部分：包可以从其中创建硬链接，而存储索引（`index.db`）记录了用于校验缓存文件的哈希。

:::

### verifyStoreIntegrity

- 默认值：**true**
- 类型：**Boolean**

默认情况下，如果存储中的文件已被修改，则在将其链接到项目的 `node_modules` 之前会检查该文件的内容。如果 `verifyStoreIntegrity` 设为 `false`，则在安装期间不会检查内容寻址存储中的文件。

此设置有助于检测意外的存储损坏。它并不能让一个可被不受信任用户写入的存储变得安全，因为能够写入存储的攻击者既能篡改缓存的包内容，也能篡改用于校验它们的元数据。

### useRunningStoreServer

:::danger[警告]

已废弃的功能

:::

- 默认值：**false**
- 类型：**Boolean**

仅允许使用存储服务器进行安装。如果没有运行存储服务器，安装将失败。

### strictStorePkgContentCheck

- 默认值：**true**
- 类型：**Boolean**

某些 registry 允许将完全相同的内容以不同的包名和/或版本发布。这会破坏对存储中包的有效性检查。为避免在验证存储中此类包的名称和版本时出错，你可以将 `strictStorePkgContentCheck` 设置设为 `false`。

### frozenStore

自 v11.7.0 起提供

- 默认值：**false**
- 类型：**Boolean**

让 `pnpm install` 针对位于只读文件系统上的包存储运行——例如 [Nix](https://nixos.org/) 存储、只读的 bind mount，或 OCI 镜像层。启用后，pnpm 以不可变模式打开存储的 SQLite `index.db`（绕过在只读目录上本无法创建的 WAL/`-shm` 附属文件），并屏蔽所有会向存储写入的代码路径。

在一个已填充完整的存储上，将其与 `--offline` 和 `--frozen-lockfile` 搭配使用：

```bash
pnpm install --frozen-store --offline --frozen-lockfile
```

存储必须已包含安装所需的一切，包括已批准生命周期脚本（或已打补丁）的任何包的构建产物。在[全局虚拟存储](/docs/settings/node-modules#enableglobalvirtualstore)下，这些包目录位于存储内部，因此如果缺少所需的构建，安装会预先以 `ERR_PNPM_FROZEN_STORE_NEEDS_BUILD` 失败——先用这些构建结果填充存储。如果存储完全缺少其内容目录，安装会以 `ERR_PNPM_FROZEN_STORE_INCOMPLETE` 快速失败，而不是尝试初始化它。

`frozenStore` 与 `--force` 以及已配置的 pnpr 服务器不兼容，因为两者都会向存储写入。同样也不会写入[副作用缓存](/docs/settings/build#sideeffectscache)。

:::note[说明]

以只读方式打开存储需要 Node.js >=22.15.0、>=23.11.0 或 >=24.0.0。在较旧的运行时上，`--frozen-store` 会以 `ERR_PNPM_FROZEN_STORE_UNSUPPORTED_NODE` 失败。

:::

## 锁文件设置

### lockfile

- 默认值：**true**
- 类型：**Boolean**

设为 `false` 时，pnpm 不会读取或生成 `pnpm-lock.yaml` 文件。

### preferFrozenLockfile

- 默认值：**true**
- 类型：**Boolean**

设为 `true` 且现有的 `pnpm-lock.yaml` 满足 `package.json` 的依赖声明时，会执行无头安装。无头安装会跳过所有依赖解析，因为它不需要修改锁文件。

### excludeLinksFromLockfile

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，用 `link:` 协议声明的依赖不会写入 `pnpm-lock.yaml`。使用 `workspace:` 协议的依赖仍会被记录。

### lockfileIncludeTarballUrl

- 默认值：**false**
- 类型：**Boolean**

在 `pnpm-lock.yaml` 的每个条目中添加指向该包 tarball 的完整 URL。

### lockfile.includeResolutionSettings

自 v12.10.0 起提供

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，pnpm 会把以下设置记录到 `pnpm-lock.yaml` 的 `settings` 段中：

* [autoDedupe](/docs/settings/dependency-resolution#autodedupe)
* [dedupeInjectedDeps](/docs/workspaces#dedupeinjecteddeps)
* [dedupePeerDependents](/docs/settings/peer-dependencies#dedupepeerdependents)
* [linkWorkspacePackages](/docs/workspaces#linkworkspacepackages)

```yaml
lockfile:
  includeResolutionSettings: true
```

记录的值与当前设置不一致的锁文件已过期。`pnpm install` 会重新解析它，`pnpm install --frozen-lockfile` 会以 `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` 失败。开启该设置会让下一次安装重新解析一次锁文件。

使用 `autoDedupe` 时，当其他内容都没有变化，安装会复用记录了 `autoDedupe: true` 的锁文件。在没有写出该锁文件的机器上也是如此，例如运行 `pnpm install --frozen-lockfile` 之后再运行 `pnpm run` 的服务器。

[`v13` 格式](#lockfileformat)始终会记录这些设置。

pnpm v11 以及早于 v12.10.0 的 v12 版本不保留这些设置，重写锁文件时会移除它们。pnpm v12 中早于 v12.10.0 的版本无法读取把 `lockfile` 设为对象的 `pnpm-workspace.yaml`。当项目中的所有人都使用 v12.10.0 或更高版本时再开启该设置。

该设置需要本地依赖解析，因此设置 `pnpmServer` 时，非冻结的安装会失败。

### lockfile.integrityTarget

自 v12.15.0 起提供

- 默认值：**resource**
- 类型：**resource**、**tar**

`pnpm-lock.yaml` 中每个包 tarball 的 `integrity` 固定的是哪种哈希。

* `resource` 固定 tarball URL 处的文件，即大多数 registry 上的 `.tgz`。
* `tar` 固定其内部未压缩的 tar，对 registry 包、`tarball:` URL 和 `file:` tarball 一视同仁。

```yaml
lockfile:
  integrityTarget: tar
```

使用 `tar` 后，当 registry 重新压缩其 tarball、开始提供 [tar registry](/docs/registries#tar-registries)，或被替换成会做这两件事的镜像时，锁文件不再变化。pnpm 会通过解码并对 tar 计算哈希来校验每个下载。它记录的哈希来自与 registry 公布的 integrity 匹配的 `.tgz`，因此与该 integrity 同样可信。Git 依赖和[registry 修订版](/docs/registry-revisions)不受影响：Git 依赖固定一个 commit，修订版始终固定 tar。

锁文件会在其 `settings` 中把该设置记录为 `integrityTarget: tar`。在另一种取值下解析出的锁文件已过期，`pnpm install` 会重新解析并重写所有哈希，`pnpm install --frozen-lockfile` 会以 `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` 失败。

无论该设置如何，存储都会记住它解包过的每个 `.tgz` 的 tar 哈希。因此存储中已有的版本无需下载即可得知其 tar 哈希，冻结安装也能在任一哈希下找到其文件。存储尚未解包的版本会被下载一次以得知哈希，即使是 `pnpm install --lockfile-only` 也不例外；面向其他平台的可选依赖同样如此——锁文件会记录它，但本机的安装不会解包它。由没有该设置的 pnpm 版本解包的包也会被下载一次。

`pnpm audit signatures` 会校验 `.tgz` 的 registry 签名，并通过存储或下载该包把它与锁文件中的 tar 哈希关联起来。

v12.15.0 之前的 pnpm 版本无法从固定 tar 的锁文件安装。请在项目中的所有人都使用 v12.15.0 或更高版本后再开启该设置。由 `pnprServer` 进行的解析无法固定 tar，因此设置 `pnpmServer` 时，非冻结的安装会失败。

### lockfile.format

- 默认值：**v9**
- 类型：**v9**、**v13**

pnpm 写出 `pnpm-lock.yaml` 所用的格式。`v13` 是为 pnpm 13 规划的格式，仍是实验性的，在 pnpm 13 发布前可能变化。

```yaml
lockfile:
  format: v13
```

`v13` 格式的锁文件是 JSON，以制表符缩进，每个条目后都有尾随逗号。这是合法的 YAML，因此 `pnpm-lock.yaml` 保留原名，按 YAML 读取它的工具仍可读取。它的 `lockfileVersion` 是 `13.0`，即计划默认写出该格式的 pnpm 主版本。

该格式与当前格式的差异如下：

- 工作区项目列在 `projects` 之下。
- 每个包版本只有一个 `packages` 条目，没有 `snapshots` 段。该条目持有包的元数据、已解析的依赖，并在 `peerDependencies` 中为每个 peer 同时记录其声明的范围和解析到的版本。
- 以另一个名字引用 peer 的提供方的普通依赖，仍保留在该名字的依赖映射中。
- 由包下方的依赖（而非包本身）需要的 peer 记录为 `{version: 1.2.3, below: true}`。包标记为可选的 peer 写作 `{specifier: '*', optional: true}`。没有 `peerDependenciesMeta` 字段。
- tarball 的 `integrity` 是条目中的一个字段。registry 包和注入的工作区包没有 `resolution` 字段。
- 本地目录包在 `dependencies` 和 `optionalDependencies` 中记录其清单声明的依赖（经过钩子处理后）。当说明符同时就是版本时，依赖只记录其说明符；否则记录为 `{specifier: ^1.0.0, version: 1.2.3}`，当该包并非在每个 snapshot 中都链接该依赖时不带 `version`。冻结安装会把这些说明符与当前清单比较。即使锁定的版本仍然满足范围，范围变化也会使锁文件失效。从 `v9` 格式转换来的锁文件不记录说明符，并保留现有的新鲜度检查。
- 在 `dependenciesMeta` 中标记为 `injected` 的项目依赖或本地目录包依赖带有 `injected: true`。该格式不记录其他 `dependenciesMeta` 字段。
- 以不同 peer 依赖安装的包，在其条目下的 `snapshots` 中列出差异之处。
- 没有外部提供方的传递 peer 通常可从依赖推断。必要时，`unboundPeerDependencies` 显式记录它们的名称，包括空列表。
- 包之间的引用就是一个版本，不带 peer 或补丁后缀。若仅凭该版本无法说明指的是包的哪一份副本，引用会在 `with` 下按其解析时的 peer 依赖指明该副本，每行一个。空的 `with` 映射会在另一份副本绑定可选 peer 时保持它们未绑定。peer 引用在其提供方有不同 peer 绑定时，可以带自己的 `with` 映射。
- 当版本可由说明符推出时，项目的依赖只记录其说明符：精确版本、`catalog:` 条目，或对另一工作区项目的 `workspace:` 依赖。否则在一行中记录为 `{specifier: ^1.0.0, version: 1.2.3}`。带 `with` 映射的依赖同样省略可由说明符推出的版本。
- 被 `workspace:` 依赖链接到的项目会记录其 `name`。
- 被打补丁的包的哈希只在 `patchedDependencies` 下记录一次。包的废弃说明不再记录。
- `settings` 段持有锁文件从 `pnpm-workspace.yaml` 记录的一切内容：解析相关设置、`catalogs`、`overrides`、`patchedDependencies`、`ignoredOptionalDependencies` 以及两个校验和。目录条目在版本可由其说明符推出时只记录说明符。
- 解析相关设置包含 [`lockfile.includeResolutionSettings`](#lockfileincluderesolutionsettings) 列出的那些，无论该设置如何取值。

更新一个 peer 依赖时，只有记录它的那些行会变化。

#### 读取和写出该格式

无论该设置如何，pnpm 都能读取两种格式的锁文件。更改该设置后，常规安装会转换锁文件。`pnpm install --lockfile-only` 也会写出所选格式。没有该设置的 pnpm 版本无法读取 `v13` 格式的锁文件。该格式仍在变化，因此用该设置写出的锁文件可能需要用更新的 pnpm 重新生成。

`v13` 格式会记录[解析相关设置](#lockfileincluderesolutionsettings)。对于尚未记录它们的锁文件（例如未启用 `lockfile.includeResolutionSettings` 写出的 `v9` 锁文件，或更早的 pnpm 写出的 `v13` 锁文件），下一次安装会重新解析。`pnpm install --frozen-lockfile` 在这类锁文件上会失败，直到一次常规安装记录了它们。设置 `pnpmServer` 时，非冻结的安装会失败，因为 pnpr 收不到这些设置。

记录配置依赖和固定 pnpm 版本的 boot 文档跟随固定的 pnpm，而不是该设置。只要项目固定的是 pnpm 13 或更早版本，它就保持现有格式，这样该格式出现之前的 pnpm 也能读取固定版本并切换过去。固定 pnpm 14 或更高版本的项目会得到 `v13` 格式的 boot 文档。

### gitBranchLockfile

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，安装后生成的锁文件名将基于当前分支名命名，以完全避免合并冲突。例如，如果当前分支名为 `feature-foo`，则对应的锁文件名将是 `pnpm-lock.feature-foo.yaml` 而不是 `pnpm-lock.yaml`。它通常与命令行参数 `--merge-git-branch-lockfiles` 一起使用，或通过在 `pnpm-workspace.yaml` 文件中设置 `mergeGitBranchLockfilesBranchPattern` 来使用。

### mergeGitBranchLockfilesBranchPattern

- 默认值：**null**
- 类型：**Array or null**

此配置将当前分支名进行匹配，以决定是否合并所有 git 分支锁文件。默认情况下，你需要手动传入 `--merge-git-branch-lockfiles` 命令行参数。此配置允许自动完成该过程。

例如：

```yaml
mergeGitBranchLockfilesBranchPattern:
- main
- release*
```

你也可以使用 `!` 排除模式。

### peersSuffixMaxLength

- 默认值：**1000**
- 类型：**number**

锁文件中添加到依赖键的对等 ID 后缀的最大长度。如果后缀更长，则会被替换为一个哈希。
