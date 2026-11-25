---
title: "使用多个 registry"
headingIds: ["routing-packages-to-a-registry","scopes","prefix","describing-the-server","servertype","supportstimefield","networkconcurrency","ecosystem","packages","tar-registries","where-the-setting-may-live","the-older-shapes"]
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

### networkConcurrency

自 v12.9.0 起提供

pnpm 同时发往该 registry 来源（其 scheme、主机和端口）的请求上限。适用于那些会限流或在负载下变慢的服务器，而不必降低其他每个 registry 的并发：

```yaml
registries:
  https://npm.corp.example.com/:
    scopes: ["@acme"]
    networkConcurrency: 4
```

该限制适用于 URL 位于该条目来源上的每个请求，包括 registry 从同一来源提供的 tarball。通过另一个来源重定向到达该来源的请求，也计入它最终被送往的来源。请求同样计入整体的 [`networkConcurrency`](/docs/settings/network#networkconcurrency)，因此高于该值的设置没有效果。URL 共享同一来源的条目共享其中最小的限制。条目可以只设置 `networkConcurrency`，例如用于限制默认 registry 或某个提供 tarball 的主机。

若发往该来源的请求超时，而发往它的其他请求仍在运行，pnpm 会像对待没有条目的来源那样，在该命令余下的时间里把它的限制降为一个请求。该值必须是正整数。与 npm 专用的字段不同，它对 Cargo 和 PyPI 条目同样适用。

### ecosystem

自 v12.5.0 起提供

选择该 registry 提供哪种包生态系统：`npm`（默认）、`cargo` 或 `pypi`。

```yaml
registries:
  https://internal.example/simple/:
    ecosystem: pypi
    packages: ["company-*"]
  https://pypi.org/simple/:
    ecosystem: pypi
    packages: ["*"]
  https://index.crates.io/:
    ecosystem: cargo
```

自 v12.5.1 起，Python 包只从通过 [`packages`](#packages) 声称其名称的索引中解析。声明顺序没有影响，包缺失或 registry 失败也不会回退到另一个索引。（v12.5.0 则按声明顺序搜索各索引。）Cargo 只接受一个稀疏索引。没有为某个生态系统做声明时，pnpm 使用 PyPI 或 crates.io。自 v12.5.0 起，这取代了已移除的 `python.indexUrl`、`python.extraIndexUrls` 和 `cargo.indexUrl` 设置。

凭据不能出现在 URL 键中。请在 [`.npmrc`](/docs/npmrc) 中配置；它们按来源匹配，对所有生态系统都适用。npm 专用的字段 `scopes`、`prefix`、`serverType` 和 `supportsTimeField` 在 Cargo 和 PyPI 条目中会被拒绝。

### packages

自 v12.5.1 起提供

对于 `ecosystem: pypi`，表示该索引提供哪些发行版名称。设置了 `packages` 的 npm 或 Cargo 条目会被拒绝，而不是被悄悄忽略。

模式可以是精确名称（如 `torch`）、名称前缀加单个 `*`（如 `company-*`），或表示默认索引的 `*`（等价于 `**`）。名称会在 Python 名称规范化之后比较：忽略大小写，连续的 `.`、`_`、`-` 折叠为 `-`，因此 `Company_Tools` 与 `company-tools` 属于同一声称。其他通配符形式（如 `company-**` 或 `@scope/*`）会被拒绝，空列表同样如此。

精确名称和前缀优先于默认索引；在它们彼此之间则从不竞争，因为两个可能匹配同一名称的模式会以 `ERR_PNPM_INVALID_SETTING` 被拒绝。这既适用于不同条目之间，也适用于同一条目内部，因此声称默认索引的条目不能再声称其他内容，且只能有一个索引是默认的。

声称该名称的索引同样提供直接依赖、传递依赖和隔离的构建依赖。包缺失、版本不兼容、认证错误或任何其他 registry 失败都会中止解析；pnpm 绝不会重试另一个索引。

省略 `packages` 同样意味着声称了默认索引，因此单个自定义 Python 索引无需任何模式，而两个都省略它的索引会因同为默认而被拒绝。一旦声明了任何 Python 索引，PyPI 就不再被隐式加入：没有索引声称的包会以 `ERR_PNPM_UNCLAIMED_PYTHON_PACKAGE` 失败，除非有索引是默认的。更改路由会使 Python 锁文件失效。

含私有包和 PyPI 默认索引的示例，参见 [Python 索引](/docs/python#python-indexes)。

### Tar registry

自 v12.15.0 起提供

Tar registry 以未压缩的 tar 而非 `.tgz` 提供每个包。该 tar 是所发布 `.tgz` 的 gzip 解码内容，按请求所接受的 HTTP 内容编码（zstd 或 gzip）发送。它的元数据在 `dist.integrity` 中固定 tar 的哈希，因此 registry 可以随意压缩该 tar 而不改变任何哈希。pnpr 通过 [`tarballs: tar`](https://pnpm.io/pnpr/configuration#tar-registries) 暴露了这一能力。

项目通过以 URL 为键并声明其布局来使用 tar registry：

```yaml
registries:
  https://pnpr.corp.example/npm/~zstd/:
    scopes: ["@"]
    serverType: pnpr
```

由服务器决定哪个基础地址提供 tar。在 pnpr 的示例中，它们位于 `/npm/~zstd/`，与常规的 `.tgz` 基础地址相邻，但 registry 也可以从其主基础地址提供 tar；参见 [pnpr 中的 tar registry](https://pnpm.io/pnpr/configuration#tar-registries)。请在任何 pnpr registry 基础地址上声明 `serverType: pnpr`，这样 pnpm 才会从 `pnpm-lock.yaml` 中省略规范的 `<name>@<version>` tarball URL。

pnpm 通过解码后响应的前几个字节来区分 tar 和 `.tgz`，因此无需声明其他内容。锁文件保留其 `integrity` 字段，对来自 tar registry 的包而言，该字段保存的是 tar 的哈希。

- **切换**：在 `.tgz` registry 和 tar registry 之间切换项目，会改变 registry 所提供的内容，因此记录的哈希不再匹配。切换后请运行 `pnpm install --update-checksums`。用 [`lockfile.integrityTarget: tar`](/docs/settings/store#lockfileintegritytarget) 固定 tar 的锁文件会在切换前后保留所有哈希。
- **缺失的哈希**：尚未知晓某版本 tar 哈希的 tar registry 会省略 `dist.integrity`。此时 pnpm 会在解析期间下载该 tarball，并记录它收到的 tar 的哈希。
- **重写 `Accept-Encoding` 的代理**（例如部署在 Worker 前面的 Cloudflare 边缘节点）可能让 zstd 无法到达 registry。此时 registry 会以 gzip 编码或未压缩方式发送 tar。两种情况下 tar 及其哈希都相同，因此安装不受影响，只是下载体积发生变化。pnpr 的 [Cloudflare 指南](https://pnpm.io/pnpr/cloudflare)介绍了它的 Worker 如何获得 zstd 支持。
- **体积限制**：pnpm 只在解码 tarball 之后才校验其哈希，因此它会先对解码内容做体积限制。一个包的文件不得超过 [`maxTarballUnpackedSize`](/docs/settings/network#maxtarballunpackedsize)。一个 tar 的文件同样不得超过该包的 `dist.unpackedSize`。单个归档的头部和被跳过的条目不得超过 256 MiB，zstd 响应使用的窗口也不得大于 8 MiB。

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
