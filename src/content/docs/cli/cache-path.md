---
title: "pnpm cache path"
headingIds: []
---

自 v11.22.0 起提供

打印 pnpm 用于其元数据缓存的目录，与 [pnpm store path](/docs/cli/store#path) 相对应。打印出的路径为绝对路径且经过词法清理，因此相对的 [cacheDir](/docs/settings/other#cachedir) 会产出一个其他工具可以消费的路径。

```bash
pnpm cache path
```

pnpm 从平台和 `cacheDir` 设置派生此目录，因此想要缓存它的 CI 配置无需再手动复刻这一解析过程：

.github/workflows/ci.yaml

```yaml
- name: Get the cache directory
  run: echo "PNPM_CACHE_DIR=$(pnpm cache path)" >> $GITHUB_ENV
```

除了 registry 元数据和 [pnpm dlx](/docs/cli/pnx) 缓存，该目录还保存锁文件验证日志，即哪个锁文件通过了哪些[供应链安全策略](/docs/supply-chain-security)的记录。恢复它可以让任务在当前配置的策略下跳过重新验证日志已涵盖的锁文件，这在一旦存储预热后是 CI 中安装的主要开销。自 v11.22.0 起，[pnpm store prune](/docs/cli/store#prune) 不再删除该日志。

:::important[重要]

只在受信任任务可写的位置缓存此目录。详情见 [cacheDir](/docs/settings/other#cachedir) 设置。

:::
