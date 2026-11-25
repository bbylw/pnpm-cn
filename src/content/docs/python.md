---
title: "Python 依赖"
headingIds: ["adding-a-package","the-environment","project-packages-and-local-sources","locking-for-multiple-environments","filtering-projects","selecting-extras-and-dependency-groups-per-project","sharing-one-environment","resolution","faster-resolution-through-pnpr","settings","pythonenabled","pythonexecutable","python-indexes","pythonoverrides","pythonconstraints","importing-wheel-files","pythonextras","pythongroups","pythonversions"]
---

自 v12.4.0 起提供（仅 pnpm v12）

:::warning[警告]

多生态支持仍是实验性的。它所写入的设置和目录结构可能变化。

:::

pnpm 可以把项目的 Python 依赖与 npm 包一起安装。一次 `pnpm install` 会同时解析两张依赖图，使用 pnpm 的连接预算，并把每个经过校验的 wheel 存入 pnpm 的内容寻址存储，因此为某个项目拉取的 wheel 可以被下一个项目复用。

在 `pnpm-workspace.yaml` 中开启：

```yaml
python:
  enabled: true
```

pnpm 会读取项目的 `pyproject.toml`，写出 [`pylock.toml`](https://packaging.python.org/en/latest/specifications/pylock-toml/)，并为它构建一个环境。

## 添加包

给依赖要求加上 `pypi:` 前缀：

```sh
pnpm add pypi:httpx
pnpm add pypi:httpx@0.28.1
pnpm add pypi:'httpx>=0.28'
pnpm add -D pypi:pytest
```

裸写的 `name@version` 会被写成精确固定（`httpx==0.28.1`）。已经带比较运算符的要求会按原样保留，并且支持完整的 [PEP 508](https://peps.python.org/pep-0508/) 语法，包括环境标记和 extras。

当 `python.enabled` 为 `true` 时，[`pnpm outdated`](/docs/cli/outdated) 和 [`pnpm update`](/docs/cli/update) 也会检查并更新 Python 依赖，并接受 `pypi:<name>` 选择器来定位具体的发行版。

## 环境

每个被发现的 Python 项目都会在自己目录下得到一个 `.venv`，除非其工作区[共用一个环境](#sharing-one-environment)。它是指向 pnpm 存储中 `python-envs` 的符号链接，环境变化时 pnpm 会原子地替换该链接，因此安装失败时旧环境会原样保留。

自 v12.5.0 起，环境存放在存储中，每个项目只保留自己的 `.venv` 链接。下一次安装会迁移早期版本创建的链接。旧的项目内 `.pnpm/python-envs` 目录会保留原样，一旦没有程序在使用就可以删除。使用 [`frozenStore`](/docs/settings/store#frozenstore) 时，环境则继续留在项目的 `.pnpm/python-envs` 下。

pnpm 拒绝改动不是自己创建的 `.venv`，因此手工创建的虚拟环境永远不会被替换。

[`pnpm run`](/docs/cli/run) 和 [`pnpm exec`](/docs/cli/exec) 会把环境的脚本目录（`.venv/bin`，Windows 上是 `.venv/Scripts`）放在 `PATH` 最前面，因此脚本无需激活任何东西就能调用 `pytest` 或 `ruff`。

Python 的依赖要求、标记和锁文件语义都与 npm 和 Cargo 分开。共享的是它们下面的基础设施：HTTP 与认证预算、产物校验和存储。

`--lockfile-only`、`--frozen-lockfile` 和 `--offline` 同样适用于 Python 依赖。

## 项目包与本地源

自 v12.5.0 起提供

如果项目声明了 `[build-system]`，pnpm 会以可编辑方式安装项目自身的包，使其导入和 `[project.scripts]` 命令立即可用。修改源码无需重新安装即可生效。`[tool.uv].package` 决定该项目是否被打包。动态元数据从所声明的构建后端读取。只有 `requirements.txt` 的项目同样可以获得环境和 `pylock.toml`。如果其目录中已有不是 pnpm 创建的 `.venv`，`pnpm install` 会跳过该项目并打印警告。删除该 `.venv` 即可让 pnpm 安装这些依赖要求。

在 `pyproject.toml` 中声明工作区依赖和本地依赖：

```toml
[project]
name = "app"
version = "0.1.0"
dependencies = ["shared"]

[tool.uv.sources]
shared = { workspace = true }
# 或者：shared = { path = "../shared", editable = true }
```

pnpm 会用所声明的后端构建本地包。可编辑安装会跟随源码改动。如果某个依赖要求指向一个工作区项目却没有声明源，pnpm 会拒绝它，而不是从索引拉取。

构建依赖需要在 [`allowBuilds`](/docs/settings/build#allowbuilds) 下获得批准，键为 Package URL：

```yaml
allowBuilds:
  'pkg:pypi/hatchling': true
```

未获批准的后端会被跳过，并给出提示需要添加哪条批准。Git 源和源码分发包还需要单独批准 `pkg:pypi/<distribution>`。当没有发布兼容的 wheel 时，pnpm 可以构建源码分发包；其归档和 SHA-256 会固定在 `pylock.toml` 中，已缓存的源码可离线重放。直接的 wheel URL 和 Git 源可以在 `[tool.uv.sources]` 中声明；Git 和 URL 源不能以可编辑方式安装。

## 为多个环境锁定

自 v12.5.0 起提供

使用 [`supportedArchitectures`](/docs/settings/dependency-resolution#supportedarchitectures) 和 `python.versions`，可以为多个平台和解释器解析出一份 `pylock.toml`：

```yaml
supportedArchitectures:
  - linux-x64-manylinux_2_28
  - darwin-arm64
  - win32-x64
python:
  enabled: true
  versions: ['3.12', '3.13']
```

每个平台都会与每个 Python 版本配对。锁文件会为每个环境固定 wheel 和带条件的包。安装时选择匹配的环境，并拒绝声明环境之外的解释器。若两者都没有设置，pnpm 会按运行安装的解释器锁定。

## 过滤项目

项目发现会遵循 `[tool.uv.workspace]` 的成员。声明了工作区但没有 `[project]` 表的 `pyproject.toml` 不算项目，因此 pnpm 会忽略旁边的 `requirements.txt`。在显式声明的 uv 工作区之外，常见的 example、demo、documentation、template、test 和 fixture 目录会被跳过。

自 v12.5.0 起，`pnpm install --filter <选择器>` 可以按名称、路径，或 `[tool.uv.sources]` 中声明的依赖来选择 Python 项目。与 npm 工作区项目同处的 Python 项目会随该项目一起被选中。`--fail-if-no-match` 接受仅匹配 Python 的结果，`pnpm add --filter <选择器> pypi:<包>` 会写入每个被选中的项目。选中共享环境的成员时，会安装整个环境。

## 按项目选择 extras 与依赖组

自 v12.5.0 起提供

工作区的 `python.extras` 和 `python.groups` 是默认值。每个项目只选择自己定义的名称，因此 extras 和依赖组不同的成员可以共存安装。例如 `groups: [dev, test]` 在同时定义了两个组的项目中会选中两者，在只定义 `dev` 的项目中则只选中 `dev`。

在项目的 `pyproject.toml` 中覆盖其中任一列表：

```toml
[tool.pnpm.python]
extras = ["cli"]
groups = ["test"]
```

两个列表各自独立地覆盖工作区默认值。省略某个列表即保留其工作区默认值。空列表表示为该项目禁用该默认值。

显式的项目选择必须存在于该项目中。被选中组的 `include-group` 引用必须存在，且不能形成环。Extra 和依赖组名称遵循 Python 的规范化规则，因此 `dev_tools` 与 `dev-tools` 会被视为相同。这同样适用于从动态构建后端元数据获得的 extras。

要使用 `pnpm add -D pypi:<名称>`，请直接选择 `dev` 组，或从被选中的组中包含它。

这些选择会参与锁定。`--prod` 和 `--dev` 只决定安装哪些依赖，不会改变完整的锁文件。对另一个项目的 extra 的依赖要求（例如 `library[cli]`）会独立于 `library` 自身的安装设置选中该发行版的 extra。

## 共用一个环境

自 v12.5.0 起提供

默认情况下每个项目各自解析依赖并拥有自己的环境。但 [uv 工作区](https://docs.astral.sh/uv/concepts/projects/workspaces/)的成员可以共用一个环境。在声明工作区的 `pyproject.toml` 中提出这个要求：

```toml
[tool.uv.workspace]
members = ["packages/*"]

[tool.pnpm.python]
shared-environment = true
```

此后 `pnpm install` 会把所有成员作为一张依赖图解析，生成一份 `pylock.toml`，并在工作区根目录生成一个 `.venv`。每个成员仍会选择自己的 extras 和依赖组，环境则持有它们的并集。每个需要构建包的成员都会被安装进环境；某个成员通过 `[tool.uv.sources]` 被另一成员依赖时，则按该源的要求安装。所有成员共用一个解释器：即机器上第一个满足所有成员 `requires-python` 的解释器，优先选择根目录 `.python-version` 所要求的版本。若机器上没有合适的解释器，pnpm 会像为单个项目安装时那样下载一个，下载失败时的行为由 [`runtimeOnFail`](/docs/settings/cli#runtimeonfail) 控制。

若两个成员所需的同一发行版本没有任何发布版本能同时满足，pnpm 会拒绝并给出包含该发行版和两个成员名称的错误。两个成员各自的 `[project]` 表声明了同名发行版时也会被拒绝，因为一个环境只能持有一个同名发行版。成员之间可以自由地依赖相同的依赖，环境只保存一份。

用 [`--filter`](/docs/filtering) 选中任一成员都会安装整个共享环境。在成员中运行 `pnpm add` 会写入该成员的 `pyproject.toml` 和共享的 `pylock.toml`。在工作区根目录运行 `pnpm update` 会更新匹配的成员清单和共享的 `pylock.toml`。在成员中（或其任意子目录中）运行 [`pnpm run`](/docs/cli/run) 和 [`pnpm exec`](/docs/cli/exec) 会使用工作区根目录的 `.venv`。

是否共用按工作区决定，因此同一个仓库可以在项目达成一致的地方共用环境，在不一致的地方保持独立。

## 解析

pnpm 从索引在 wheel 旁发布的元数据文件中读取每个发行版的要求（[PEP 658](https://peps.python.org/pep-0658/)），只有当该发行版被选中后才下载 wheel。对于不发布元数据文件、或没有 SHA-256 可供校验的索引，pnpm 会从 wheel 内部读取要求。索引页面和元数据文件会并行读取，最多同时 [`networkConcurrency`](/docs/settings/network#networkconcurrency) 个。

### 通过 pnpr 加速解析

设置 [`pnprServer`](https://pnpm.io/pnpr/install-acceleration) 后，服务器会负责解析 Python 依赖图，pnpm 无需读取索引来了解每个发行版的要求。如果服务器不支持 Python、不接受请求使用的某个设置或锁文件格式，pnpm 会在本地解析。如果依赖图需要只有本机才能解析的包（例如来自显式源的包，或元数据只能通过构建其源码分发包获得的包），pnpm 也会在本地解析。其他服务器错误会中止安装。

配置了多个索引、覆盖、约束或显式目标环境的 Python 依赖图会在本地解析。pnpr 无法表达这些解析设置。

## 设置

### python.enabled

- 默认值：**false**
- 类型：**布尔值**

`pnpm install` 是否解析并安装项目的 Python 依赖。

### python.executable

- 默认值：**按项目自动选择**
- 类型：**字符串**

指定所有项目共用的解释器。省略时，pnpm 会选择满足每个项目 `requires-python` 的解释器，存在 `.python-version` 时优先使用它。若没有合适的解释器，pnpm 会下载一个共享的 [python-build-standalone](https://github.com/astral-sh/python-build-standalone) 解释器。[`runtimeOnFail`](/docs/settings/cli#runtimeonfail) 决定这一行为：默认值和 `download` 允许下载，`error` 会失败，而 `warn` 或 `ignore` 会在版本不匹配的情况下继续使用可用解释器。离线安装无法下载解释器。可用 [`tools.python.mirror`](/docs/settings/cli#tools) 配置其下载源。

### Python 索引

自 v12.5.0 起，通过带 `ecosystem: pypi` 的 [`registries`](/docs/registries#ecosystem) 声明索引。不做声明时，pnpm 使用 `https://pypi.org/simple/`。`python.indexUrl` 和 `python.extraIndexUrls` 设置已在 v12.5.0 中移除，请改用 `registries`。

自 v12.5.1 起，可通过 [`packages`](/docs/registries#packages) 把包名分配给各个索引。pnpm 会在请求某个包之前选定唯一的权威索引，因此声明顺序没有影响。

```yaml
python:
  enabled: true
registries:
  https://packages.example.org/simple/:
    ecosystem: pypi
    packages: ["company-*", "legacy-internal-package"]
  https://download.pytorch.org/whl/cpu/:
    ecosystem: pypi
    packages: ["torch"]
  https://pypi.org/simple/:
    ecosystem: pypi
    packages: ["*"]
```

`packages` 模式、冲突和默认索引的规则见 [`packages`](/docs/registries#packages)。索引必须支持 Simple JSON API；仅支持 HTML 的索引不受支持。缺失的页面会被缓存以便离线解析。更改路由会使 Python 锁文件失效，此时 `--frozen-lockfile` 安装会以 `the Python index changed` 失败。

请在 [`.npmrc`](/docs/npmrc) 中按来源配置凭据，而不是把凭据写进 `registries` 的 URL。带认证的索引缓存会使用凭据指纹；原始凭据绝不会出现在缓存键中。

### python.overrides

自 v12.5.0 起提供

- 默认值：**[]**
- 类型：**字符串[]**

在整个 Python 依赖图中替换匹配依赖版本要求的 [PEP 508 registry 要求](https://packaging.python.org/en/latest/specifications/dependency-specifiers/)。环境标记决定覆盖生效的位置。生效的覆盖会用它所请求的 extras 替换原有的 extras。

覆盖不会添加依赖图中本来就需要的依赖。URL 要求不能用作覆盖。版本规则会保留已为某依赖声明的 Git 源或直接 wheel 源。

### python.constraints

自 v12.5.0 起提供

- 默认值：**[]**
- 类型：**字符串[]**

用于收窄匹配 Python 依赖可用版本的 PEP 508 registry 要求。约束不会添加依赖，也不会替换它们的版本要求。环境标记决定约束生效的位置，URL 要求不能用作约束。

覆盖和约束可以一起使用：

```yaml
python:
  enabled: true
  overrides: ['urllib3>=2']
  constraints: ['urllib3<3']
```

pnpm 还会读取 `pyproject.toml` 中 `[tool.uv]` 的 `override-dependencies` 和 `constraint-dependencies`。在已声明的 uv 工作区中，这些列表来自工作区根清单；否则来自各项目自己的清单。它们会与 pnpm 工作区设置合并。

这些规则适用于项目依赖，不适用于隔离的构建后端依赖。更改索引列表、覆盖或约束会使 `pylock.toml` 失效，`--frozen-lockfile` 会拒绝这些改动。

### 导入 wheel 文件

Python 使用 [packageImportMethod](/docs/settings/node-modules#packageimportmethod) 把未改动的 wheel 文件导入项目环境。它使用与 npm 包相同的方法和 `auto` 默认值。

用 `clone-or-copy` 表示写时复制克隆并回退到复制，用 `copy` 表示完全独立的文件。`clone` 需要文件系统支持克隆。

:::warning[警告]

硬链接的 wheel 文件会与存储以及其他硬链接环境共享写入。`auto` 方法可能选择硬链接。如果安装的文件可能被修改，请使用 `clone-or-copy` 或 `copy`。

:::

隔离的构建环境同样使用 `packageImportMethod`，但会把 `auto` 和 `hardlink` 替换为 `clone-or-copy`，以保证构建后端的写入保持私有。

生成的元数据、入口点脚本，以及 shebang 或权限需要改动的 wheel 脚本，在所有模式下都保持私有。

```yaml
packageImportMethod: clone-or-copy
python:
  enabled: true
```

### python.extras

- 默认值：**[]**
- 类型：**字符串[]**

每个项目中默认安装的 [extras](https://packaging.python.org/en/latest/specifications/dependency-specifiers/#extras)。项目未定义的名称会被跳过。项目 `pyproject.toml` 中的 `[tool.pnpm.python].extras` 会覆盖该列表。

### python.groups

- 默认值：**['dev']**
- 类型：**字符串[]**

每个项目中默认安装的[依赖组](https://peps.python.org/pep-0735/)。项目未定义的名称会被跳过。项目 `pyproject.toml` 中的 `[tool.pnpm.python].groups` 会覆盖该列表。

### python.versions

自 v12.5.0 起提供

- 默认值：**[]**
- 类型：**字符串[]**

要锁定的 Python 次版本或完整版本号，例如 `3.12` 或 `3.12.7`。空列表表示使用所选解释器的版本。参见[为多个环境锁定](#locking-for-multiple-environments)。
