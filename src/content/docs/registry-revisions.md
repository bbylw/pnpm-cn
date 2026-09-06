---
title: "Registry 修订版"
headingIds: ["how-a-revision-is-addressed","in-the-lockfile","selecting-a-revision","refreshing-revisions"]
---

自 v12.0.0 起提供

某些 registry 可以为一个已发布的版本提供一个**替换产物**——例如重新构建并修补了某个漏洞的版本——而无需更改版本号，也无需改写原始 `name@version` URL 一直以来所提供的字节。pnpm 将每个这样的产物称为该版本的一个*修订版*。

修订版 0 始终是原始产物。一个替换了产物的 registry 会将替换版本公告为修订版 1，其后的为修订版 2，依此类推，按每个 registry、每个 `name@version` 分别计数。

:::note[说明]

修订版是 registry 的一种能力，pnpm 无法为一个未实现它的 registry 添加该能力。[pnpr](https://pnpm.io/pnpr) 会提供修订版，既针对它托管的包，也——作为代理——针对公告了修订版的上游 registry。`registry.npmjs.org` 则不提供。

:::

## 修订版的寻址方式

修订版通过其自身的摘要，从 registry 上的一条不可变路由拉取：

```
<registry-base>/-/tarballs/sha512/<base64url-digest>
```

registry 元数据会将该 URL 与一个普通的子资源完整性（Subresource Integrity）值以及修订版编号一起公告：

```jsonc
{
  "name": "ejs",
  "version": "2.7.4",
  "dist": {
    "tarball": "https://registry.example/-/tarballs/sha512/AbCd...",
    "integrity": "sha512-AbCd...",
    "revision": 2
  }
}
```

`dist.revision` 仅当所选产物是一个替换版本时才存在。`dist.revisions` 承载了完整的历史——每一个被公告的修订版及其自身的完整性、摘要 URL 和 manifest。

pnpm 会在解析期间校验以上内容：该 URL 必须位于所选 registry 的完整性摘要 tarball 路由上，其 base64url 摘要必须解码为与 `dist.integrity` 中完全一致的摘要，且修订版编号必须是 `0 < N ≤ 2^53 − 1` 范围内的规范整数。任何不满足的内容都会以 `ERR_PNPM_MALFORMED_METADATA` 失败。拉取本身是一次经过认证的单个请求，既不重试也不回退，并且**任何**重定向——包括同源重定向——都会使其失败。

registry 也可能通过摘要路由提供一个*原始*产物。pnpm 会将其归一化回一个仅含完整性的普通锁文件条目，而不是存储一个会把锁文件钉死在某次部署主机名上的绝对 URL。

## 在锁文件中

没有 `revision` 字段的条目表示修订版 0，并且在字节上与 pnpm 一直以来所写入的完全一致——规范的 `name@version` URL 永远钉在原始产物上，因此对于一个未经修补的依赖，什么都没有变化：

pnpm-lock.yaml

```yaml
packages:
  ejs@2.7.4:
    resolution:
      integrity: sha512-<original-digest>

  lodash@4.17.21:
    resolution:
      integrity: sha512-<replacement-digest>
      revision: 1
```

`revision` 这一行正是告诉 pnpm 按摘要拉取、而非重建规范 URL 的依据。它也让 diff 更易读：在某个完整性发生变化处，旁边从 `revision: 1` 变为 `revision: 2` 说明了完整性*为何*变化。

由于原始产物不作标记，一个尚未采用任何替换版本的工作区会生成一个旧版 pnpm 仍能读取的锁文件，并且将锁文件指向一个没有摘要路由的 registry 也能让整个未经修补的依赖图保持可安装——只有 `revision` 条目会失败，且它们以普通的不可用形式失败。

已安装的锁文件绝不会在未经提示的情况下升级：一次拉取会保留已锁定的修订版，而不是采用 registry 当前所选的那个。

## 选择修订版

一个 specifier 可以用 `+rN` 钉住某个修订版，以 semver 构建元数据的形式携带：

pnpm-workspace.yaml

```yaml
overrides:
  ejs@2.7.4: 2.7.4+r1
```

- `+r0` 保留原始产物——即从 registry 已选的替换版本中退出。
- 一个正数会采用一个 registry 公告但尚未选用的替换版本，或将一个已选用的冻结下来。

它既可作为 override 目标，也可直接声明为依赖，跨 npm、JSR、别名以及[命名 registry](/docs/registries#prefix) 生效。版本部分正常解析——构建元数据在版本匹配时被忽略——随后从 `dist.revisions` 中选出指定的修订版，并由**该条目自身的 manifest** 驱动子树解析。修订版之间的依赖、对等依赖、`bin`、`engines` 以及安装脚本姿态可能合理地存在差异，因此读取当前版本的顶层字段会是错误的。

围绕它的规则如下：

- 一个 registry 未公告的修订版是硬性错误（`ERR_PNPM_NO_MATCHING_REVISION`）；pnpm 绝不向前回退到所选的那个。
- 在一个不具备修订版感知的版本上，`+r0` 会被唯一的产物平凡地满足，而正数则是一个错误。
- 会改变版本的目标可以组合：`"ejs@2.7.4": "2.7.5+r1"` 会将 spec 重写为 `2.7.5`，然后选出它的修订版 1。
- 重写只应用一次，因此修订版选择既不能链式叠加也不能循环。
- 只有 `r<digits>` 构建元数据命名空间被保留。携带任何其他构建元数据的 spec 都是一个普通 spec。
- 在同一依赖图中，针对同一个 `name@version` 要求不同修订版的两个 spec 会以 `ERR_PNPM_REVISION_CONFLICT` 失败。一个包键只能持有一个产物，pnpm 不会将它们静默统一。

和每个精确选择器 override 一样，一个 `+rN` override 也会**钉住版本**：一个声明为 `^2.7.0` 的依赖在上游发布 `2.7.5` 之后仍留在 `2.7.4`，直到该 override 被更改或移除。

选择是一种偏好，而非安全边界。一个策略拒绝某修订版字节的 registry，会用 `403` 响应其摘要 URL，随后被钉住的安装会大声失败，并指出该策略与被公告的修订版。

## 刷新修订版

要移动到 registry 当前所选的产物，而不更改任何包版本：

```bash
pnpm update --patches
```

对每个锁定的 registry 包，pnpm 都为完全相同的 `name@version` 解析当前元数据。当所选产物发生变化时，它会一起更新完整性、`revision` 字段和整个包快照——不同修订版之间的依赖元数据可能不同，因此只改校验和会是错误的。

一个显式钉住了修订版的包会被跳过，且该钉住会保持：这涵盖了带 `+rN` 目标的 override 以及作为其声明的依赖，因此 `"ejs": "2.7.4+r1"` 会在每次刷新中留在修订版 1。

`--patches` 不能与包选择器、`--latest`、`--interactive` 或 `--global` 组合使用（`ERR_PNPM_PATCHES_WITH_SELECTOR`）。

刷新可以由 pnpr 服务器在服务端解析完成，无论是通过 [pnprServer](https://pnpm.io/pnpr/install-acceleration) 还是命令行上的 `--pnpr-server <url>`。一次显式刷新会绕过冻结复用和 pnpr 的整体解析缓存，并且 registry 解析器即便在其缓存已热的情况下也会重新验证元数据——否则该命令可能会原样交回被要求越过的修订版。
