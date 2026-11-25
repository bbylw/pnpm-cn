---
title: "把设置拆分到多个文件"
headingIds: ["sources","relative-paths","delegation-and-ownership","catalogs","writes","settings-from-config-dependencies","bootconfig","protecting-the-configuration","editor-support"]
---

自 v12.15.0 起提供

`pnpm-workspace.yaml` 可以把设置委托给其他文件以及[配置依赖](/docs/config-dependencies)。每个被委托的设置恰好有一个归属者，根清单会说明该设置的来源：

```yaml
configDependencies:
  '@acme/pnpm-policy': 3.1.0
pnpmfile: []
include:
  ./config/security.yaml: '*'
  ./config/catalog.yaml: [catalog]
  ./config/workspace.yaml: [packages]
  '@acme/pnpm-policy': [minimumReleaseAge, trustPolicy]
```

这样，团队可以保护 `pnpm-workspace.yaml` 以及保存安全设置的文件，而目录更新之类的日常改动则放到任何人都可以编辑的文件中。按路径限制写入的工具——例如 `CODEOWNERS`、只读挂载或 Agent 沙箱——就能据此约束谁可以改什么。

## 来源

`include` 是一个从来源到它可以定义的设置的映射。只有根 `pnpm-workspace.yaml` 才能定义 `include`。

* **本地文件**以 `./` 或 `../` 开头，相对于工作区根目录解析。它必须是 `.yaml` 或 `.yml` 文件。不接受 glob、目录、URL 和绝对路径。每个被包含的文件都必须存在，即使它是空的。`include` 没有提到的文件永远不会被读取。
* **配置依赖**的名称必须与 `configDependencies` 中的声明完全一致。它总需要一个设置列表。参见[来自配置依赖的设置](#settings-from-config-dependencies)。

被包含的文件不能定义 `include`。

违反这些规则的来源会以 `ERR_PNPM_INVALID_WORKSPACE_INCLUDE` 失败。这包括路径有误或缺失、把 `'*'` 委托给配置依赖、配置依赖未出现在 `configDependencies` 中，以及被包含文件里出现 `include`。

### 相对路径

被包含文件中的相对路径相对于该文件，就像 `pnpm-workspace.yaml` 中的相对路径相对于工作区根目录一样。这涵盖了保存路径的设置，例如 `patchedDependencies`、`patchesDir`、`pnpmfile`、`packages`、`storeDir`，以及包含斜杠的 `scriptShell`。它也涵盖目录和 `overrides` 中的 `file:`、`link:` 和 `./` 路径，以及 `overrides` 中的 `workspace:` 路径。绝对路径，以及以 `~` 或环境变量开头的路径，会按原样保留。

因此，补丁清单可以放在它所引用的补丁旁边：

```yaml
include:
  ./patches/patches.yaml: [patchedDependencies]
```

```yaml
patchedDependencies:
  express@4.21.2: express@4.21.2.patch
```

`pnpm patch-commit` 会把补丁写入 `patchesDir`，并相对于该文件把条目加入 `patches/patches.yaml`。pnpm 也会相对于拥有它们的文件写入目录条目和指向本地路径的 `overrides`。

即使该路径是符号链接，路径仍相对于 `pnpm-workspace.yaml` 中所写的 include 路径。

## 委托与归属

一个来源要么被委托一个设置列表，要么被委托 `'*'`。

列表既许可又保留其设置。该文件只能定义列出的设置，其他来源也不能定义它们，即使该文件省略了它们：

```yaml
include:
  ./config/catalog.yaml: [catalog]
  ./config/deploy.yaml: [nodeLinker, injectWorkspacePackages]
```

这里 `catalog.yaml` 只能定义默认目录。在其中定义 `minimumReleaseAge` 会以 `ERR_PNPM_SETTING_NOT_DELEGATED` 失败。即使 `deploy.yaml` 是空的，它也拥有 `nodeLinker`，因此 `pnpm-workspace.yaml` 同样不能定义 `nodeLinker`。

被委托 `'*'` 的本地文件可以定义任何没有其他来源拥有的设置，并拥有它自己定义的设置。只应为与 `pnpm-workspace.yaml` 受到同等保护的文件使用 `'*'`。

在 `pnpm-workspace.yaml` 中定义的设置归它所有。当两个来源声称拥有同一设置时，pnpm 会以 `ERR_PNPM_DUPLICATE_SETTING` 失败。`include` 的顺序从不在二者之间做决定。同一设置的不同写法，例如 `virtualStoreType` 和 `enableGlobalVirtualStore`，共享同一个归属者。

被委托但其归属者省略的设置，不会由项目设置。全局的 `config.yaml`、环境变量和内置默认值仍然生效。

### 目录

每个目录只有一个归属者。它的条目绝不跨来源拆分。

* `catalog`（或 `catalogs.default`）委托默认目录。
* `catalogs.<名称>` 委托一个具名目录。
* `catalogs` 委托所有目录，包括之后新增的目录。

```yaml
include:
  ./config/catalog.yaml: [catalog]
  ./config/legacy.yaml: [catalogs.react18]
```

## 写入

会改动设置的命令，例如带目录的 `pnpm add`、`pnpm approve-builds`、`pnpm patch-commit`、`pnpm audit --fix` 和 `pnpm config set --location project`，会把每个设置写入拥有它的来源：

* 被委托的设置会写入它的文件，即使该文件省略了它。
* 由 `'*'` 文件定义的设置会留在那个文件中。
* 没有来源拥有的设置会被加入 `pnpm-workspace.yaml`。
* 由配置依赖拥有的设置无法更改。pnpm 会以 `ERR_PNPM_SETTING_OWNED_BY_CONFIG_DEPENDENCY` 失败。

pnpm 永不修改 `include`、在文件之间迁移设置，也不会删除被包含的文件。

## 来自配置依赖的设置

配置依赖在其 `package.json` 的 `pnpm.config` 字段中声明一个包含其设置的 YAML 文件：

```json
{
  "name": "@acme/pnpm-policy",
  "version": "3.1.0",
  "pnpm": {
    "config": "./config.yaml"
  }
}
```

```yaml
minimumReleaseAge: 1440
trustPolicy: no-downgrade
```

该文件必须留在包内。`pnpm.config` 缺失或无法读取会以 `ERR_PNPM_INVALID_CONFIG_DEPENDENCY_ENTRY` 失败。该包只能定义 `include` 委托给它的设置，因此新版本无法接管其他设置。有些设置不能委托给配置依赖，包括 `configDependencies`、`pnpmfile`、`globalPnpmfile`、`bootConfig`、`packages`、`scriptShell`，以及保存路径的设置，例如 `patchedDependencies`、`storeDir` 和 `lockfileDir`。`include` 不能被委托给任何来源。

当被包含的配置依赖的设置无法加载时，安装配置依赖的命令会失败。首次安装之前，`pnpm config get` 和 `pnpm config list` 仍可使用，并会警告由尚未安装的配置依赖拥有的设置缺失。

来自配置依赖的设置是声明式的。加载它们不会执行任何代码。名称符合[插件命名](/docs/config-dependencies)模式的配置依赖仍会加载其 pnpmfile。

### `bootConfig`

配置依赖和来自 `packageManager` 的 pnpm 版本会在配置依赖的设置被加载之前解析。因此配置依赖的策略绝不会支配配置依赖的安装。`bootConfig` 为该阶段设定策略：

```yaml
configDependencies:
  '@acme/pnpm-policy': 3.1.1
bootConfig:
  minimumReleaseAge: 0
include:
  '@acme/pnpm-policy': [minimumReleaseAge, trustPolicy]
```

`bootConfig` 接受 `minimumReleaseAge`、`minimumReleaseAgeExclude`、`minimumReleaseAgeStrict`、`minimumReleaseAgeIgnoreMissingTime`、`trustPolicy`、`trustPolicyExclude` 和 `trustPolicyIgnoreAfter`。对于它未设置或设置为 `null` 的每个设置，启动阶段会使用该设置的常规值。对于由配置依赖拥有的设置，该值取自全局 `config.yaml`、环境或内置默认值。

## 保护配置

pnpm 会检查归属，但无法判断是谁编辑了某个文件。请用 `CODEOWNERS`、文件权限或沙箱保护这些路径：

* `pnpm-workspace.yaml`，它决定加载什么以及每个设置归谁所有。
* 每个被委托 `'*'` 的文件。
* 被加载的 pnpmfile。当工作区没有 pnpmfile 时，请在 `pnpm-workspace.yaml` 中设置 `pnpmfile: []`，这样新的 `.pnpmfile.mjs` 就不会被自动拾取。

```text
/pnpm-workspace.yaml      @acme/infra
/config/security.yaml     @acme/security
/config/catalog.yaml      @acme/developers
```

`updateConfig` 钩子在设置合并之后运行，仍可以修改其中任何一个。

## 编辑器支持

为 `pnpm-workspace.yaml` 显示悬停说明和补全的编辑器，会按文件名通过 [schemastore.org](https://www.schemastore.org) 找到它的 JSON Schema。`include` 所命名的文件使用其他文件名，因此编辑器不会自行找到它们的 schema。请在被包含文件顶部加上这行注释。它会告知 YAML 语言服务器（VS Code 和 Cursor 的 YAML 扩展使用它）把同一个 schema 与该文件关联起来：

```yaml
# yaml-language-server: $schema=https://json.schemastore.org/pnpm-workspace.json
catalog:
  react: ^19.1.0
```

pnpm 会忽略注释，因此这一行对 pnpm 没有任何影响。
