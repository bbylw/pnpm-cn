---
title: "存储与锁文件设置"
headingIds: ["store-settings","storedir","verifystoreintegrity","userunningstoreserver","strictstorepkgcontentcheck","frozenstore","lockfile-settings","lockfile","preferfrozenlockfile","lockfileincludetarballurl","gitbranchlockfile","mergegitbranchlockfilesbranchpattern","peerssuffixmaxlength"]
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

### lockfileIncludeTarballUrl

- 默认值：**false**
- 类型：**Boolean**

在 `pnpm-lock.yaml` 的每个条目中添加指向该包 tarball 的完整 URL。

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
