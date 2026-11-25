---
title: "pnpm edit <pkg>"
headingIds: ["--editor-editor"]
---

在默认文本编辑器中打开某个已安装包的目录。编辑器成功退出后，pnpm 只会重建这个被编辑过的依赖。

```sh
pnpm edit is-positive
pnpm edit express/safe-buffer
pnpm edit @scope/package --editor "code --wait"
```

编辑作用于你项目中已安装的文件。pnpm 会在打开编辑器前断开这些文件的硬链接，以保护共享同一存储的其他项目。被编辑文件产生的构建结果不会写入共享缓存。如果需要创建能跨重新安装保留的补丁，请使用 [`pnpm patch`](/docs/cli/patch)。

`pnpm edit` 不支持共享虚拟存储（`enableGlobalVirtualStore: true`）。在此模式下请使用 `pnpm patch` 来修改项目中的依赖。

## --editor <editor>

指定编辑器命令。可以包含参数，例如 `code --wait`。

在全局配置文件或 `PNPM_CONFIG_EDITOR` 中设置 `editor` 可以指定默认编辑器。`pnpm-workspace.yaml` 不能设置它，因为仓库不应决定 pnpm 运行哪个程序。

不带该选项时，pnpm 会依次使用配置的编辑器、`EDITOR`、`VISUAL`，最后在 Windows 上使用 `notepad`、在其他系统上使用 `vi`。仅有空值或空白字符的 `EDITOR`、`VISUAL` 会被忽略。

裸编辑器命令必须解析为项目之外的可执行文件。若要显式选择项目内的编辑器，请用 `--editor` 给出其路径。
