---
title: "使用多个 registry"
headingIds: ["routing-packages-to-a-registry","scopes","prefix","describing-the-server","servertype","supportstimefield","where-the-setting-may-live","the-older-shapes"]
---

自 v11.23.0 起提供

`pnpm-workspace.yaml` 中的 [registries](/docs/settings/dependency-resolution#registries) 设置声明项目安装所依赖的每个 registry，每条以该 registry 的 URL 为键。pnpm 关于某个 registry 的全部信息都存放在其条目中：路由到它的 scope、它所响应的裸说明符前缀，以及其后端服务器的情况。

pnpm-workspace.yaml

```yaml
registries:
  https://npm.corp.example.com/:
    serverType: artifactory
    scopes: ["@acme", "@corp-tools"]
    prefix: work
  https://verdaccio.corp.example.com/:
    scopes: ["@"]
    supportsTimeField: true
```

以 URL 为键，是因为条目中的每条事实都是关于该服务器的事实。如果 tarball 布局改以 scope 为键，它就会绑定到 scope 当前指向的对象，而两个 scope 解析结果不同的开发者写出的锁文件，会对哪些 URL 可以省略产生分歧。

条目可以包含：

| **Field** | **Type** | **声明内容** |
| --- | --- | --- |
| [scopes](#scopes) | `string[]` | 路由到该 registry 的包 scope。 |
| [prefix](#prefix) | `string` | 该 registry 响应的裸说明符前缀。 |
| [serverType](#servertype) | `string` | 服务器如何排布 tarball URL：`npm` 或 `artifactory`。 |
| [supportsTimeField](#supportstimefield) | `boolean` | 服务器的简化元数据是否携带 `time` 字段。 |

其他任何字段都会被拒绝。具体来说，凭据（`_authToken`、`_auth`、`_password`、`username`、`tokenHelper`）和 TLS 材料（`ca`、`cafile`、`cert`、`certfile`、`key`、`keyfile`）会被直接拒绝而不是静默忽略。`pnpm-workspace.yaml` 会提交到仓库，因此这些内容应放在 [.npmrc](/docs/npmrc) 中（例如 `//npm.corp.example.com/:_authToken=...`）。内嵌 `user:pass@` 凭据的 URL 键出于同样的原因也会被拒绝。

## 将包路由到某个 registry

### scopes

包从该 registry 解析的 scope，需带 `@` 前缀。单独的 `"@"` 会路由到无 scope 的默认 registry，即 `registry` 设置所指定的同一个 registry：

pnpm-workspace.yaml

```yaml
registries:
  https://npm.corp.example.com/:
    scopes: ["@acme"]
  https://registry.internal.example.com/:
    scopes: ["@"]
```

一个 scope 只解析到一个 registry，因此在两个条目中路由同一个 scope 是错误的。

### prefix

该 registry 响应的[具名 registry](/docs/package-sources#named-registries)前缀，如 `"lib": "work:^2.0.0"`：

pnpm-workspace.yaml

```yaml
registries:
  https://npm.work.example.com/:
    prefix: work
```

```bash
pnpm add work:@corp/lib@^2.0.0
```

每个条目最多声明一个前缀，且两个条目不能声明同一个前缀：前缀是 registry 在锁文件包键中的标识（`foo@work:1.0.0`），因此再写一种拼法会让同一个 registry 的同一个包出现两个键。

此处声明的前缀遵循与其所取代的已废弃 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 设置相同的规则：可以通过在自己的 URL 上声明前缀来覆盖内置的 `gh:` 和 `npmjs:` 别名，[保留名称](/docs/settings/dependency-resolution#reserved-alias-names)会被拒绝，通过前缀解析的包会获得[带 registry 限定的锁文件键](/docs/settings/dependency-resolution#named-registries-in-the-lockfile)。

## 描述服务器

### serverType

并非所有 registry 都按 npm registry 的方式排布 tarball URL。当 pnpm 能从包名、版本和 registry 重建 URL 时，就会从 `pnpm-lock.yaml` 中省略该 tarball URL。这样锁文件就不会为该包保留特定于主机的 URL，重命名或迁移 registry 也不会导致锁文件频繁变动。pnpm 能否重建 URL 取决于服务器，`serverType` 就是你声明它的地方，它有三种取值：

| **`serverType`** | **Meaning** |
| --- | --- |
| *undeclared* | 严格：只有当 tarball URL 恰好是标准 npm 布局的 URL（`<registry>/<name>/-/<scopeless-name>-<version>.tgz`）时才会被省略。除 `registry.npmjs.org` 外，所有 registry 默认都按此方式读取。 |
| `npm` | 服务器行为类似 `registry.npmjs.org`：它既从百分号编码路径（`/@acme%2Fwidget/...`）提供带 scope 的包，也从未编码路径提供。公共 registry 的忠实镜像或缓存代理即属此类，`registry.npmjs.org` 自身内置该类型。 |
| `artifactory` | 服务器会在带 scope 的包的 tarball 文件名中重复该 scope：`@acme/widget/-/@acme/widget-1.0.0.tgz`；而 npm 布局会去掉 scope（`@acme/widget/-/widget-1.0.0.tgz`）。 |

对于 JFrog Artifactory registry，这决定了锁文件是为**每个带 scope 的包**记录特定于主机的 tarball URL，还是一个都不记录：

pnpm-workspace.yaml

```yaml
registries:
  https://acme.jfrog.example.com/artifactory/api/npm/npm-virtual/:
    serverType: artifactory
    scopes: ["@acme"]
```

常见服务器的取值：

| **Server** | **`serverType`** |
| --- | --- |
| JFrog Artifactory | `artifactory` |
| GitLab package registry | `artifactory`——使用相同布局，在文件名中重复 scope。 |
| npm registry 的忠实镜像或缓存代理 | `npm` |
| Verdaccio, Sonatype Nexus, Azure Artifacts | 无需声明——它们提供的就是标准 npm 布局，严格的默认值已经能重建该布局。 |
| GitHub Packages | 无需声明——其下载 URL 含有无法从包身份推导出的内容摘要，因此这些 URL 会保留在锁文件中。 |
| GitHub Enterprise Server | 无需声明——它只从百分号编码路径提供带 scope 的包，严格的默认值会把这些 URL 保留在锁文件中并按原样请求。 |

布局需要声明，不会被推断：虚拟仓库可以同时提供两种布局，取决于每个包是从上游同步而来还是在本地发布，因此不存在 pnpm 可以探测的 registry 级信号。声明它还能让错误的取值成为一个可修复的错误配置，而不是悄无声息的故障。

:::caution[注意]

`serverType` 是一项只有服务器运营方才能做出的声明，且锁文件依赖它：被省略的 tarball URL 会在每次安装时用声明的布局重建，包括 `--frozen-lockfile` 安装。应当声明服务器实际提供的布局，并预期声明后会出现一次性的锁文件 diff：pnpm 现在能够重建的 URL 会在下一次写入锁文件的安装中从锁文件里消失。

:::

### supportsTimeField

该 registry 的简化元数据是否携带 `time` 字段。`registry.npmjs.org` 不携带，这就是默认值为 `false` 的原因，也是 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage) 等基于时间的解析特性会退回使用大得多的完整元数据文档的原因。对于确实携带 `time` 字段的 registry（如 Verdaccio v5.15.1+ 和若干代理），值得进行声明：

pnpm-workspace.yaml

```yaml
registries:
  https://verdaccio.corp.example.com/:
    scopes: ["@"]
    supportsTimeField: true
```

这是 [registrySupportsTimeField](/docs/settings/other#registrysupportstimefield) 设置的按 registry 形式。回退行为按 registry 分别决定：某个 registry 需要完整元数据，不再牵连其他 registry；而对于项目未描述的 registry，仍以 `registrySupportsTimeField` 为准。

## 设置可以存放的位置

该设置应放在 `pnpm-workspace.yaml` 中，而不是 `.npmrc` 或全局配置中，因为锁文件依赖它：如果某个开发者省略的 tarball URL 与另一个开发者重建出的结果不同，frozen 安装就会失败。

[全局配置文件](/docs/cli/config)（`config.yaml`）可以声明*路由*，即 `scopes` 和 `prefix`，从而使 `work:` 这类 scope 或别名作用于机器上的所有项目。出于上述原因，服务器描述（`serverType` 和 `supportsTimeField`）只从 `pnpm-workspace.yaml` 读取。

自 v12.1.0 起，[pnpm login --scope <scope>](/docs/cli/login#--scope-scope) 在把凭据记录到 `_auth` 下的同时，会把该机器级的 scope 路由添加到全局 `registries` 设置中。之后对同一 scope 再次登录会移动该路由，而不是在两个 registry 中重复声明。

未声明任何路由的条目，描述的是在其他位置配置的 registry，例如 `.npmrc` 中设置的默认 registry。此类条目只有在其 URL 确实是项目实际从中解析的 registry 时才生效；pnpm 会对不匹配任何已配置 registry 的条目发出警告，否则它们会处于无效状态（过期的 URL、迁移过的 scope）。

该设置的 URL 键中**不会**展开环境变量，原因与其他 [pnpm-workspace.yaml 中的 registry URL](/docs/settings)不展开环境变量相同：该文件会被提交，若把环境变量展开到请求目标地址，可能将机密泄露给攻击者控制的主机。包含 `${...}` 占位符的键会被忽略。

## 较早的形式

在 v11.23.0 之前，`registries` 将 scope 映射到 URL，并用 `default` 键指定主 registry：

pnpm-workspace.yaml

```yaml
registries:
  default: https://registry.npmjs.org/
  "@acme": https://npm.corp.example.com/
```

这种形式仍然被接受，行为一如以往。两种形式不能混在同一个映射中：值为字符串的条目是 scope 路由，而以 URL 为键的 scope 路由则是错误。

[namedRegistries](/docs/settings/dependency-resolution#namedregistries) 设置已废弃，改用 `prefix`。它仍会被读取，但仅用于 `registries` 未声明的前缀；当两者都声明前缀时，pnpm 会发出警告。
