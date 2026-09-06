---
title: "命令行 tab 补全"
headingIds: ["g-planepnpm-shell-completion"]
---

:::info[info]

pnpm v9+ 的补全与旧版 pnpm 的补全不兼容。如果你已为早于 v9 的版本安装过 pnpm 补全，必须先将其卸载，以确保 v9+ 的补全正常工作。方法是删除你的 dot 配置文件（以点开头的配置文件）中包含 `__tabtab` 的那段代码。

:::

不同于通常需要插件的其他流行包管理器，pnpm 原生支持 Bash、Zsh、Fish 及类似 shell 的命令行 tab 补全。

要为 Bash 设置自动补全，运行：

```
pnpm completion bash > ~/completion-for-pnpm.bash
echo 'source ~/completion-for-pnpm.bash' >> ~/.bashrc
```

要为 Fish 设置自动补全，运行：

```
pnpm completion fish > ~/.config/fish/completions/pnpm.fish
```

## g-plane/pnpm-shell-completion

[pnpm-shell-completion](https://github.com/g-plane/pnpm-shell-completion) 是由 Pig Fang 在 Github 上维护的一个 shell 插件。

Features:

- 为 `pnpm --filter <package>` 提供补全。
- 为 `pnpm remove` 命令提供补全，包括工作区中的包（通过指定 `--filter` 选项）。
- 为 `package.json` 中的脚本提供补全。
