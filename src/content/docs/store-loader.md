---
title: "实验性的存储加载器"
headingIds: ["running-an-application","manifest-format","opting-out-packages-into-the-global-virtual-store","supported-behavior","compatibility-limits"]
---

pnpm 实验性的 loaded linker 让 Node.js 可以直接从内容寻址存储中加载 JavaScript 和 JSON，而不必把包放进 `node_modules`。该加载器随 pnpm 一同分发。

这是一种实验性的安装模式。在 `pnpm-workspace.yaml` 中持久开启它，让安装和执行命令使用同一种布局：

```yaml
nodeLinker:
  type: loaded
  excluded:
    - vitest
```

然后运行 `pnpm install`，照常使用 `pnpm run`、`pnpm test` 和 `pnpm exec`。pnpm 会生成 `node_modules/.pnpm/.store-manifest.json`，把它内置的运行时写入 `node_modules/.pnpm/.store-loader.mjs`，并为脚本和命令预加载它。Node 子进程通过 `NODE_OPTIONS` 继承该预加载。生成的 JavaScript bin shim 在被直接调用时也会注册加载器。

`nodeLinker.excluded` 存放精确的包名。被选中名称的所有已安装版本和 peer 上下文，以及它们完整的依赖树，都会作为普通的 GVS 包落地。其他 registry 包仍留在内容寻址存储（CAS）中。当一个构建包的已授权副作用缓存条目包含常规文件且其源码下载已通过校验时，它可以留在 CAS 中。启用副作用缓存的读写后，已批准的构建缓存未命中会在临时目录中构建，并把产物上传到存储。如果根项目用 `runtime:` 依赖固定了 Node.js，构建缓存未命中会在 GVS 中构建，使其脚本运行在该 Node.js 上；兼容的结果随后会从 CAS 加载。一个未改动自身包内任何文件的构建同样算作缓存条目，因此它的脚本不会在共享存储的其他项目中再次运行。若某个包的构建必须在每个项目中都运行（例如 git 钩子安装器），请把它列进 [`sideEffectsCache.exclude`](/docs/settings/build#sideeffectscacheexclude)，这样每个项目都会为它单独准备目录。其他构建缓存未命中会落在 GVS 中，并遵循常规的构建批准策略。

包含原生 `.node` 插件、被缓存的符号链接、被打了补丁的包、`node@runtime:` 之类的运行时，以及它们的依赖树，都会自动落地。pnpm 还会扫描 JavaScript 源码，找出对文件系统的导入和诸如 `__dirname`、`import.meta` 这类访问包位置的方式。匹配的包及其依赖会获得真实的目录。这种保守的扫描可能让一些并不需要目录的包也被落地。若某些访问隐藏在动态导入或生成的代码之后，请用 `nodeLinker.excluded` 显式指定。

该模式会启用全局虚拟存储。`node_modules` 只保留安装状态和 bin shim，不再存放包。GVS 包在应用之外拥有常规的依赖链接。工作区源码仍留在各自的项目目录中。项目保留当前的锁文件和存储注册信息；使用该安装方式时请保留这些文件。

切换已有项目时，请先删除旧的 `node_modules` 目录再安装。改变模式不会删除属于旧布局的目录。

生成的文件是本机专用的。移动项目后需要重新安装。CAS 安装目前在重复安装时会重新生成并校验运行时清单，而不是使用乐观安装的快捷路径。

加载器内嵌在 pnpm 可执行文件中，无需单独安装运行时包。独立的 `@pnpm/esm-loader` API 仍可用于手动集成。在 pnpm 之外直接运行 `node app.mjs` 时，需要按下文显式预加载。

`symlink: false` 以及 `nodePackageMap.mode` 为 `off` 以外的值都不能与此模式组合使用。独立的测试运行器解析器和直接的文件系统读取，仍可能需要额外的落地或解析器集成。

## 运行应用

该加载器需要 Node.js 24.18.0 或更新的 24.x 版本，或者 Node.js 26.2.0 及以上。在其他版本上，每个预加载它的 Node.js 进程都会以 `ERR_PNPM_LOADER_UNSUPPORTED_NODE` 停止。完成 CAS 安装后，直接用下面的方式运行 Node：

```sh
node --import ./node_modules/.pnpm/.store-loader.mjs app.mjs
```

若要独立集成，请让加载器独立于应用的依赖存在，并预加载它的注册模块：

```sh
PNPM_LOADER_MANIFEST=/absolute/path/to/.store-manifest.json \
  node --import /absolute/path/to/esm-loader/register.mjs app.mjs
```

在 Windows 上，请用你的 shell 的环境变量语法设置 `PNPM_LOADER_MANIFEST`。若省略该变量，加载器会从当前工作目录读取 `node_modules/.pnpm/.store-manifest.json`。

自定义预加载可以注册一个显式清单：

```js
import { registerStoreLoader } from '@pnpm/esm-loader'

registerStoreLoader(new URL('./node_modules/.pnpm/.store-manifest.json', import.meta.url))
```

用 `node --import ./preload.mjs app.mjs` 运行它。注册会返回 Node 的钩子句柄，它带有 `deregister()` 方法。请在导入应用依赖之前注册。Worker 会通过 Node 的默认执行参数继承 `--import` 预加载。

## 清单格式

清单有三个顶层字段：

| 字段 | 含义 |
| --- | --- |
| `version` | `1` |
| `storeDir` | 包含 `files/` 的带版本号的存储目录。相对路径以清单所在目录为基准解析。 |
| `packages` | 以包实例 ID 为键的对象，包含各个 peer 依赖上下文。 |

每个包条目都有一个把导入名映射到包实例 ID 的 `dependencies` 对象，以及以下两者之一：

- `root`：真实的项目或工作区目录，相对于清单或为绝对路径。
- `files`：把相对于包的文件名映射到其小写 SHA-512 十六进制摘要的对象，可执行二进制会追加 `-exec`。

例如，下面的结构描述了一个导入存储中包的项目。请把摘要占位符替换为真实的 128 位十六进制 SHA-512 哈希：

```json
{
  "version": 1,
  "storeDir": "/home/user/.local/share/pnpm/store/v11",
  "packages": {
    ".": {
      "root": ".",
      "dependencies": { "example": "example@1.0.0" }
    },
    "example@1.0.0": {
      "dependencies": {},
      "files": {
        "package.json": "<sha512 hex digest>",
        "index.js": "<sha512 hex digest>"
      }
    }
  }
}
```

摘要为 `abcdef...` 的文件会从 `<storeDir>/files/ab/cdef...` 读取。包元数据不会从二进制文件名推断。要提供 `type`、`main`、`exports` 和 `imports`，请把 `package.json` 列入文件映射。

即便每个文件的摘要完全相同，也要为不同的依赖上下文使用不同的包 ID。例如 `plugin@1.0.0(peer@1.0.0)` 和 `plugin@1.0.0(peer@2.0.0)` 可以共用 `files` 映射，但依赖目标不同。它们在运行时的模块实例仍然是彼此独立的。

清单描述要加载的有效文件。生成方可以在生成这个文件映射之前，把副作用缓存的差异（包含删除和替换）应用到基础索引上，以表示被缓存的构建产物。选定有效的缓存条目、并授权构建，仍是安装器的职责。

## 把包移出到全局虚拟存储

需要真实文件的包可以使用常规的全局虚拟存储（GVS）安装，包括其完整的锁定依赖树和依赖链接。应用的 `node_modules` 无需包含它。GVS 本身保留其惯常的 `node_modules` 布局。

把该包的清单条目指向它真实的 GVS 目录，并把 `resolution` 设为 `node`：

```json
{
  "root": "/path/to/store/links/@/tool/1.0.0/<graph-hash>/node_modules/tool",
  "resolution": "node"
}
```

应用的依赖映射仍然指向这个包的实例 ID。从该移出包内部发起的导入，会使用 Node 正常的解析和它真实的依赖链接。该条目不需要加载器依赖映射。通过钩子显式指向 CAS 模块的路径仍然可以加载。也请把已落地的传递依赖实例映射到它们的 GVS 根目录，这样应用对这些实例的导入会使用同样的模块。pnpm 去重后，多个移出的 ID 可以共享同一个 GVS 根目录。

请使用 pnpm 常规的安装器来填充 GVS；只复制被选中包的文件并不能形成一个完整的移出。安装器掌管图哈希、包导入、链接、构建策略和存储注册。请保留引用这些条目的安装记录，以便存储清理能追踪其使用情况。独立加载器不会安装包，也不会把它的清单注册给存储清理。常规 CAS 安装会注册项目，`pnpm store prune` 会保留清单引用的二进制和已落地的依赖树。

使用 `frozenStore` 时，pnpm 不会把项目注册到只读存储中。存储必须已经填充完毕，且其所有者必须保留项目所需的文件。

这是显式的兼容性回退方案，不是安装时的静态分析器。它可能落地一棵很大的依赖树，但普通的 GVS 条目可以在项目之间复用。该树之外的包仍留在 CAS 中。直接读取自身依赖树之外应用依赖的工具，仍可能需要额外的移出或解析器集成。

## 支持的行为

加载器支持 ESM 和 CommonJS、相对模块、动态导入、`createRequire`、JSON 导入、包的 `exports` 与 `imports`、条件导出、导出模式、包自引用、别名以及工作区依赖上下文。解析使用 `enhanced-resolve`，并采用面向 Node 的设置。

存储中的模块在清单旁边拥有位于 `.pnpm-loader/` 下的虚拟文件 URL。该目录永远不会被创建。这些 URL 保留了包身份和源文件名；加载器从 CAS 读取相应字节并校验其哈希。该虚拟命名空间是保留的，不能同时作为工作区根目录。

裸导入会解析到已声明的依赖。被打包在导入方自身 `node_modules` 目录中的依赖优先，这与 Node.js 的行为一致。清单中缺失的依赖不会回退到应用已有的 `node_modules` 树。内置模块继续使用 Node 的加载器。解析器返回的绝对路径仍可加载。相对的本地应用文件使用 Node 正常的解析。没有 `package.json` 的包会得到一份内存中的空清单，以把解析限制在其包边界内。

## 兼容性限制

该加载器不会模拟通用文件系统。对存储模块而言，`import.meta.url`、`__filename`、`__dirname` 和 `require.resolve()` 指向的是虚拟位置。把它们传给普通的 `fs` API 无法读取存储中的资源。需要读取相邻资源、扫描目录、向自己的包目录写入，或依赖真实文件名的包，需要落地或单独的文件系统集成。

原生插件、WebAssembly、TypeScript 和包内符号链接都不受该运行时支持。JavaScript bin 可能没有文件扩展名。原生插件还可能需要相邻的共享库，即使其构建产物已被缓存。

ESM 请使用 `.mjs` 或 `"type": "module"`。没有包类型的存储 `.js` 文件会被当作 CommonJS 处理；Node 对有歧义的 `.js` 文件的语法检测并未实现。该解析器并不承诺与 Node 的解析行为完全一致。

加载器不会运行生命周期脚本、选择副作用缓存条目、创建命令 shim，也不会从锁文件生成清单。若一个包的有效文件本身满足上述兼容性要求，带安装脚本的包可以从存储的构建产物中运行。运行时依赖和开发依赖受到相同的文件系统限制。

清单与锁文件和预加载脚本一样，属于受信任的配置。依赖限制和二进制校验并不构成对包代码的沙箱。
