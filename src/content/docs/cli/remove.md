---
title: "pnpm remove"
headingIds: ["patterns","options","--recursive--r","--global--g","--save-dev--d","--save-optional--o","--save-prod--p","--lockfile-only","--lockfile-dir-dir","--no-trust-lockfile","--filter-package_selector"]
---

别名： `rm`, `uninstall`, `un`, `uni`

从 `node_modules` 和项目的 `package.json` 中移除包。

```sh
pnpm remove <pkg>...
```

不使用任何 `--save-*` 选项时，该包会从所有依赖字段中被移除。

启用 Python 或 Cargo 后，可以使用 `pypi:<name>` 或 `crate:<name>` 从 `pyproject.toml` 或 `Cargo.toml` 中移除依赖并更新其 lockfile。诸如 `pkg:pypi/example` 和 `pkg:cargo/example` 的包 URL 同样可用。移除 Python 或 Cargo 依赖需要精确名称，且不支持排除规则。

## 模式

自 v12.23.0 起提供

选择器可以是 glob 模式。以 `!` 开头的选择器会排除它所匹配的依赖，即使名称完全匹配也会被排除。请给模式加上引号，以免被 shell 展开。

```sh
pnpm remove "eslint-*" "!eslint-plugin-import"
```

没有匹配到任何依赖的模式不会移除任何东西，也不会失败。名称精确匹配但并非依赖的包仍会失败并报错 `ERR_PNPM_CANNOT_REMOVE_MISSING_DEPS`。

## 选项

### --recursive, -r

在[工作区](/docs/workspaces)内使用时，从每个工作区包中移除某个依赖（或某些依赖）。

不在工作区内使用时，从所有子目录中发现的每个包中移除某个依赖（或某些依赖）。

### --global, -g

移除一个全局包，并从全局 bin 目录中解除其 bin 的链接。

### --save-dev, -D

仅从 `devDependencies` 中移除该依赖。

### --save-optional, -O

仅从 `optionalDependencies` 中移除该依赖。

### --save-prod, -P

仅从 `dependencies` 中移除该依赖。

### --lockfile-only

更新 `package.json` 和 `pnpm-lock.yaml`，但不改动 `node_modules`。

### --lockfile-dir <dir>

创建 `pnpm-lock.yaml` 的目录。不能与 `--global` 同时使用。

### --[no-]trust-lockfile

自 v12.3.0 起提供

移除一个包会重写锁文件，因此 `pnpm remove` 会像 `pnpm install` 那样针对当前生效的策略校验整个锁文件，而不只是被移除包的条目。`--trust-lockfile` 会跳过这次校验，[`trustLockfile`](/docs/settings/dependency-resolution#trustlockfile) 设置也是如此。`--no-trust-lockfile` 则会在配置信任锁文件时仍然校验它。

这些策略设置在这里也使用它们在 `pnpm install` 中的写法：[`--trust-policy`](/docs/settings/dependency-resolution#trustpolicy)、[`--trust-policy-exclude`](/docs/settings/dependency-resolution#trustpolicyexclude) 和 [`--trust-policy-ignore-after`](/docs/settings/dependency-resolution#trustpolicyignoreafter)。

### --filter <package_selector>

更多过滤说明见[过滤](/docs/filtering)。
