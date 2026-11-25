---
title: "pnpm audit"
headingIds: ["commands","signatures","deprecations","engines","options","--audit-level-severity","--fix","--no-add-release-age-exclusions","--interactive--i","--json","--dev--d","--prod---production--p","--optional","--no-optional","--ignore-registry-errors","--ignore-unfixable","--ignore-vulnerability","configuration","auditlevel","auditignore","auditignoreprune"]
---

检查已安装包中的已知安全问题。

如果发现安全问题，尝试通过 `pnpm update` 更新你的依赖。如果简单更新无法修复所有问题，使用 [overrides](/docs/settings/dependency-resolution#overrides) 强制使用不含漏洞的版本。例如，如果 `lodash@<2.1.0` 存在漏洞，用此 override 强制 `lodash@^2.1.0`：

pnpm-workspace.yaml

```yaml
overrides:
  "lodash@<2.1.0": "^2.1.0"
```

或者，运行 `pnpm audit --fix`。

如果你愿意容忍某些不影响你项目的漏洞，可以使用 [audit.ignore](#auditignore) 设置。

`pnpm audit` 查询 registry 的 `/-/npm/v1/security/advisories/bulk` 端点。响应不包含 CVE 标识符，因此公告通过其 URL 中的 GitHub 公告 ID（GHSA）来标识。

当移除被忽略的公告后，仍有达到或超过[审计级别](#--audit-level-severity)的公告存在时，该命令会以状态码 `1` 退出。这一点对 `--ignore` 和 `--ignore-unfixable` 同样适用，它们会先保存相应的 ID。

## 命令

### signatures

自 v11.1.0 起提供

自 v11.1.0 起提供

```bash
pnpm audit signatures
```

针对每个 registry 在 `/-/npm/v1/keys` 发布的公钥，验证已安装包的 ECDSA registry 签名。通过 [registries](/docs/settings/dependency-resolution#registries) 配置的按 scope 及按前缀路由的 registry 会被遵循；不发布签名密钥的 registry，以及 tarball、git 和目录依赖，都会被跳过。

签名会针对 lockfile 中记录的包完整性进行验证。没有记录完整性的包无法通过验证。

registry 签名的是包的 `.tgz` 的完整性。当 lockfile 通过 [`lockfile.integrityTarget: tar`](/docs/settings/store#lockfileintegritytarget) 锁定 tar 包时，一旦 pnpm 把它与 lockfile 中的 tar 哈希对应上，签名就会针对 registry 发布的 `.tgz` 完整性进行验证。存储目录中已有的包由存储目录应答；其他包会被下载并检查。无法对应的包会被报告为无效，并给出原因。

如果任何包拥有无效签名，或某个 registry 声明了签名密钥但某包发布时未附带签名，该命令以状态码 `1` 退出。结合 `--json` 可获得机器可读的输出。

### deprecations

```bash
pnpm audit deprecations
```

列出被其 registry 标记为已废弃的已安装包，并附上发布者留下的说明。每个包会显示直接依赖它的项目，或引入它的一串包。当该包有一个未被废弃的版本时，会指明最新版本。

当 registry 元数据在缓存中不到 5 分钟时，pnpm 直接从缓存读取，因此刚安装完无需发起请求。更旧的元数据会与 registry 核对，因此此后被废弃的包也会被报告。tarball、git 和目录依赖会被跳过。

如果任何已安装的包已废弃，该命令以状态码 `1` 退出。`--prod`、`--dev`、`--no-optional`、`--json`、`--ignore-registry-errors` 以及工作区过滤器对它同样生效。

### engines

```bash
pnpm audit engines
```

列出不支持当前 Node.js 版本或平台的已安装包，并附上它们各自的要求。每个包会显示直接依赖它的项目，或引入它的一串包。这些正是安装时会发出警告的包。

pnpm 会依据安装所使用的 Node.js 版本来检查这些包：[`nodeVersion`](/docs/settings/cli#nodeversion) 设置、锁文件为根项目锁定的 Node.js 版本，或系统的 Node.js。平台则包含 [`supportedArchitectures`](/docs/settings/dependency-resolution#supportedarchitectures)。安装时会跳过的可选依赖不会被列出。该命令只读取锁文件，不发起 registry 请求。

如果任何已安装的包不兼容，该命令以状态码 `1` 退出。`--prod`、`--dev`、`--no-optional`、`--json` 以及工作区过滤器对它同样生效。

## 选项

### --audit-level <severity>

- 类型：**info**、**low**、**moderate**、**high**、**critical**
- 默认值：**low**

只打印严重程度大于或等于 `<severity>` 的公告。低于该级别的公告同样不会使命令失败。

这也可以通过 `pnpm-workspace.yaml` 中的 [audit.level](#auditlevel) 设置。

### --fix

向 `pnpm-workspace.yaml` 文件添加 override，以强制使用依赖的不含漏洞版本。

使用 `--fix=update`（自 v11.0.0 起提供）通过更新锁文件中的包来修复漏洞，而不是添加 override。

当设置了 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage) 时，`--fix` 还会把每个公告的最小修补版本加入 `pnpm-workspace.yaml` 中的 [minimumReleaseAgeExclude](/docs/settings/dependency-resolution#minimumreleaseageexclude)，这样安全修复无需等待发布时长窗口即可安装。

### --no-add-release-age-exclusions

对两种修复方式和交互式修复，都跳过对 `minimumReleaseAgeExclude` 的自动添加。发布时长策略仍可能拦截最近发布的补丁，除非已有排除项允许它们。如果解析器选中的补丁被发布时长策略拦截，`--fix=update` 可能以 `ERR_PNPM_NO_MATURE_MATCHING_VERSION` 退出。使用 `--fix=update` 时，更新仍会遵循 [`minimumReleaseAgeExcludePrune`](/docs/settings/dependency-resolution#minimumreleaseageexcludeprune)。

### --interactive, -i

自 v11.0.0 起提供

审阅由 `--fix` 选中的公告并挑选要应用的项。未给出 `--fix` 时，它隐含 `--fix=override`。

### --json

以 JSON 格式输出审计报告。

对于没有已发布修复的公告，`patched_versions` 为 `null`，因此工具能够区分「无可用修复」与「在版本 X 有可用修复」。

### --dev, -D

只审计开发依赖。

### --prod, --production, -P

只审计 `dependencies` 和 `optionalDependencies`。

### --optional

审计 `optionalDependencies`。这是默认行为。

### --no-optional

不审计 `optionalDependencies`。

### --ignore-registry-errors

如果 registry 返回非 200 状态码，进程应以 0 退出。这样进程只有在 registry 确实成功响应并发现了漏洞时才会失败。

### --ignore-unfixable

自 v10.11.0 起提供

忽略所有没有解决方案的公告。无法修复且没有 GHSA ID 的公告不能被忽略，该命令会以 `ERR_PNPM_AUDIT_MISSING_GHSA` 失败。

它们的 GHSA ID 会像使用 [`--ignore`](#--ignore-vulnerability) 时一样保存到 `pnpm-workspace.yaml` 中。

### --ignore <vulnerability>

自 v10.11.0 起提供

通过其 GitHub 公告 ID（GHSA）忽略某个漏洞。

该 ID 会保存到 `pnpm-workspace.yaml` 中（文件不存在时会创建），并且不会打印审计报告。如果 [`audit.ignore`](#auditignore) 列表已经设置，ID 会加入该列表；否则会加入已废弃但 pnpm 仍会读取的 `auditConfig.ignoreGhsas`。要让新项目写入 `audit.ignore`，请先创建该列表（`audit: { ignore: [] }`）。

## 配置

`pnpm audit` 在 `pnpm-workspace.yaml` 的 `audit` 段中配置（自 v11.16.0 起提供）：

```yaml
audit:
  level: high
  ignore:
    - GHSA-42xw-2xvc-qx8m
```

### audit.level

- 默认值：**low**
- 类型：**info**、**low**、**moderate**、**high**、**critical**

只打印严重程度大于或等于此级别的公告。与 [--audit-level](#--audit-level-severity) 标志相同。

### audit.ignore

`pnpm audit` 命令将忽略的 GHSA 代码列表。

```yaml
audit:
  ignore:
    - GHSA-42xw-2xvc-qx8m
    - GHSA-4w2v-q235-vp99
    - GHSA-cph5-m8f7-6c5x
    - GHSA-vh95-rmgr-6w4m
```

自 v12.4.0 起，被忽略的公告不计入漏洞总数和按严重程度划分的计数，而是单独报告。当发现的公告全部被忽略时，摘要会如实说明，而不是报告审计通过。

### audit.ignorePrune

自 v12.0.0 起提供

- 默认值：**false**
- 类型：**Boolean**

为 `true` 时，`pnpm audit --fix` 会移除 [audit.ignore](#auditignore) 中那些 GHSA 已不再出现在审计报告里的条目，这样被容忍的公告列表不会为早已不存在的依赖累积条目。

```yaml
audit:
  ignorePrune: true
```

:::info[信息]

`auditLevel` 和 `auditConfig.ignoreGhsas` 是 `audit.level` 和 `audit.ignore` 的已废弃名称，pnpm 仍会读取它们。当两种写法都被设置时，`audit` 段优先并会打印一条警告。

`auditConfig.ignoreCves` 不再被识别。请把每个 CVE 替换为对应的 `GHSA-xxxx-xxxx-xxxx` ID，它显示在 `pnpm audit` 输出的 `More info` 列中，参见 [`audit.ignore`](#auditignore)。

:::
