---
title: "Registry 修订版"
headingIds: ["how-a-revision-is-addressed","in-the-lockfile","selecting-a-revision","refreshing-revisions"]
---

自 v12.0.0 起提供

某些 registry 可以为一个已发布的版本提供一个**替换产物**——例如重新构建并修补了某个漏洞的版本——而无需更改版本号，也无需改写原始 `name@version` URL 一直以来所提供的字节。pnpm 将每个这样的产物称为该版本的一个*修订版*。

修订版 0 始终是原始产物。一个替换了产物的 registry 会将替换版本公告为修订版 1，其后的为修订版 2，依此类推，按每个 registry、每个 `name@version` 分别计数。

修订版仍处于实验阶段，其元数据与锁文件格式可能在不发布大版本的情况下发生变化。

:::note[说明]

修订版是 registry 的一种能力，pnpm 无法为一个未实现它的 registry 添加该能力。[pnpr](https://pnpm.io/pnpr) 会提供修订版，既针对它托管的包，也——作为代理——针对公告了修订版的上游 registry。`registry.npmjs.org` 则不提供。

:::

## 修订版的寻址方式

修订版通过它的包名、版本号与修订版编号，从 registry 上的一条不可变路由拉取：

```text
<registry-base>/<name>@<version>+r<revision>
```

`dist.integrity` 是该修订版**未压缩 tar** 的哈希，在所有 registry 上、对每个修订版都是如此，原始产物也不例外。registry 可以用 `gzip` 或 `zstd` 压缩响应。pnpm 会去掉这层压缩并校验 tar，因此无论 registry 发送的是哪种压缩形式，URL 与完整性都保持不变。

registry 元数据会将该 URL 与一个普通的子资源完整性（Subresource Integrity）值以及修订版编号一起公告：

```jsonc
{
  "name": "ejs",
  "version": "2.7.4",
  "dist": {
    "tarball": "https://registry.example/ejs@2.7.4+r2",
    "integrity": "sha512-AbCd...",
    "revision": 2
  }
}
```

一个支持修订版的版本总是带有 `dist.revision`，即使选中的是原始产物也记为 `0`。`dist.revisions` 承载了完整的历史——每一个被公告的修订版，连同它自己的完整性、`<name>@<version>+r<revision>` URL 与 manifest。历史中始终包含修订版 0。既没有 `dist.revision` 也没有 `dist.revisions` 的版本，就是修订版协议之外的一个普通版本。

pnpr 服务器只在它自己的 package document 中给出这些字段，pnpm 从声明了 [`serverType: pnpr`](/docs/registries#servertype) 的 registry 读取它。由 pnpm 提供的 npm doc，则像 npm 客户端读取任何版本那样，通过 `<name>@<version>+r<revision>` URL 与完整性给出当前选中的修订版，因此一个未声明的 pnpr 能安装当前选中的修订版，却无法钉住另一个。

pnpm 会在解析期间校验一个支持修订版的版本：

- 该 URL 必须位于所选 registry 的 `<name>@<version>+r<revision>` 路由上，且针对同一个包、版本与修订版；`dist.integrity` 必须是完整的 SHA-512 摘要；
- 修订版编号必须是 `0 ≤ N ≤ 2^53 − 1` 范围内的整数；
- 历史中必须包含修订版 0 与当前选中的修订版；唯一例外是 pnpr 自己的 package document，它在自己的发布记录中保留每一个修订版。

其余任何情况都会以 `ERR_PNPM_MALFORMED_METADATA` 失败。一个没有 `dist.revision` 的修订版路由 URL 就是普通的 tarball——正如 pnpm 提供的 npm doc 给出的是当前选中的修订版那样——它只回答其 URL 所指明的那个修订版。拉取本身是一次经过认证的单个请求，既不重试也不回退，并且**任何**重定向——包括同源重定向——都会使其失败。

## 在锁文件中

每个修订版都会连同其修订版编号（原始产物也不例外）以及它的 tar 哈希一起记录：

```yaml
packages:
  ejs@2.7.4:
    resolution:
      integrity: sha512-<original-tar-digest>
      revision: 0

  lodash@4.17.21:
    resolution:
      integrity: sha512-<replacement-tar-digest>
      revision: 1
```

`revision` 这一行正是告诉 pnpm 去拉取 `<name>@<version>+r<revision>` 而不是 `<name>@<version>` 的依据。它也让 diff 更易读：在某个完整性发生变化处，旁边从 `revision: 1` 变为 `revision: 2` 说明了完整性*为何*变化。没有 `revision` 的条目就是普通条目，一如既往地从规范 URL 拉取。

由更早的 pnpm v12 版本写下的锁文件，会把通过修订版协议选中的原始产物记录成一个普通条目。这类的条目对于规范 URL 依然有效，而在下一次解析时会被记录为 `revision: 0`。

已安装的锁文件绝不会在未经提示的情况下升级：一次拉取会保留已锁定的修订版，而不是采用 registry 当前所选的那个。

## 选择修订版

一个 specifier 可以用 `+rN` 钉住某个修订版，以 semver 构建元数据的形式携带：

```yaml
overrides:
  ejs@2.7.4: 2.7.4+r1
```

- `+r0` 保留原始产物——即从 registry 已选的替换版本中退出。它会被记录为 `revision: 0`。
- 一个正数会采用一个 registry 公告但尚未选用的替换版本，或将一个已选用的冻结下来。

它既可作为 override 目标，也可直接声明为依赖，跨 npm、JSR、别名以及[命名 registry](/docs/registries#prefix) 生效。版本部分正常解析——构建元数据在版本匹配时被忽略——随后从 `dist.revisions` 中选出指定的修订版，并由**该条目自身的 manifest** 驱动子树解析。修订版之间的依赖、对等依赖、`bin`、`engines` 以及安装脚本姿态可能合理地存在差异，因此读取当前版本的顶层字段会是错误的。

围绕它的规则如下：

- 一个 registry 未公告的修订版是硬性错误（`ERR_PNPM_NO_MATCHING_REVISION`）；pnpm 绝不向前回退到所选的那个。
- 在一个不具备修订版感知的版本上，`+r0` 会被唯一的产物平凡地满足（并保持为一个普通条目），而正数则是一个错误。
- 会改变版本的目标可以组合：`"ejs@2.7.4": "2.7.5+r1"` 会将 spec 重写为 `2.7.5`，然后选出它的修订版 1。
- 重写只应用一次，因此修订版选择既不能链式叠加也不能循环。
- 只有 `r<digits>` 构建元数据命名空间被保留。携带任何其他构建元数据的 spec 都是一个普通 spec。
- 在同一依赖图中，针对同一个 `name@version` 要求不同修订版的两个 spec 会以 `ERR_PNPM_REVISION_CONFLICT` 失败。一个包键只能持有一个产物，pnpm 不会将它们静默统一。

和每个精确选择器 override 一样，一个 `+rN` override 也会**钉住版本**：一个声明为 `^2.7.0` 的依赖在上游发布 `2.7.5` 之后仍留在 `2.7.4`，直到该 override 被更改或移除。

选择是一种偏好，而非安全边界。一个策略拒绝某修订版字节的 registry，会用 `403` 响应其修订版 URL，随后被钉住的安装会大声失败，并指出该策略与被公告的修订版。

## 刷新修订版

要移动到 registry 当前所选的产物，而不更改任何包版本：

```bash
pnpm update --patches
```

对每个锁定的 registry 包，pnpm 都为完全相同的 `name@version` 解析当前元数据。当所选产物发生变化时，它会一起更新完整性、`revision` 字段和整个包快照——不同修订版之间的依赖元数据可能不同，因此只改校验和会是错误的。

一个修订版被显式钉住的包会被跳过，且该钉住会保持：这涵盖了带 `+rN` 目标的 override 以及作为其声明的依赖，因此 `"ejs": "2.7.4+r1"` 会在每次刷新中留在修订版 1。

`--patches` 不能与包选择器、`--latest`、`--tag`、`--interactive` 或 `--global` 组合使用（`ERR_PNPM_PATCHES_WITH_SELECTOR`）。

刷新可以由 pnpr 服务器在服务端解析完成，无论是通过 [pnprServer](https://pnpm.io/pnpr/install-acceleration) 还是命令行上的 `--pnpr-server <url>`。一次显式刷新会绕过冻结复用和 pnpr 的整体解析缓存，并且 registry 解析器即便在其缓存已热的情况下也会重新验证元数据——否则该命令可能会原样交回被要求越过的修订版。
