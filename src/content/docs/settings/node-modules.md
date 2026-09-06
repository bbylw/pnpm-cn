---
title: "node_modules 与依赖提升设置"
headingIds: ["node-modules-settings","modulesdir","nodelinker","nodeexperimentalpackagemap","nodepackagemaptype","symlink","enablemodulesdir","virtualstoredir","virtualstoredirmaxlength","virtualstoreonly","packageimportmethod","what-auto-tries-first","when-a-link-succeeds-but-costs-more-than-a-copy","a-store-baked-into-a-container-image-layer","network-and-virtualized-filesystems","modulescachemaxage","dlxcachemaxage","virtualstoretype","enableglobalvirtualstore","dependency-hoisting-settings","hoist","hoistworkspacepackages","hoistpattern","publichoistpattern","shamefullyhoist","hoistinglimits"]
---

## node_modules 设置

### modulesDir

- 默认值：**node_modules**
- 类型：**路径**

安装依赖的目录（而非 `node_modules`）。

### nodeLinker

- 默认值：**isolated**
- 类型：**isolated**、**hoisted**、**pnp**

定义安装 Node 包时使用的链接器。

- **isolated** - 依赖以符号链接指向位于 `node_modules/.pnpm` 的虚拟存储
- hoisted
  - a flat
  node_modules
  将以不带符号链接的形式创建。效果等同于
  node_modules
  ，即 npm 或 Yarn Classic 创建的那种。使用此设置时，依赖提升由 Yarn 的某个库执行。使用此设置的合理理由有：
  1. 你的工具链与符号链接配合不佳，React Native 项目很可能只有在使用提升后的 `node_modules` 时才能正常工作
  2. 项目要部署到 serverless 托管平台，部分 serverless 平台（如 AWS Lambda）不支持符号链接；另一种解决办法是在部署前先把应用打包
  3. 你想通过 ["bundledDependencies"](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#bundleddependencies) 发布自己的包
  4. 你需要带 [--preserve-symlinks](https://nodejs.org/api/cli.html#cli_preserve_symlinks) 标志运行 Node.js
- **pnp** - 不使用 `node_modules`。Plug'n'Play 是一种创新的 Node 策略，[被 Yarn Berry 采用](https://yarnpkg.com/features/pnp)。以 `pnp` 作为链接器时，建议同时把 `symlink` 设为 `false`

### nodeExperimentalPackageMap

自 v11.8.0 起提供

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，pnpm 会把生成的 `node_modules/.package-map.json` 注入由其管理的 Node.js 脚本环境，做法是向 `NODE_OPTIONS` 添加 Node 的 `--experimental-package-map` 选项。

包映射在 isolated 和 hoisted 安装期间生成。此设置仅控制 pnpm 是否把生成的包映射传给脚本。

CLI 与环境变量配置使用短横线命名 `node-experimental-package-map`。

```yaml
nodeExperimentalPackageMap: true
```

### nodePackageMapType

自 v11.8.0 起提供

- 默认值：**standard**
- 类型：**standard**、**loose**

控制 `node_modules/.package-map.json` 的生成方式。

- **standard** - 通过包映射只能访问已声明的依赖
- **loose** - 同时映射已安装的 `node_modules` 结构中可达的包，这可能让未声明的提升依赖也能被解析

CLI 与环境变量配置使用短横线命名 `node-package-map-type`。

```yaml
nodePackageMapType: loose
```

### symlink

- 默认值：**true**
- 类型：**布尔值**

将 `symlink` 设为 `false` 时，pnpm 创建的虚拟存储目录中不含任何符号链接。与 `nodeLinker=pnp` 搭配使用时很有用。

### enableModulesDir

- 默认值：**true**
- 类型：**布尔值**

为 `false` 时，pnpm 不会向模块目录（`node_modules`）写入任何文件。这在模块目录通过用户空间文件系统（FUSE）挂载时很有用。有一个实验性 CLI 允许你用 FUSE 挂载模块目录：[@pnpm/mount-modules](https://www.npmjs.com/package/@pnpm/mount-modules)。

### virtualStoreDir

- 默认值：**node_modules/.pnpm**
- 类型：**路径**

存放指向存储的链接的目录。项目的所有直接和间接依赖都会链接到此目录。

这是一个实用的设置，可以解决 Windows 上的长路径问题。如果某些依赖的路径非常长，你可以把虚拟存储放在磁盘根目录（例如 `C:\my-project-store`）。

你也可以把虚拟存储设为 `.pnpm` 并将其加入 `.gitignore`。依赖的路径会比原来少一层目录，堆栈跟踪更整洁。

**注意：** 虚拟存储不能在多个项目之间共享。每个项目都应拥有自己的虚拟存储（工作区除外，工作区中根目录的虚拟存储是共享的）。

### virtualStoreDirMaxLength

- 默认值：
  - Linux/macOS 上：**120**
  - Windows 上：**60**
- 类型：**数字**

设置虚拟存储目录（`node_modules/.pnpm`）内目录名的最大允许长度。如果在 Windows 上遇到长路径问题，可以把此值调低。

### virtualStoreOnly

自 v11.0.0 起提供

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，pnpm 会填充虚拟存储，但不创建导入方符号链接、不进行依赖提升、不创建 bin 链接，也不运行生命周期脚本。适合在不产生多余项目级产物的前提下预填充存储（例如在 Nix 构建中）。`pnpm fetch` 内部就使用此模式。

### packageImportMethod

- 默认值：**auto**
- 类型：**auto**、**hardlink**、**copy**、**clone**、**clone-or-copy**

控制从存储导入包的方式（如果你想禁用 `node_modules` 内的符号链接，要改的是 [nodeLinker](#nodelinker) 设置，不是这个）。

- **auto** - 按顺序尝试各平台的低成本链接方式，全部不可用时回退为复制。Linux 上先尝试硬链接再尝试克隆；macOS 和 Windows 上先尝试克隆再尝试硬链接
- **hardlink** - 从存储对包建立硬链接
- **clone-or-copy** - 尝试从存储克隆包，不支持克隆时回退为复制
- **copy** - 从存储复制包
- **clone** - 从存储克隆包（即写时复制或引用链接）

克隆是把包写入 node_modules 的最佳方式，既最快又最安全。使用克隆时，你可以编辑 node_modules 中的文件，而中心内容寻址存储中的文件不会改变。

遗憾的是，并非所有文件系统都支持克隆。为了获得最佳的 pnpm 体验，建议使用写时复制（CoW）文件系统（例如在 Linux 上用 Btrfs 替代 Ext4）。

#### `auto` 优先尝试的方式

`auto` 的顺序因平台而异：

| **Platform** | **Order** |
| --- | --- |
| Linux | 硬链接 → 克隆 → 复制 |
| macOS | 克隆 → 硬链接 → 复制 |
| Windows | 克隆 → 硬链接 → 复制 |

引用链接（reflink）会新建一个 inode，并在文件系统元数据树内复制区段（extent）记录，而硬链接只是一条目录项。在 btrfs 上，这一差异让安装时从热存储物化 `node_modules` 的耗时大约减半，因此 pnpm 在该平台上优先使用硬链接。ext4 不受影响，它从来不支持克隆，`auto` 本来就走硬链接；macOS 仍优先克隆，因为 APFS 的 `clonefile` 是该平台的低成本原语。

如果你要编辑 `node_modules` 内的文件，应显式选择 `clone`。在硬链接下，`node_modules` 里的文件*就是*存储里的文件，编辑它会改变所有链接同一包的项目。

#### 链接成功但开销高于复制时

`auto` 只有在链接*失败*时才会降级，链接成功但很慢时不会。有两种配置会产生成功但昂贵的链接，在这两种情况下 `packageImportMethod: copy` 都可能快得多。

这些都不是普遍改用 `copy` 的理由。在普通安装中（存储与 `node_modules` 位于同一块常见文件系统，中间没有镜像层），复制是最慢、最占空间的选项。应在目标机器上实测比较两种方式。

#### 打包进容器镜像层的存储

容器运行时通常用 overlayfs 把镜像组装成堆叠的层。在这种环境下，对下层中的文件建立硬链接*会成功*，但该文件会先被复制到可写的上层。预置了 pnpm 存储的镜像会把存储放在下层，因此首次链接任一存储文件时就会把该文件复制上来。pnpm 输出的 "Packages are hard linked from the content-addressable store" 提示依然属实，但安装过程实际上仍会复制出大部分存储内容。

开销按文件计，不按链接计：一个被多个项目链接的包只会被复制上来一次，之后的链接都很廉价。但由于安装过程几乎会把所需的每个文件至少链接一次，被复制上来的仍是存储的大部分。下面这次运行建立了 69k 个链接，复制上来 36.7k 个不同文件。

在含 13 个项目、2074 个包的工作区上，用 pnpm 12（经由 `@pnpm/napi` 12.1.0）实测。存储已完全预填充，未发生任何下载，仅统计写入 `node_modules` 的阶段。环境为无 root 的 podman，内核 `overlay` 存储驱动，`metacopy` 关闭，底层为 btrfs，`--cpus=8`：

| **`packageImportMethod`** | **链接阶段** | **系统时间** | **Written** |
| --- | --- | --- | --- |
| `auto` (hardlinking) | 2.1s | 8.0s | 复制上来 36.7k 个文件，共 366 MB |
| `copy` | 1.5s | 5.6s | 874 MB，没有文件被复制上来 |

overlay 底层使用 btrfs 正是差距较小的原因：在 btrfs 上，复制上来可以共享区段而不必复制数据。在 ext4 上，每次复制上来都是完整的数据复制，差距随之拉大。某个项目的 CI 在 ext4 启动盘上运行这种场景，改用 `copy` 后耗时从 38s 降到 16s。

注意，下文的 `EXDEV` 回退在这里帮不上忙。跨层硬链接不会失败，而是把文件复制上来并报告成功，因此 `auto` 等不到可供降级的失败。

#### 网络与虚拟化文件系统

当存储与 `node_modules` 位于同一文件系统，且该文件系统的每次元数据操作都要走一次远程往返时，也会出现同样的“成功但很慢”的情况，例如网络共享（NFS、SMB、Amazon EFS），或从宿主机共享给虚拟机/容器的目录（virtiofs、gRPC-FUSE、9p）。在这些文件系统上，平台优先尝试的克隆会失败并降级；随后硬链接成功，于是 `auto` 停留在硬链接上，安装过程要为每个文件支付一次往返。复制则是整读整写文件，不需要文件系统远程处理逐文件的元数据操作。

这只发生在两者都位于该文件系统上时。若存储与 `node_modules` 确实在不同的文件系统上，硬链接根本无法建立，尝试会以 `EXDEV` 失败，因此 `auto` 本来就会自行回退为复制。

### modulesCacheMaxAge

- 默认值：**10080**（以分钟计，即 7 天）
- 类型：**数字**

模块目录中的孤儿包在此分钟数之后会被移除。pnpm 会在模块目录中保留一份包缓存，在切换分支或降级依赖时能加快安装速度。

### dlxCacheMaxAge

- 默认值：**1440**（以分钟计，即 1 天）
- 类型：**数字**

dlx 缓存在此分钟数之后过期。执行过某个 dlx 命令后，pnpm 会保留一份缓存，让后续再次运行同一 dlx 命令时跳过安装步骤。

### virtualStoreType

自 v11.23.0 起提供

- 默认值：**project**
- 类型：**project**、**global**

指定虚拟存储所在位置：每个项目一个存储，或整台机器共用一个存储。

```yaml
virtualStoreType: global
```

`project` 是默认布局：每个项目在 `node_modules/.pnpm` 内拥有自己的虚拟存储。`global` 即[全局虚拟存储](/docs/global-virtual-store)：整台机器的所有项目共用一个存储，各项目的 `node_modules` 中只保留指向它的符号链接。

这是 [enableGlobalVirtualStore](#enableglobalvirtualstore) 的规范写法，旧设置仍然有效；两者同时设置时以 `virtualStoreType` 为准。也可以通过环境变量 `PNPM_CONFIG_VIRTUAL_STORE_TYPE` 设置，并用 `pnpm config get virtualStoreType` 读取。

该设置与 [nodeLinker](#nodelinker) 相互独立：`isolated` 和 `pnp` 在两种存储类型下都能工作；`hoisted` 完全不写虚拟存储，因此不受影响。

### enableGlobalVirtualStore

自 v10.12.1 起提供

- 默认值：**false**
- 类型：**布尔值**

:::note[说明]

自 v11.23.0 起，[virtualStoreType](#virtualstoretype) 是该设置的规范写法：`enableGlobalVirtualStore: true` 等价于 `virtualStoreType: global`。两者都有效，同时设置时以 `virtualStoreType` 为准。

:::

:::note[说明]

全局安装（`pnpm add -g`）和 `pnpm dlx` 默认使用全局虚拟存储。

:::

启用后，`node_modules` 中只包含指向中心虚拟存储的符号链接，而非指向 `node_modules/.pnpm`。默认情况下，此中心存储位于 `<store-path>/links`（用 `pnpm store path` 查找 `<store-path>`）。

在中心虚拟存储中，每个包都以硬链接放入一个以其依赖图哈希命名的目录。因此系统上的所有项目都可以从这个磁盘上的共享位置链接各自的依赖。这一思路与 [NixOS 管理包的方式](https://nixos.org/guides/how-nix-works/)在概念上相似，都是用依赖图哈希在 Nix 存储中创建既可隔离又可共享的包目录。

> 不要把它与全局内容寻址存储混为一谈。实际的包文件仍硬链接自内容寻址存储，只不过不是直接链接进 `node_modules/.pnpm`，而是链接进全局虚拟存储。

在有热缓存可用时，使用全局虚拟存储能显著加快安装。但在 CI 环境中（通常没有缓存），它反而可能拖慢安装。若 pnpm 检测到自身运行在 CI 中，会自动禁用此设置。

:::important[重要]

为在使用全局虚拟存储时支持提升依赖，pnpm 依赖 `NODE_PATH` 环境变量，使 Node.js 能从提升后的 `node_modules` 目录解析包。但 Node.js 在 ESM 导入中不识别 `NODE_PATH`，因此在 v11.23.0 之前，若某个依赖导入了**未在其自身 package.json 中声明**的包（这被视为不良实践），ESM 下会解析失败。

自 v11.23.0 起，pnpm 为项目启动的每个进程（`pnpm run`、`pnpm exec`、生命周期脚本，以及 `pnpm dlx` 运行的工具）都会同时获得 `NODE_PATH` 和 `NODE_OPTIONS` 中的 `--import` 标志，后者注册一个解析钩子，为 ESM 恢复 `NODE_PATH` 查找。这类导入现在在 CommonJS 和 ESM 下都能解析，不再需要过去必须添加的 `@pnpm/plugin-esm-node-path` 配置依赖（[#9618](https://github.com/pnpm/pnpm/issues/9618)）。

有两种情况例外：一是你自己（而非通过 pnpm）启动的 `node` 进程；二是将 [extendNodePath](/docs/settings/other#extendnodepath) 设为 `false` 的项目，这会让整个 `NODE_PATH` 机制连同解析钩子一起失效。若在这两种情况下仍需解析缺失的依赖，用 [packageExtensions](/docs/settings/dependency-resolution#packageextensions) 声明它们。

:::

## 依赖提升设置

### hoist

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，所有依赖都会提升到 `node_modules/.pnpm/node_modules`，使 `node_modules` 内的所有包都能访问未列出的依赖。

### hoistWorkspacePackages

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，工作区中的包会视其他提升设置（`hoistPattern` 和 `publicHoistPattern`）被符号链接到 `<workspace_root>/node_modules/.pnpm/node_modules` 或 `<workspace_root>/node_modules`。

### hoistPattern

- 默认值：**['*']**
- 类型：**string[]**

指定哪些包应提升到 `node_modules/.pnpm/node_modules`。默认提升所有包；但如果你清楚只有某些有缺陷的包存在幽灵依赖，可以用此选项只提升幽灵依赖（推荐）。

例如：

```yaml
hoistPattern:
- "*eslint*"
- "*babel*"
```

你也可以用 `!` 将某些模式排除在提升之外。

例如：

```yaml
hoistPattern:
- "*types*"
- "!@types/react"
```

### publicHoistPattern

- 默认值：**[]**
- 类型：**string[]**

与把依赖提升到虚拟存储内隐藏模块目录的 `hoistPattern` 不同，`publicHoistPattern` 会把匹配模式的依赖提升到根模块目录。提升到根模块目录意味着即使解析策略被不当改动，应用代码也能访问幽灵依赖。

在处理某些无法正确解析依赖的有缺陷的可插拔工具时，此设置很有用。

例如：

```yaml
publicHoistPattern:
- "*plugin*"
```

注意：将 `shamefullyHoist` 设为 `true` 等同于把 `publicHoistPattern` 设为 `*`。

你也可以用 `!` 将某些模式排除在提升之外。

例如：

```yaml
publicHoistPattern:
- "*types*"
- "!@types/react"
```

### shamefullyHoist

- 默认值：**false**
- 类型：**布尔值**

默认情况下，pnpm 创建的是半严格的 `node_modules`：依赖可以访问未声明的依赖，但 `node_modules` 之外的模块不行。在这种布局下，生态中绝大多数包都能正常工作。但如果某些工具只有在提升依赖位于 `node_modules` 根目录时才可用，你可以将此设置设为 `true`，让 pnpm 替你完成提升。

### hoistingLimits

自 v11.5.0 起提供

- 默认值：**none**
- 类型：**none**、**workspaces**、**dependencies**

控制使用 `nodeLinker: hoisted` 时依赖提升的范围上限。该设置对应 Yarn 的 `nmHoistingLimits`。

- **none** - 尽可能提升（默认值）
- **workspaces** - 最多提升到各工作区包这一层，防止依赖被提升到依赖它的工作区包之上
- **dependencies** - 只提升到各工作区包的直接依赖这一层，防止传递依赖被提升进工作区包的 `node_modules`
