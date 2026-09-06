---
title: "pnpm audit"
headingIds: ["commands","signatures","options","--audit-level-severity","--fix","--interactive--i","--json","--dev--d","--prod--p","--no-optional","--ignore-registry-errors","--ignore-unfixable","--ignore-vulnerability","configuration","auditlevel","auditignore","auditignoreprune"]
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

自 v11 起，`pnpm audit` 查询 registry 的 `/-/npm/v1/security/advisories/bulk` 端点。响应不包含 CVE 标识符，因此公告改为按 GitHub 公告 ID（GHSA）过滤。如果你之前在 `auditConfig.ignoreCves` 下列出了 CVE，请在 [audit.ignore](#auditignore) 下把每个条目替换为对应的 `GHSA-xxxx-xxxx-xxxx` 值（显示在 `pnpm audit` 输出的 `More info` 列中）。

## 命令

### signatures

自 v11.1.0 起提供

```bash
pnpm audit signatures
```

针对每个 registry 在 `/-/npm/v1/keys` 发布的公钥，验证已安装包的 ECDSA registry 签名。通过 [registries](/docs/settings/dependency-resolution#registries) 配置的按 scope registry 会被遵循；不发布签名密钥的 registry 会被跳过。

如果任何包拥有无效签名，或某个 registry 声明了签名密钥但某包发布时未附带签名，该命令以状态码 `1` 退出。结合 `--json` 可获得机器可读的输出。

## 选项

### --audit-level <severity>

- 类型：**low**、**moderate**、**high**、**critical**
- 默认值：**low**

只打印严重程度大于或等于 `<severity>` 的公告。

这也可以通过 `pnpm-workspace.yaml` 中的 [audit.level](#auditlevel) 设置。

### --fix

向 `pnpm-workspace.yaml` 文件添加 override，以强制使用依赖的不含漏洞版本。

使用 `--fix=update`（自 v11.0.0 起提供）通过更新锁文件中的包来修复漏洞，而不是添加 override。

当设置了 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage) 时，`--fix` 还会把每个公告的最小修补版本加入 `pnpm-workspace.yaml` 中的 [minimumReleaseAgeExclude](/docs/settings/dependency-resolution#minimumreleaseageexclude)，这样安全修复无需等待发布时长窗口即可安装。

### --interactive, -i

自 v11.0.0 起提供

审阅由 `--fix` 选中的公告并挑选要应用的项。只能与 `--fix` 一起使用。

### --json

以 JSON 格式输出审计报告。

对于没有已发布修复的公告，`patched_versions` 为 `null`，因此工具能够区分「无可用修复」与「在版本 X 有可用修复」。

### --dev, -D

只审计开发依赖。

### --prod, -P

只审计生产依赖。

### --no-optional

不审计 `optionalDependencies`。

### --ignore-registry-errors

如果 registry 返回非 200 状态码，进程应以 0 退出。这样进程只有在 registry 确实成功响应并发现了漏洞时才会失败。

### --ignore-unfixable

自 v10.11.0 起提供

忽略所有没有解决方案的公告。

自 v11 起，无法修复的公告按 GHSA 而非 CVE 追踪。

### --ignore <vulnerability>

自 v10.11.0 起提供

通过其 GitHub 公告 ID（GHSA）忽略某个漏洞。在 v11 之前，此标志接受 CVE 标识符。

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
- 类型：**low**、**moderate**、**high**、**critical**

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

### audit.ignorePrune

自 v12.0.0 起提供

- 默认值：**false**
- 类型：**Boolean**

为 `true` 时，`pnpm audit --fix` 会移除 [audit.ignore](#auditignore) 中那些 GHSA 已不再出现在审计报告里的条目，这样被容忍的公告列表不会为早已不存在的依赖累积条目。

```yaml
audit:
  ignorePrune: true
```

:::info[info]

在 v11.16.0 之前，这些设置名为 `auditLevel` 和 `auditConfig.ignoreGhsas`。已废弃的名称在下一个主版本前仍可使用；当两者都被设置时，`audit` 段优先并会打印一条警告。

在 v11 之前，`auditConfig.ignoreCves` 用于按 CVE 标识符过滤公告。该设置不再被识别。

:::
