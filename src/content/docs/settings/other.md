---
title: "其他设置"
headingIds: ["saveprefix","tag","globaldir","globalbindir","globalshims","npmrcauthfile","statedir","cachedir","usestderr","updatenotifier","prefersymlinkedexecutables","ignorecompatibilitydb","resolutionmode","registrysupportstimefield","extendnodepath","why-this-is-needed","when-to-disable","deployallfiles","dedupedirectdeps","optimisticrepeatinstall","requiredscripts","enableprepostscripts","scriptshell","shellemulator","catalogmode","ci","catalogprune"]
---

### savePrefix

- 默认值：**'^'**
- 类型：**'^'**, **'~'**, **''**, **'='**

配置安装到 `package.json` 文件中的包版本所使用的版本号前缀。

例如，若某个包的版本为 `1.2.3`，默认其版本会被设为 `^1.2.3`，允许该包进行次要版本升级；而在运行 `pnpm config set save-prefix='~'` 之后，它会被设为 `~1.2.3`，只允许补丁版本升级。

自 v11.19.0 起也接受 `=`：新添加的依赖会以显式的 `=` 运算符（`=1.2.3`）保存，从而锁定精确版本。`pnpm update` 在更新这样的锁定项时会保留 `=` 运算符。

当所添加的包已指定版本范围时，此设置会被忽略。例如，无论 `savePrefix` 取何值，`pnpm add foo@2` 都会将 `package.json` 中 `foo` 的版本设为 `2`。

### tag

- 默认值：**latest**
- 类型：**字符串**

如果你用 `pnpm add` 添加一个包且未提供具体版本，pnpm 会安装此设置指定的 tag 下登记的版本。

这同时决定了当未显式给出 tag 时，`pnpm tag` 命令为其指定的 `package@version` 添加哪个 tag。

### globalDir

- 默认值：
  - 若设置了 **$XDG_DATA_HOME** 环境变量，则为 **$XDG_DATA_HOME/pnpm/global**
  - 在 Windows 上：**~/AppData/Local/pnpm/global**
  - 在 macOS 上：**~/Library/pnpm/global**
  - 在 Linux 上：**~/.local/share/pnpm/global**
- 类型：**路径**

指定用于存放全局包的自定义目录。

### globalBinDir

- 默认值：
  - 若设置了 **$XDG_DATA_HOME** 环境变量，则为 **$XDG_DATA_HOME/pnpm/bin**
  - 在 Windows 上：**~/AppData/Local/pnpm/bin**
  - 在 macOS 上：**~/Library/pnpm/bin**
  - 在 Linux 上：**~/.local/share/pnpm/bin**
- 类型：**路径**

允许设置全局安装包的 bin 文件的目标目录。

:::tip[提示]

在 pnpm v11 中，全局安装的二进制文件存放在 `PNPM_HOME` 下的 `bin` 子目录中，而不是直接放在 `PNPM_HOME` 里。这样当 `PNPM_HOME` 在 PATH 中时，可避免 `global/` 和 `store/` 等内部目录污染 shell 自动补全。升级后，运行 `pnpm setup` 以更新你的 shell 配置。

:::

### globalShims

自 v12.0.0-rc.2 起提供

- 默认值：**{ node: auto, deno: auto, bun: auto }**
- 类型：**Boolean**、**Object**

控制哪些全局安装的包获得[项目感知的 shim](/docs/global-packages#project-aware-global-bins)，即全局命令会运行当前项目要求的版本，而不是全局安装的版本。

该设置是从**包名**到策略的映射。键是*提供*命令的包的名称，而不是命令本身，因此为 `typescript` 设置的条目会覆盖其 `tsc` bin。

```yaml
globalShims:
  node: auto
  deno: false
  typescript: prompt
```

支持的策略如下：

| **Value** | **Behavior** |
| --- | --- |
| `auto` (or `true`) | 当候选版本带有发布者签名认证时自动切换；否则询问一次以确认。 |
| `prompt` | 让每个候选版本都经过确认环节，包括已通过签名验证的版本。回答仍会被记住，因此每个项目与候选版本各询问一次，而不是每次运行时都问。 |
| `always` | 始终切换，从不询问。适用于 CI：在 CI 中一旦弹出提示，就会回退到全局版本。 |
| `false` | 对该包禁用项目感知的 shim。 |

自 v12.0.0-rc.6 起，有两条命令会代你在此写入条目：[pnpm shim add <pkg>](/docs/cli/shim) 会记录它为哪个包链接了 shim；全局安装某个[包管理器](/docs/package-managers)（`pnpm add -g yarn`）会记录该包管理器，使其遵循项目的锁定版本。两者都不会覆盖你自己设置的条目，包括 `false`，也包括将所有 shim 关闭的 `globalShims: false`。

各配置层会在内置默认值之上按键合并，因此单个条目只需修改一个包，无需重述其余部分：`globalShims: { bun: false }` 会让 `node` 和 `deno` 保持 `auto`。

标量简写会替换整个映射而不是合并：`globalShims: false` 禁用所有项目感知的 shim，`globalShims: true` 则重置为默认值。

:::warning[warning]

此设置仅从项目无法写入的位置读取：[全局配置文件](/docs/cli/config)、pnpm 主目录自身的 `pnpm-workspace.yaml`，以及 `PNPM_CONFIG_GLOBAL_SHIMS` 环境变量（一个 JSON 值），按此顺序生效。项目自己的 `pnpm-workspace.yaml` 会被忽略，否则某个仓库就能自行获得用其自身的二进制文件替代你的全局二进制文件的权利。

:::

禁用某个包或更改其策略会在紧接着的下一条命令生效：该设置在每次调度时都会重新读取，因此无需重新安装。

新*启用*某个包是例外。pnpm 在安装时决定要为哪些 bin 写入调度 shim，因此在被禁用期间已全局安装的包需要重新安装，才能应用这一更改：

```bash
pnpm add -g typescript
```

若要在单次调用中绕过调度，设置 `PNPM_SHIM_BYPASS=1`：

```bash
PNPM_SHIM_BYPASS=1 node --version
```

:::note[说明]

项目感知的 shim 是 pnpm v12 的功能，在 v11 中不可用。

:::

### npmrcAuthFile

自 v11.0.0 起提供

- 默认值：**~/.npmrc**
- 类型：**路径**

包含 registry 认证令牌的文件的路径。默认情况下，pnpm 会从 `~/.npmrc` 读取认证令牌，作为 registry 认证的备用方式。使用此设置可改为指向其他文件。

此设置无法在项目级的 `pnpm-workspace.yaml` 中设置；可在全局配置文件中设置，或通过 `--npmrc-auth-file` CLI 选项设置，或通过 `PNPM_CONFIG_NPMRC_AUTH_FILE` 环境变量设置（npm 风格的 `NPM_CONFIG_USERCONFIG` 也会作为备用被接受）。相对路径会相对于工作目录解析。

### stateDir

- 默认值：
  - 若设置了 **$XDG_STATE_HOME** 环境变量，则为 **$XDG_STATE_HOME/pnpm**
  - 在 Windows 上：**~/AppData/Local/pnpm-state**
  - 在 macOS 上：**~/.pnpm-state**
  - 在 Linux 上：**~/.local/state/pnpm**
- 类型：**路径**

pnpm 创建 `pnpm-state.json` 文件的目录，该文件目前仅由更新检查器使用。

### cacheDir

- 默认值：
  - 若设置了 **$XDG_CACHE_HOME** 环境变量，则为 **$XDG_CACHE_HOME/pnpm**
  - 在 Windows 上：**~/AppData/Local/pnpm-cache**
  - 在 macOS 上：**~/Library/Caches/pnpm**
  - 在 Linux 上：**~/.cache/pnpm**
- 类型：**路径**

缓存所在位置（包元数据、dlx 缓存以及部分安装验证结果）。

与存储一样，缓存目录只应在相互信任的用户、任务和进程之间共享。如果你配置或还原了共享的 `cacheDir`，请用文件系统权限保护它，使不受信任的用户无法向其写入。

### useStderr

- 默认值：**false**
- 类型：**Boolean**

为 true 时，所有输出都写入 stderr。

### updateNotifier

- 默认值：**true**
- 类型：**Boolean**

当使用的 pnpm 版本低于最新版时，将其设为 `false` 可屏蔽更新通知。

`pnpm install` 和 `pnpm add` 每天最多检查一次，并打印获取新版本的方法。pnpm 12 在 v12.0.0 之前虽识别但忽略此设置，自 v12.0.0 起也开始进行检查。

### preferSymlinkedExecutables

- 当 **node-linker** 设为 **hoisted** 且系统为 POSIX 时，默认值为 **true**
- 类型：**Boolean**

在 `node_modules/.bin` 中为可执行文件创建符号链接，而不是命令 shim。在 Windows 上此设置会被忽略，因为 Windows 上只有命令 shim 可用。

### ignoreCompatibilityDb

- 默认值：**false**
- 类型：**Boolean**

安装期间，某些包的依赖会被自动打补丁。若想禁用此行为，将此配置设为 `true`。

补丁来自 Yarn 的 [@yarnpkg/extensions](https://github.com/yarnpkg/berry/blob/master/packages/yarnpkg-extensions/sources/index.ts) 包，加上 pnpm 自己精选的条目。

自 v12.0.0 起，该数据库不再收录源自对已发布包进行静态分析的条目。这些条目点名了一些包，而依赖方导入它们仅仅是为了其*类型*。添加这些包轻则多余，重则破坏依赖方：`@typescript-eslint/types` 被加入了一个解析到最新版本的 `typescript` 依赖，致使旧版 `@typescript-eslint` 之下出现 TypeScript 7，令 ESLint 报错 `Cannot read properties of undefined (reading 'Intrinsic')` 而失败。

### resolutionMode

- 默认值：**highest**（v8.0.0 至 v8.6.12 期间为 **lowest-direct**）
- 类型：**highest**、**time-based**、**lowest-direct**

当 `resolutionMode` 设为 `time-based` 时，依赖将按以下方式解析：

1. 直接依赖会解析为其最低版本。因此，若依赖中有 `foo@^1.1.0`，则安装 `1.1.0`。
2. 子依赖会从最后一个直接依赖发布之前已发布的版本中解析。

使用此解析模式时，热缓存下的安装会更快。由于只有在直接依赖更新时子依赖才会更新，这也降低了子依赖被劫持的可能性。

此解析模式仅适用于 npm 的[完整元数据](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#full-metadata-format)，因此在某些场景下会更慢。不过，如果你使用 [Verdaccio](https://verdaccio.org/) v5.15.1 或更新版本，可将 `registrySupportsTimeField` 设置设为 `true`，届时速度会非常快。

当 `resolutionMode` 设为 `lowest-direct` 时，直接依赖会解析为其最低版本。

这里只有 `package.json` 中声明的依赖才算直接依赖。[autoInstallPeers](/docs/settings/peer-dependencies#autoinstallpeers) 添加的对等依赖并非项目声明的内容，因此会像子依赖一样解析：取满足 peer 范围的最高版本，或在 `time-based` 下取发布日期截止范围内的最高版本。

### registrySupportsTimeField

- 默认值：**false**
- 类型：**Boolean**

如果你使用的 registry 会在简略元数据中返回 "time" 字段，则将此设置设为 `true`。[Verdaccio](https://verdaccio.org/) 自 v5.15.1 起支持此功能，一些 registry 代理也支持。

自 v11.23.0 起，也可以按 registry 分别声明，通过 [registry 声明](/docs/registries#supportstimefield) 中的 `supportsTimeField` 字段。registry 自身的声明优先；对于项目未作描述的每个 registry，此设置即为默认答案。

### extendNodePath

- 默认值：**true**
- 类型：**Boolean**

为 `true` 时，pnpm 会在命令 shim（在 `node_modules/.bin` 中创建的包装脚本）里设置 `NODE_PATH` 环境变量。为 `false` 时，不设置 `NODE_PATH`。

#### 为什么需要这样做

pnpm 的[隔离式 node_modules 结构](/docs/symlinked-node-modules-structure)意味着包只能访问自己声明的依赖。但当 CLI 工具通过命令 shim 运行时，一些库（尤其是 jest、eslint 等使用的 [import-local](https://github.com/sindresorhus/import-local)）会从**当前工作目录**而非二进制文件自身所在的位置解析模块。由于工作目录是项目根目录，而不是虚拟存储中的那个包，从 CWD 出发的标准 `node_modules` 解析找不到二进制文件的传递依赖。

为弥合这一缺口，pnpm 在 `NODE_PATH` 中包含两类路径：

1. **包自身的依赖目录**（例如 `.pnpm/pkg@version/node_modules`），这让基于 CWD 的解析能找到该包同级依赖的正确版本。
2. **提升后的 node_modules 目录**（例如 `.pnpm/node_modules`），即设置了 [hoistPattern](/docs/settings/node-modules#hoistpattern) 后存放被提升包的目录。Node.js 无法通过其标准解析算法发现此目录，因此必须通过 `NODE_PATH` 提供。

启用 [enableGlobalVirtualStore](/docs/settings/node-modules#enableglobalvirtualstore) 时，`NODE_PATH` 同样必不可少。使用全局虚拟存储时，包是从项目之外的中心位置建立符号链接的，因此 Node.js 从二进制文件真实路径向上查找 `node_modules` 的标准遍历无法到达项目自己的 `node_modules` 或其被提升的依赖。此时 `NODE_PATH` 必须同时包含项目根目录的 `node_modules` 和位于 `node_modules/.pnpm/node_modules` 的提升目录，才能确保解析正确。

#### 何时禁用

如果你确信项目中没有任何 CLI 工具会从工作目录解析模块，并且没有使用全局虚拟存储，可以将其设为 `false`。禁用后生成的命令 shim 会更简单一些。

### deployAllFiles

- 默认值：**false**
- 类型：**Boolean**

部署某个包或安装本地包时，会复制该包的所有文件。默认情况下，若包在 `package.json` 中有 "files" 字段，则只复制其中列出的文件和目录。

### dedupeDirectDeps

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，已经符号链接到工作区根 `node_modules` 目录的依赖，不会再符号链接到子项目的 `node_modules` 目录。

### optimisticRepeatInstall

自 v10.1.0 起提供

- 默认值：**true**
- 类型：**Boolean**

启用后，会在进入安装前先执行一次快速检查。这样一来，重复安装或在一切已是最新的项目上安装都会快得多。

### requiredScripts

此数组中列出的脚本在工作区的每个项目中都是必需的，否则 `pnpm -r run <script name>` 将会失败。

```yaml
requiredScripts:
- build
```

### enablePrePostScripts

- 默认值：**true**
- 类型：**Boolean**

为 `true` 时，pnpm 会自动运行任何前后脚本。因此运行 `pnpm foo` 就如同运行 `pnpm prefoo && pnpm foo && pnpm postfoo`。

### scriptShell

- 默认值：**null**
- 类型：**路径**

`pnpm run` 命令运行脚本时所使用的 shell。

例如，要在 Windows 上强制使用 Git Bash：

```
pnpm config set scriptShell "C:\\Program Files\\git\\bin\\bash.exe"
```

### shellEmulator

- 默认值：**false**
- 类型：**Boolean**

为 `true` 时，pnpm 会使用[类 bash shell](https://www.npmjs.com/package/@yarnpkg/shell) 的 JavaScript 实现来执行脚本。

此选项简化了跨平台脚本编写。例如，默认情况下，以下脚本会在不符合 POSIX 的系统上失败：

```json
"scripts": {
  "test": "NODE_ENV=test node test.js"
}
```

但如果将 `shellEmulator` 设置设为 `true`，它就能在所有平台上工作。

:::note[说明]

Node.js 22 及更高版本无需 pnpm 协助即可运行脚本。对于上面的例子，你可以用 `node --run test` 运行 `test` 脚本。但 `shellEmulator` 选项对此没有影响。依赖 POSIX 特性的脚本必须用 `pnpm run` 而非 `node --run` 运行，才能在不符合 POSIX 的环境中工作。

:::

### catalogMode

自 v10.12.1 起提供

- 默认值：**manual**
- 类型：**manual**、**strict**、**prefer**

控制运行 `pnpm add` 时是否以及以何种方式将依赖添加到默认目录（catalogs）。共有三种模式：

- **strict** - 只允许使用 catalog 中的依赖版本。添加超出 catalog 版本范围的依赖会导致错误。
- **prefer** - 优先使用 catalog 版本，但若找不到兼容版本，则回退到直接依赖。
- **manual**（默认）- 不会自动将依赖添加到 catalog。

### ci

自 v10.12.1 起提供

- 默认值：**true**（当环境被检测为 CI 时）
- 类型：**Boolean**

此设置显式告知 pnpm 当前环境是否为 CI（持续集成）环境。

### catalogPrune

自 v11.22.0 起提供（自 v10.15.0 起名为 `cleanupUnusedCatalogs`）

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，pnpm 会在安装期间移除未使用的 catalog 条目。

`cleanupUnusedCatalogs` 是此设置已废弃的旧拼写，仍可继续使用；当两者同时设置时，以 `catalogPrune` 为准。
