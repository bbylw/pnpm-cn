---
title: "局限性"
headingIds: []
---

1. `npm-shrinkwrap.json` 和 `package-lock.json` 会被忽略。与 pnpm 不同，npm 可以将同一个 `name@version` 以不同的依赖集安装多次。npm 的锁文件被设计为反映扁平的 `node_modules` 布局；然而由于 pnpm 默认创建隔离的布局，它无法遵循 npm 的锁文件格式。不过，如果你想把锁文件转换为 pnpm 格式，参见 [pnpm import](/docs/cli/import)。
2. 入口脚本（`node_modules/.bin` 中的文件）始终是 shell 文件，而不是指向 JS 文件的符号链接。创建 shell 文件是为了帮助可插拔的 CLI 应用在这种不寻常的 `node_modules` 结构中找到它们的插件。这极少成为问题，如果你期望某个文件是 JS 文件，请直接引用原始文件，如 [#736](https://github.com/pnpm/pnpm/issues/736) 中所述。

对这些问题的变通办法有想法吗？[分享出来。](https://github.com/pnpm/pnpm/issues/new)
