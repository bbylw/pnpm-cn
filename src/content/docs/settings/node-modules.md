---
title: "node_modules 与依赖提升设置"
headingIds: ["node-modules-settings", "modulesdir", "nodelinker", "nodelinkerexcluded", "nodepackagemapmode", "nodepackagemaptype", "nodeexperimentalpackagemap", "nodepackagemaptype-1", "symlink", "enablemodulesdir", "virtualstoredir", "virtualstoredirmaxlength", "virtualstoreonly", "packageimportmethod", "what-auto-tries-first", "when-a-link-succeeds-but-costs-more-than-a-copy", "a-store-baked-into-a-container-image-layer", "network-and-virtualized-filesystems", "how-many-files-macos-writes-at-once", "modulescachemaxage", "dlxcachemaxage", "virtualstoretype", "enableglobalvirtualstore", "globalvirtualstoredir", "dependency-hoisting-settings", "hoist", "hoistpattern", "publichoistpattern", "hoistworkspacepackages", "shamefullyhoist", "hoistinglimits", "externaldependencies"]
---

## node_modules 设置

### modulesDir

- 默认值：**node_modules**
- 类型：**路径**

安装依赖的目录（而非 `node_modules`）。

在工作区中，相对路径会在每个项目内使用。绝对路径，或以 `..` 开头的路径，只作用于根项目。其它项目会使用以路径最后一段命名的目录，例如 `../vendor` 对应的 `vendor`。

### nodeLinker

- 默认值：**isolated**
- 类型：**isolated**、**hoisted**、**pnp**、**loaded**，或一个链接器对象

定义安装 Node 包时使用的链接器。标量写法仍然受支持。对象写法用 `type` 选择链接器，并把与该链接器相关的选项归到一起。

配置来源之间会互相替换所选的链接器。优先级更高的来源所提供的选项会覆盖优先级更低的来源中的同名选项。`hoistPattern`、`publicHoistPattern`、`hoistingLimits` 这样的扁平设置仍然作为别名受支持。当某个来源同时给出扁平设置和它的对象形式时，对象形式优先。环境变量 `PNPM_CONFIG_NODE_LINKER` 和 `--config.node-linker` 接受 JSON 形式的对象。

省略或为 `null` 的 `hoist`、`public`、`private` 或 `hoistingLimits` 会保留来自优先级更低的来源的值。显式设置的 `shamefullyHoist` 会替换公开模式，无论该设置由哪个来源给出。空的模式列表会禁用向该目标的提升。当 `public` 和 `private` 模式都匹配某个包时，公开模式优先。

isolated 链接器接受布尔形式的 `hoist`，也接受带 `public` 和 `private` 模式列表的对象。`true` 表示选择默认值，即 `public: []` 和 `private: ['*']`。`false` 会同时禁用两者。当两个列表都匹配时，公开模式优先。取反在各自列表内生效，两个列表都不匹配的包不会被提升。

```yaml
nodeLinker:
  type: isolated
  hoist:
    public: []
    private: ['*']
```

hoisted 链接器接受 `hoistingLimits`：

```yaml
nodeLinker:
  type: hoisted
  hoistingLimits: workspaces
```

loaded 链接器接受 `excluded` 列表。该列表会替换优先级更低的排除项，省略该列表则清空它们。其它链接器类型会拒绝它们不支持的选项。

- **isolated** - 依赖以符号链接指向位于 `node_modules/.pnpm` 的虚拟存储
- **hoisted** - 以不带符号链接的形式创建一个扁平的 `node_modules`。效果等同于 npm 或 Yarn Classic 创建的那种 `node_modules`。pnpm 使用 Yarn 的提升算法进行提升。使用此设置的合理理由有：
  1. 你的工具链与符号链接配合不佳。
  2. 项目要部署到 serverless 托管平台。部分 serverless 平台（如 AWS Lambda）不支持符号链接。另一种解决办法是在部署前先把应用打包。
  3. 你想通过 [`"bundledDependencies"`] 发布自己的包。
  4. 你需要带 [--preserve-symlinks] 标志运行 Node.js。
- **pnp** - 不使用 `node_modules`。Plug'n'Play 是一种创新的 Node 策略，[被 Yarn Berry 采用][pnp]。以 `pnp` 作为链接器时，建议同时把 `symlink` 设置设为 `false`。
- **loaded** - 实验性地直接从内容寻址存储加载。pnpm 会为脚本和命令预加载自己的 Node.js 加载器。被选中的兼容包及其依赖树使用全局虚拟存储。参见[实验性存储加载器](/docs/store-loader)。

使用 `nodeLinker: pnp` 时，pnpm 会在锁文件旁写出 `.pnp.cjs`，即使配置了 [`lockfileDir`](/docs/settings/store#lockfiledir) 也一样。`pnpm run` 和 `pnpm exec` 会自动加载它。`pnpm install` 会重新创建丢失的加载器。CommonJS 解析会遵循包的 `exports` 和 `require.resolve()` 的查找路径。

[pnp]: https://yarnpkg.com/features/pnp
[--preserve-symlinks]: https://nodejs.org/api/cli.html#cli_preserve_symlinks
[`"bundledDependencies"`]: https://docs.npmjs.com/cli/v8/configuring-npm/package-json#bundleddependencies

### nodeLinker.excluded

- 默认值：**[]**
- 类型：**string[]**

当 `nodeLinker.type: loaded` 时，在全局虚拟存储中实体化这些包名及其完整的依赖树。名称会匹配所有已安装版本和对等上下文。这些树之外的包直接从 CAS 加载。构建批准设置依然生效。

```yaml
nodeLinker:
  type: loaded
  excluded:
    - vitest
```

### nodePackageMap.mode

自 v12.13.0 起提供

- 默认值：**off**
- 类型：**off**、**write-only**、**load**

控制 `node_modules/.package-map.json`，pnpm 在 isolated 与 hoisted 安装期间写入该文件。

- **off** - pnpm 不写包映射。安装也会移除先前安装留下的映射。
- **write-only** - pnpm 写出包映射供其它工具读取，Node.js 不加载它。
- **load** - pnpm 写出包映射，并把 Node 的 `--experimental-package-map` 选项通过 `NODE_OPTIONS` 加入 pnpm 管理的 Node.js 脚本环境。

对应的环境变量为 `PNPM_CONFIG_NODE_PACKAGE_MAP_MODE`。

```yaml
nodePackageMap:
  mode: write-only
```

### nodePackageMap.type

自 v12.13.0 起提供

- 默认值：**standard**
- 类型：**standard**、**loose**

控制 `node_modules/.package-map.json` 的生成方式。

- **standard** - 通过包映射只能访问已声明的依赖。
- **loose** - 同时映射已安装的 `node_modules` 结构中可达的包，这可能让未声明的提升依赖也能被解析。

对应的环境变量为 `PNPM_CONFIG_NODE_PACKAGE_MAP_TYPE`。

```yaml
nodePackageMap:
  mode: load
  type: loose
```

### nodeExperimentalPackageMap

自 v12.13.0 起废弃：请改用 [`nodePackageMap.mode`](#nodepackagemapmode) 代替。`nodeExperimentalPackageMap: true` 等价于 `mode: load`，`false` 等价于 `mode: off`。两者设在同一处时，`nodePackageMap` 优先。

CLI 与环境变量配置使用短横线命名 `node-experimental-package-map`。

### nodePackageMapType

自 v12.13.0 起废弃：请改用 [`nodePackageMap.type`](#nodepackagemaptype-1)。两者设在同一处时，`nodePackageMap` 优先。

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

从 URL 或本地路径安装的依赖，如果其协议之后的部分含有 `+`、`#`、`:`、`?` 或其它不允许出现在文件名中的字符，会在目录名上附加一个哈希后缀，从而避免不同的 URL 共用同一个目录。

这是一个实用的设置，可以解决 Windows 上的长路径问题。如果某些依赖的路径非常长，你可以把虚拟存储放在磁盘根目录（例如 `C:\my-project-store`）。

你也可以把虚拟存储设为 `.pnpm` 并将其加入 `.gitignore`。依赖的路径会比原来少一层目录，堆栈跟踪更整洁。

**注意：** 虚拟存储不能在多个项目之间共享。每个项目都应拥有自己的虚拟存储（工作区除外，工作区中根目录的虚拟存储是共享的）。

当 [`enableGlobalVirtualStore`](#enableglobalvirtualstore) 启用时，`virtualStoreDir` 设定的是全局虚拟存储的位置，它可以被多个项目共享。每个项目仍然把自己的锁文件和隐藏的提升依赖保留在自己的 `node_modules/.pnpm` 中。

### virtualStoreDirMaxLength

- 默认值：
  - Linux/macOS 上：**120**
  - Windows 上：**60**
- 类型：**数字**

设置虚拟存储目录（`node_modules/.pnpm`）内目录名的最大允许长度。如果在 Windows 上遇到长路径问题，可以把此值调低。

### virtualStoreOnly

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，pnpm 会填充虚拟存储，但不创建导入方符号链接、不进行依赖提升、不创建 bin 链接，也不运行生命周期脚本。适合在不产生多余项目级产物的前提下预填充存储（例如在 Nix 构建中）。`pnpm fetch` 内部就使用此模式。

### packageImportMethod

- 默认值：**auto**
- 类型：**auto**、**hardlink**、**copy**、**clone**、**clone-or-copy**

控制从存储导入包的方式（如果你想禁用 `node_modules` 内的符号链接，要改的是 [nodeLinker](#nodelinker) 设置，不是这个）。

- **auto** - 按顺序尝试各平台的低成本链接方式，全部不可用时回退为复制。在 Linux 和 Windows 上先尝试硬链接再尝试克隆；在 macOS 上先尝试克隆再尝试硬链接
- **hardlink** - 从存储对包建立硬链接
- **clone-or-copy** - 尝试从存储克隆包，不支持克隆时回退为复制
- **copy** - 从存储复制包
- **clone** - 从存储克隆包（即写时复制或引用链接）

生命周期脚本或补丁仍会写入的包不能与存储共享文件，因此当该设置为 `auto`、`hardlink` 或 `clone` 时，pnpm 会用 `clone-or-copy` 导入它们。使用 `copy` 时，这类包和其它包一样被复制。

和复制一样，克隆会让 `node_modules` 与存储保持分离。你可以编辑 `node_modules` 中的文件，而中心内容寻址存储中的文件不会被修改。与复制不同的是，克隆与存储中的文件共享数据，直到其中一个被写入，因此不会占用额外磁盘空间。

并非所有文件系统都支持克隆。要在 Linux 上克隆，请使用写时复制（CoW）文件系统，例如用 btrfs 而不是 ext4，并把 `packageImportMethod` 设为 `clone`。在 Linux 和 Windows 上，[`auto` 会先尝试硬链接](#what-auto-tries-first)。

#### `auto` 优先尝试的方式

`auto` 的顺序因平台而异：

| **Platform** | **Order** |
| --- | --- |
| Linux | 硬链接 → 克隆 → 复制 |
| macOS | 克隆 → 硬链接 → 复制 |
| Windows | 硬链接 → 克隆 → 复制 |

引用链接（reflink）会新建一个 inode，并在文件系统元数据树内复制区段（extent）记录，而硬链接只是一条目录项。在 btrfs 上，这一差异让安装时从热存储物化 `node_modules` 的耗时大约减半，因此 pnpm 在该平台上优先使用硬链接。ext4 不受影响，它从来不支持克隆，`auto` 本来就走硬链接。在 Windows Dev Drive（ReFS）上，块克隆每个文件需要若干次调用，而硬链接只需一次，因此 Windows 同样优先硬链接。macOS 仍优先克隆，因为 APFS 的 `clonefile` 是该平台的低成本原语。

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

#### macOS 一次写入多少文件

在 macOS 上，无论 CPU 核心数量是多少，pnpm 都用 4 个线程把包文件写入 `node_modules`。在所测量的 Mac 上，更多线程反而让安装变慢。

通过 Endpoint Security 监视文件操作的安全软件（很多公司管理的 Mac 上都有）可能改变这一结论。在这样一台 Mac 上，当 pnpm 用安装其余部分所用的线程写文件时，安装时间大约减少了 40%。把环境变量 `PNPM_MACOS_LINK_THREADS` 设为 `0` 即可，或者设为一个正数以使用该数量的线程。如果你的 Mac 运行着这类软件，请比较 `0` 与默认值下的安装耗时：

```sh
PNPM_MACOS_LINK_THREADS=0 pnpm install
```

### modulesCacheMaxAge

- 默认值：**10080**（以分钟计，即 7 天）
- 类型：**数字**

模块目录中的孤儿包在此分钟数之后会被移除。pnpm 会在模块目录中保留一份包缓存，在切换分支或降级依赖时能加快安装速度。

### dlxCacheMaxAge

- 默认值：**1440**（以分钟计，即 1 天）
- 类型：**数字**

dlx 缓存在此分钟数之后过期。执行过某个 dlx 命令后，pnpm 会保留一份缓存，让后续再次运行同一 dlx 命令时跳过安装步骤。

### virtualStoreType

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

- 默认值：**false**
- 类型：**布尔值**

:::note[说明]

自 v11.23.0 起，[virtualStoreType](#virtualstoretype) 是该设置的规范写法：`enableGlobalVirtualStore: true` 等价于 `virtualStoreType: global`。两者都有效，同时设置时以 `virtualStoreType` 为准。

:::

:::note[说明]

全局安装（`pnpm add -g`）默认使用全局虚拟存储。`pnpm dlx` 则不同：dlx 缓存中的每个条目都保留自己的虚拟存储。

:::

启用后，`node_modules` 中只包含指向中心虚拟存储的符号链接，而非指向 `node_modules/.pnpm`。默认情况下，此中心存储位于 `<store-path>/links`（用 `pnpm store path` 查找 `<store-path>`）。

在中心虚拟存储中，每个包都以硬链接放入一个以其依赖图哈希命名的目录。因此系统上的所有项目都可以从这个磁盘上的共享位置链接各自的依赖。这一思路与 [NixOS 管理包的方式](https://nixos.org/guides/how-nix-works/)在概念上相似，都是用依赖图哈希在 Nix 存储中创建既可隔离又可共享的包目录。

> 不要把它与全局内容寻址存储混为一谈。实际的包文件仍硬链接自内容寻址存储，只不过不是直接链接进 `node_modules/.pnpm`，而是链接进全局虚拟存储。

在有热缓存可用时，使用全局虚拟存储能显著加快安装。但在 CI 环境中（通常没有缓存），它反而可能拖慢安装。

:::important[重要]

为在使用全局虚拟存储时支持提升依赖，pnpm 依赖 `NODE_PATH` 环境变量，使 Node.js 能从提升后的 `node_modules` 目录解析包。但 Node.js 在 ESM 导入中不识别 `NODE_PATH`，因此 pnpm 为项目启动的每个进程（`pnpm run`、`pnpm exec`、生命周期脚本，以及 `pnpm dlx` 运行的工具）都会同时获得 `NODE_PATH` 和 `NODE_OPTIONS` 中的 `--import` 标志，后者注册一个解析钩子，为 ESM 恢复 `NODE_PATH` 查找。这样，导入**未在其自身 `package.json` 中声明**的包（这被视为不良实践）的依赖，在 CommonJS 和 ESM 下都能解析。

当你在 pnpm 之外启动 `node`，或把 [`extendNodePath`](/docs/settings/other#extendnodepath) 设为 `false` 时，pnpm 不会把全局虚拟存储的 `NODE_PATH` 条目和 ESM 解析钩子加入进程环境。在这两种情况下，请用 [packageExtensions] 声明缺失的依赖。这也有助于 [TypeScript 解析未声明的导入](/docs/global-virtual-store#limitations)。

:::

### globalVirtualStoreDir

- 默认值：**`<store-path>/links`**
- 类型：**路径**

[全局虚拟存储](#enableglobalvirtualstore)的位置。它的优先级高于 [`virtualStoreDir`](#virtualstoredir)。当它未设置且全局虚拟存储开启时，显式设置的 `virtualStoreDir` 就用于放置全局虚拟存储。

## 依赖提升设置

### hoist

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，所有依赖都会提升到 `node_modules/.pnpm/node_modules`，使 `node_modules` 内的所有包都能访问未列出的依赖。

### hoistPattern

- 默认值：**['*']**
- 类型：**string[]**

指定哪些包应提升到 `node_modules/.pnpm/node_modules`。默认提升所有包；但如果你清楚只有某些有缺陷的包存在幽灵依赖，可以用此选项只提升幽灵依赖（推荐）。

使用默认虚拟存储时，向工作区根目录添加一个直接依赖，会在下次完整安装时移除它的隐藏提升链接。外部虚拟存储可以保留该链接，以解析这个依赖。

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

在工作区中，除非关闭了 [`hoistWorkspacePackages`](#hoistworkspacepackages)，该模式也会匹配工作区项目的名称。

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

在工作区中，除非关闭了 [`hoistWorkspacePackages`](#hoistworkspacepackages)，该模式也会匹配工作区项目的名称。

### hoistWorkspacePackages

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，工作区中的项目也是提升候选者，而不只是来自 registry 的包。

[`hoistPattern`](#hoistpattern) 和 [`publicHoistPattern`](#publichoistpattern) 随后决定每个项目落在哪里，与对 registry 依赖的处理完全一样。先检查 `publicHoistPattern`，因此同时匹配两个模式的项目只会落在根目录：

- 名称匹配 `publicHoistPattern` 的项目会被符号链接到 `<workspace_root>/node_modules`。
- 只匹配 `hoistPattern` 的项目会被符号链接到 `<workspace_root>/node_modules/.pnpm/node_modules`。
- 两者都不匹配的项目不会被提升。

因为 `hoistPattern` 默认为 `['*']`，而 `publicHoistPattern` 默认为 `[]`，默认情况下每个工作区项目都会被符号链接到 `<workspace_root>/node_modules/.pnpm/node_modules`。

这正是按名称从工作区根目录解析包的工具能够找到工作区项目的方式。常见场景是 ESLint 加载在同一 monorepo 中开发的插件：

```yaml
publicHoistPattern:
  - "*eslint*"
```

有了该设置，名为 `eslint-plugin-acme` 的工作区项目会出现在 `<workspace_root>/node_modules/eslint-plugin-acme`，即使没有任何 `package.json` 把它列为依赖。

一些值得了解的细节：

- 项目按其 `package.json` 中的 `name` 匹配，而不是目录名。
- 工作区的每个项目都是候选者，包括没有被其它项目依赖的项目。工作区根项目永远不会被提升。
- 符号链接指向工作区中项目自己的目录，因此没有任何内容需要保持同步。
- 直接依赖优先于同名冲突。如果某个与工作区项目同名的包是任一工作区项目的直接依赖，那么提升的是该包，而不是工作区项目。
- 该设置只增加候选者。当 `hoistPattern` 和 `publicHoistPattern` 都为空时，什么都不会被提升，包括工作区项目。把 [`hoist`](#hoist) 设为 `false` 会清空 `hoistPattern`。

### shamefullyHoist

- 默认值：**false**
- 类型：**布尔值**

默认情况下，pnpm 创建的是半严格的 `node_modules`：依赖可以访问未声明的依赖，但 `node_modules` 之外的模块不行。在这种布局下，生态中绝大多数包都能正常工作。但如果某些工具只有在提升依赖位于 `node_modules` 根目录时才可用，你可以将此设置设为 `true`，让 pnpm 替你完成提升。

### hoistingLimits

- 默认值：**none**
- 类型：**none**、**workspaces**、**dependencies**

控制使用 `nodeLinker: hoisted` 时依赖提升的范围上限。该设置对应 Yarn 的 `nmHoistingLimits`。

- **none** - 尽可能提升（默认值）
- **workspaces** - 最多提升到各工作区包这一层，防止依赖被提升到依赖它的工作区包之上
- **dependencies** - 只提升到各工作区包的直接依赖这一层，防止传递依赖被提升进工作区包的 `node_modules`

### externalDependencies

- 默认值：**[]**
- 类型：**string[]**

由其它工具链接进根 `node_modules` 的依赖名称。使用 `nodeLinker: hoisted` 时，pnpm 不会把别名列在这里的依赖放到顶层，把该位置留给其它工具。此设置对其它链接器无效。

```yaml
externalDependencies:
  - bit-bin
```

[packageExtensions]: /docs/settings/dependency-resolution#packageextensions
