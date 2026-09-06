---
title: "pnpm setup"
headingIds: []
---

此命令由 pnpm 的独立安装脚本使用，例如 [https://get.pnpm.io/install.sh](https://get.pnpm.io/install.sh)。

Setup 执行以下操作：

- 为 pnpm CLI 创建主目录
- 通过更新 shell 配置文件，将 pnpm 主目录添加到 `PATH`
- 将 pnpm 可执行文件复制到 pnpm 主目录

自 v11.18.0 起，在 GitHub Actions 上运行时，`pnpm setup` 还会把 `PNPM_HOME` 和全局 bin 目录追加到 GitHub Actions 环境文件（`GITHUB_ENV` 和 `GITHUB_PATH`），使同一作业中的后续步骤能够运行 `pnpm add --global` 和其他全局命令。

:::tip[提示]

升级到 pnpm v11 后，运行 `pnpm setup` 以更新你的 shell 配置。在 v11 中，全局安装的可执行文件存放在 `PNPM_HOME` 下的 `bin` 子目录中。

:::
