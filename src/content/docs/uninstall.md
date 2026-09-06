---
title: "卸载 pnpm"
headingIds: ["removing-the-globally-installed-packages","removing-the-pnpm-cli","removing-the-global-content-addressable-store"]
---

## 移除已安装的全局包

在移除 pnpm CLI 之前，先移除所有由 pnpm 安装的全局包可能更合适。

要列出所有全局包，运行 `pnpm ls -g`。有两种方法可以移除全局包：

1. 对列出的每个全局包，运行 `pnpm rm -g <pkg>...`。
2. 运行 `pnpm root -g` 找到全局目录的位置并手动移除它。

## 移除 pnpm CLI

如果你使用独立脚本安装 pnpm，那么你应该可以通过移除 pnpm 主目录来卸载 pnpm CLI：

```
rm -rf "$PNPM_HOME"
```

你可能还想在 shell 配置文件中清理 `PNPM_HOME` 环境变量（`$HOME/.bashrc`、`$HOME/.zshrc` 或 `$HOME/.config/fish/config.fish`）。

如果你用 npm 安装 pnpm，那么你应该用 npm 卸载 pnpm：

```
npm rm -g pnpm
```

## 移除全局内容寻址存储

```
rm -rf "$(pnpm store path)"
```

如果你在非主磁盘上使用过 pnpm，那么必须在每个使用过 pnpm 的磁盘上运行上述命令。pnpm 会为每个磁盘创建一个存储。
