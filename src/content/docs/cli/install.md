---
title: "pnpm install"
headingIds: ["tldr","options-for-filtering-dependencies","--prod--p","--dev--d","--no-optional","--no-runtime","options","--force","--offline","--prefer-offline","--no-lockfile","--lockfile-only","--dry-run","--fix-lockfile","--update-checksums","--frozen-lockfile","--merge-git-branch-lockfiles","--reportername","--shamefully-hoist","--ignore-scripts","--filter-package_selector","--cpuname","--osname","--libcname"]
---

别名： `i`

`pnpm install` 用于安装项目的所有依赖。

在 CI 环境中，如果存在锁文件但需要更新，安装会失败。

在[工作区](/docs/workspaces)中，`pnpm install` 会安装所有项目的所有依赖。如果想禁用此行为，将 `recursive-install` 设置设为 `false`。

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

### --no-runtime

自 v11.1.0 起提供

跳过安装运行时条目（例如通过 [devEngines.runtime](/docs/package_json#devenginesruntime) 下载的 Node.js）。锁文件保持不变，因此冻结安装仍会进行校验；仅跳过运行时的拉取和 bin 链接。

这适用于运行时在 `pnpm install` 运行前已由外部预先配置的 CI 矩阵（例如通过 `pnpm runtime -g set node <version>`）。

也可以通过 `pnpm-workspace.yaml` 中的 `runtime=false` 配置设置。

## 选项

### --force

强制重新安装依赖：重新拉取存储中被修改的包，重建由不兼容版本的 pnpm 创建的锁文件和/或 modules 目录。即使不满足当前环境（cpu、os、arch），也会安装所有 optionalDependencies。

### --offline

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，pnpm 只使用存储中已有的包。如果本地找不到某个包，安装将失败。

### --prefer-offline

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，将跳过缓存数据的过期检查，但缺失的数据仍会向服务器请求。要强制完全离线模式，使用 `--offline`。

### --no-lockfile

不读取也不生成 `pnpm-lock.yaml` 文件。

### --lockfile-only

- 默认值：**false**
- 类型：**布尔值**

使用时，仅更新 `pnpm-lock.yaml` 和 `package.json`，不会向 `node_modules` 目录写入任何内容。

### --dry-run

自 v11.8.0 起提供

执行完整的依赖解析并报告真实安装会带来哪些变更，但不向磁盘写入任何内容。锁文件、清单或 `node_modules` 的变更均不会被保存。

完成的试运行即使报告真实安装会更新锁文件，也以退出码 0 结束。

`--dry-run` 不能与已配置的 pnpr 服务器一起使用，因为那条安装路径通过服务器进行解析和链接。

### --fix-lockfile

自动修复损坏的锁文件条目。

### --update-checksums

自 v11.4.0 起提供

当下载的 tarball 的哈希与 `pnpm-lock.yaml` 中记录的完整性值不匹配时，按 registry 当前提供的内容刷新锁定的 tarball 完整性值。

自 v11.4.0 起，默认情况下完整性不匹配会导致硬性失败：`pnpm install` 以 `ERR_PNPM_TARBALL_INTEGRITY` 退出，而不是静默地从 registry 重新解析并覆盖锁定的完整性值。这保护了提交锁文件的项目：在干净的机器上，被攻破的 registry、代理或重新发布的版本无法用攻击者控制的内容进行替换。

`--update-checksums` 是针对合法场景（例如 registry 重写了它的 tarball，且你已验证新内容正确）的小范围显式启用选项。绕过生效时仍会打印警告，使该操作可被审计。

`--force` 和 `pnpm update` 有意**不**绕过完整性检查。`--frozen-lockfile` 保持不变，`--fix-lockfile` 保留其文档所述用途（补全缺失的锁文件条目），同样不是绕过手段。

### --frozen-lockfile

- 默认值：
  - 非 CI 时：**false**
  - CI 时：**true**（若存在锁文件）
- 类型：**布尔值**

为 `true` 时，pnpm 不会生成锁文件，并且在锁文件与清单不同步、需要更新或不存在锁文件时安装失败。

在 [CI 环境](https://github.com/watson/ci-info#supported-ci-tools)中此设置默认为 `true`。检测 CI 环境使用以下代码：

https://github.com/watson/ci-info/blob/44e98cebcdf4403f162195fbcf90b1f69fc6e047/index.js#L54-L61

```js
exports.isCI = !!(
  env.CI || // Travis CI, CircleCI, Cirrus CI, GitLab CI, Appveyor, CodeShip, dsari
  env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
  env.BUILD_NUMBER || // Jenkins, TeamCity
  env.RUN_ID || // TaskCluster, dsari
  exports.name ||
  false
)
```

### --merge-git-branch-lockfiles

合并所有 git 分支锁文件。[阅读更多关于 git 分支锁文件的说明。](/docs/git_branch_lockfiles)

### --reporter=<name>

- 默认值：
  - TTY 标准输出时：**default**
  - 非 TTY 标准输出时：**append-only**
- 类型：**default**、**append-only**、**ndjson**、**silent**

允许你选择将在终端记录安装进度调试信息的 reporter。

- **silent**：不向控制台记录任何输出，即使是致命错误
- **default**：标准输出为 TTY 时的默认 reporter
- **append-only**：输出始终追加到末尾，不进行光标操作
- **ndjson**：最详细的 reporter，以 [ndjson](https://github.com/ndjson/ndjson-spec) 格式打印所有日志

如果想更改打印的信息类型，使用 [loglevel](/docs/settings/cli#loglevel) 设置。

### --shamefully-hoist

- 默认值：**false**
- 类型：**布尔值**

创建扁平的 `node_modules` 结构，类似于 `npm` 或 `yarn`。**警告**：强烈不建议这样做。

### --ignore-scripts

- 默认值：**false**
- 类型：**布尔值**

不执行项目 `package.json` 及其依赖中定义的任何脚本。

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
