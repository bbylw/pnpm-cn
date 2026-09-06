# pnpm 中文翻译术语表与规则（翻译子代理必读）

## 总风格

- 简体中文技术书面语，称「你」，不用「您」「请」。
- 简洁直白，不加文言腔、不加营销感叹。句末一般不加句号的是列表项与标题。
- 避免破折号连用，用逗号、冒号或拆句。
- 半角/全角标点：正文用中文标点；行内代码、命令、路径、URL 原样保留半角。
- 数字与单位之间不加空格（3GB 写成 3 GB 跟随原文风格即可，量词用中文：约 2 倍）。

## 必须原样保留（不翻译、不改动写法）

- 一切 `` `反引号` `` 内容：命令、参数、路径、文件名、配置项名、协议名（如 `workspace:`）、目录名（`node_modules`、`.pnpm`、`_tmp`）。
- 一切 `[文字](链接)` 的链接部分；`![alt](src)` 的图片语法。方括号内的链接文字若是产品/命令名保留英文，若是描述性短语可译（如「查看安装说明」）。
- HTML 标签如 `<br>`；`:::` 指令块语法；frontmatter YAML。
- 包名/产品名：pnpm、npm、yarn、Node.js、TypeScript、Bun、Deno、lockfile 名（`pnpm-lock.yaml`）、CLI 标志（`--recursive`）、环境变量（`NODE_ENV`）、registry 域名。
- 版本引用：`v11.1.0`、`12.x`。

## 固定译法

| 英文 | 中文 |
|---|---|
| content-addressable store (CAS) | 内容寻址存储 |
| store (pnpm store) | 存储（首次出现「全局存储」，后可简称存储；命令 `pnpm store` 不译） |
| hard link / symlink / reflink | 硬链接 / 符号链接 / 引用链接（reflink） |
| copy-on-write | 写时复制 |
| node_modules | 保留原文 |
| non-flat / flat node_modules | 非扁平 / 扁平的 node_modules |
| hoisting | 提升（依赖提升） |
| phantom dependencies | 幽灵依赖 |
| lockfile | 锁文件 |
| workspace | 工作区 |
| monorepo / polyrepo | monorepo（单体仓库）首次括注，后用 monorepo |
| peer dependency | 对等依赖（peer 依赖），`peerDependencies` 不译 |
| dependency / devDependency / optionalDependencies | 依赖 / 开发依赖 / 可选依赖 |
| lifecycle scripts / pre/post scripts | 生命周期脚本 / 前后脚本 |
| run scripts | 运行脚本 |
| registry | 源（注册源/软件源语境统一「registry」保留英文亦可，正文优先「registry」） |
| tarball | tarball（保留） |
| publish / unpublish / deprecate | 发布 / 取消发布 / 标记废弃 |
| dist-tag | dist-tag（保留） |
| patch / patching | 补丁 / 打补丁 |
| resolve / resolution / resolver | 解析 / 解析结果 / 解析器 |
| fetch / install / link | 拉取 / 安装 / 链接 |
| cache | 缓存 |
| dedupe | 去重 |
| audit | 审计 |
| provenance | 来源证明（provenance 首次括注） |
| supply chain security | 供应链安全 |
| side effects | 副作用 |
| allow-listed / blocked / approved | 已放行 / 已屏蔽 / 已批准（构建脚本语境） |
| build script | 构建脚本 |
| shim | shim（保留） |
| filter / filtering | 过滤 |
| recursive | 递归（`--recursive` 不译） |
| global package | 全局包 |
| virtual store | 虚拟存储（`.pnpm` 目录称「虚拟 store」亦可，统一「虚拟存储」） |
| package extension | 包扩展（pnpm.packageExtensions） |
| overrides | 覆盖（依赖覆盖） |
| catalogs | 目录（catalog 机制首现写「目录（catalogs）」，后用 catalog） |
| alias | 别名 |
| engine / engines | 引擎 |
| version manager | 版本管理器 |
| release channel | 发布通道 |
| rollback | 回滚 |
| migration | 迁移 |
| error codes | 错误码 |
| flaky | 不稳定（复现） |
| deterministic | 确定性 |
| atomic | 原子性 |

## CLI 文档高频套语

- `Added in: vX` → 自 vX 起提供；`Moved in:` → 自 vX 起变更；`Deprecated in:` → 自 vX 起废弃。
- `Usage:` → 用法；`Options` → 选项；`Examples` → 示例；`See also` → 另见；`Subcommands` → 子命令；`Default:` → 默认值；`Type:` → 类型。
- 选项说明里 `A boolean` → 布尔值；`A number` → 数字；`A string` → 字符串；`Path` → 路径。
- 「Run this command in the root of your project」→ 在项目根目录运行此命令。
- 命令示例如 "pnpm add <dep>" 中尖括号占位符保留英文（`<dep>` 在行内代码里不动）。

## 标题类（k=heading / title）

- 短语化、首字不大写问题不存在，不加句末标点。
- 常见：Motivation → 为什么选择 pnpm；Feature Comparison → 功能对比；Installation → 安装；FAQ → 常见问题；Configuration → 配置；Settings → 设置；Usage → 用法；Errors → 错误码；Recipes → 实用配方；Advanced → 进阶；Workspaces → 工作区；Scripts → 脚本；Filtering → 过滤；Completion → 自动补全；Aliases → 别名；Registries → registry（多源）；Logos → 标志素材；Limitations → 局限性；Migration → 迁移；Uninstall → 卸载；Versioning → 版本策略；Changelog 不译。
- `Creating a non-flat node_modules directory` → 创建非扁平的 node_modules 目录；`Saving disk space` → 节省磁盘空间；`Boosting installation speed` → 加快安装速度。

## 输出契约

- 输入：JSONL 行 `{"p":页,"b":"块id","k":"类型","t":"原文"}`。
- 输出：JSONL 行 `{"b":"块id","z":"译文"}`，一行一块，`b` 原样回写。
- 只译 t 中的英文散文；整条无英文散文（纯命令/纯符号）则 `"z"` 与原文完全相同。
