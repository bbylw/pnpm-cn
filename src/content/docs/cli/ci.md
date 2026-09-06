---
title: "pnpm ci"
headingIds: []
---

自 v11.0.0 起提供

别名： `clean-install`, `ic`, `install-clean`

执行一次干净安装。该命令先运行 [pnpm clean](/docs/cli/clean)，接着运行 [pnpm install --frozen-lockfile](/docs/cli/install)。

专为可复现构建至关重要的 CI/CD 环境设计。

```bash
pnpm ci
```
