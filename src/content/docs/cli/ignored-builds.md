---
title: "pnpm ignored-builds"
headingIds: []
---

打印构建脚本被屏蔽的包列表。

当 `strictDepBuilds` 为 `false` 时，等待构建审批的包会连同每个包所请求的能力一起，出现在合并的「等待审批的包」提示中。当 `strictDepBuilds` 为 `true` 时，安装会以 `ERR_PNPM_IGNORED_BUILDS` 失败。而该命令始终只列出构建脚本被屏蔽的包。

该命令列出两组内容：

- 上一次安装自动忽略的构建，读取自 `node_modules/.modules.yaml`。在第一次安装之前，没有任何内容可报告；
- 在 [`allowBuilds`](/docs/settings/build#allowbuilds) 中显式以 `false` 拒绝的构建。

每个包都会打印在它在 `allowBuilds` 中所处的键之下。要审批某个构建，请使用 [`pnpm approve-builds`](/docs/cli/approve-builds)。
