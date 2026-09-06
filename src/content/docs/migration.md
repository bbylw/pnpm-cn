---
title: "从 v10 迁移"
headingIds: ["run-the-codemod","manual-follow-ups"]
---

pnpm v11 对读取配置的方式以及可用的设置引入了一些破坏性变更，pnpm v12 保留了这些变更。多数配置变更是机械性的，可以由 codemod 完成；剩余部分需要人工关注。从 pnpm v10 迁移到任一更新的主版本时应用这些变更。

## 运行 codemod

```bash
cd /path/to/your/project
pnpx codemod run pnpm-v10-to-v11
# or
pnpm add --global codemod
codemod run pnpm-v10-to-v11
```

codemod 会自动完成以下内容：

- **把设置从 package.json#pnpm 移入 pnpm-workspace.yaml**。在 v11 中，pnpm 不再从 `package.json` 的 `pnpm` 字段读取配置。
- **把 .npmrc 拆分为 auth/registry 与其他所有项**。v11 只从 `.npmrc` 读取 auth 和 registry 设置。其他每个设置（`hoist-pattern`、`node-linker`、`save-exact` 等）都用 camelCase 键移入 `pnpm-workspace.yaml`。按子项目的 `.npmrc` 文件归入 `packageConfigs["<project-name>"]` 之下。
- **把构建依赖相关的设置整合进 allowBuilds**。`onlyBuiltDependencies`、`neverBuiltDependencies`、`ignoredBuiltDependencies` 和 `onlyBuiltDependenciesFile` 会合并为一个单一的 `allowBuilds` 映射（`{ name: true | false }`）。
- **用 pmOnFail 取代包管理器严格性设置**。`managePackageManagerVersions`、`packageManagerStrict` 和 `packageManagerStrictVersion` 被收拢为一个 `pmOnFail: download | ignore | warn | error` 设置。
- **重命名** `allowNonAppliedPatches` → `allowUnusedPatches`，以及 `auditConfig.ignoreCves` → `auditConfig.ignoreGhsas`（键被重命名；CVE ID 仍需手动转换为 GHSA ID，见下文）。
- **将 useNodeVersion 转换**为根 `package.json` 上的一条 `devEngines.runtime` 条目。
- **提升 `package.json` 中的 packageManager** 到目标 pnpm 版本。

## 手动后续处理

以下变更无法自动化，需要人工关注：

- **CVE → GHSA**。`auditConfig.ignoreCves` 被重命名为 `auditConfig.ignoreGhsas`。将每个 `CVE-YYYY-NNNNN` 条目替换为对应的 `GHSA-xxxx-xxxx-xxxx` ID（可在 `pnpm audit` 输出的「More info」列中看到）。
- **ignorePatchFailures** 已被移除。失败的补丁现在总是抛出错误；请修复补丁或移除该依赖。
- **工作区子包 `package.json#pnpm` 中的 executionEnv.nodeVersion** 已被移除。改为在该子包的 `devEngines.runtime` 中声明运行时。
- **npm_config_* 环境变量**不再被读取。在它们被设置的地方（CI 配置、shell 配置文件、Docker 镜像）将其重命名为 `pnpm_config_*`。
- **pnpm link <pkg-name>** 不再从全局存储解析包。请使用相对或绝对路径（`pnpm link ./foo`）。
- **pnpm install -g**（不带参数）不再受支持。改用 `pnpm add -g <pkg>`。
- **pnpm server** 已被移除，无替代方案。
- **脚本名称会遮蔽内置命令**。如果你的 `package.json` 定义了一个名为 `clean`、`setup`、`deploy` 或 `rebuild` 的脚本，`pnpm <name>` 现在会运行该脚本而不是内置命令。使用 [pnpm pm <name>](/docs/cli/pm) 可强制使用内置命令。

破坏性变更的完整列表，见 [v11 更新日志](https://github.com/pnpm/pnpm/blob/main/pnpm/CHANGELOG.md)。
