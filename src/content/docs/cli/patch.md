---
title: "pnpm patch <pkg>"
headingIds: ["options","--edit-dir-dir","--ignore-existing","configuration","patcheddependencies","allowunusedpatches"]
---

为包打补丁做准备（灵感来自 Yarn 中的类似命令）。

此命令会将包解压到一个临时目录，供你随意编辑。

完成修改后，运行 `pnpm patch-commit <path>`（`<path>` 为你收到的临时目录）以生成补丁文件，并通过 [patchedDependencies](#patcheddependencies) 字段将其注册到顶层 manifest。

Usage:

```
pnpm patch <pkg name>@<version>
```

:::note[说明]

如果你想修改一个包的依赖，不要用打补丁来修改该包的 `package.json` 文件。如需覆盖依赖，请使用 [overrides](/docs/settings/dependency-resolution#overrides) 或[包钩子](/docs/pnpmfile#hooksreadpackagepkg-context-pkg--promisepkg)。

:::

## 选项

### --edit-dir <dir>

需要打补丁的包会被解压到此目录。

### --ignore-existing

打补丁时忽略已有的补丁文件。

## 配置

### patchedDependencies

运行 [pnpm patch-commit](/docs/cli/patch-commit) 时会自动添加/更新此字段。它使用一个字典来定义依赖的补丁，其中：

- **键**：包名，可带精确版本、版本范围，或仅为包名。
- **值**：补丁文件的相对路径。

Example:

```yaml
patchedDependencies:
  express@4.18.1: patches/express@4.18.1.patch
```

可以按版本范围对依赖打补丁。优先级顺序为：

1. 精确版本（最高优先级）
2. 版本范围
3. 仅包名的补丁（除非被覆盖，否则适用于所有版本）

特殊情况：版本范围 `*` 的行为类似仅包名的补丁，但不会忽略补丁失败。

Example:

```yaml
patchedDependencies:
  foo: patches/foo-1.patch
  foo@^2.0.0: patches/foo-2.patch
  foo@2.1.0: patches/foo-3.patch
```

- `patches/foo-3.patch` 应用于 `foo@2.1.0`。
- `patches/foo-2.patch` 应用于所有匹配 `^2.0.0` 的 foo 版本，`2.1.0` 除外。
- `patches/foo-1.patch` 应用于所有其他 foo 版本。

避免版本范围重叠。如果你需要对某个子范围单独处理，请从更宽的范围中显式排除它。

Example:

```yaml
patchedDependencies:
  # Specialized sub-range
  "foo@2.2.0-2.8.0": patches/foo.2.2.0-2.8.0.patch
  # General patch, excluding the sub-range above
  "foo@>=2.0.0 <2.2.0 || >2.8.0": patches/foo.gte2.patch
```

大多数情况下，定义精确版本就足以覆盖更宽的范围。

### allowUnusedPatches

自 v10.7.0 起提供（曾用名 `allowNonAppliedPatches`）

- 默认值：**false**
- 类型：**Boolean**

为 `true` 时，即使 `patchedDependencies` 字段中的部分补丁未被应用，安装也不会失败。

```yaml
patchedDependencies:
  express@4.18.1: patches/express@4.18.1.patch
allowUnusedPatches: true
```

:::note[说明]

在 v11 中，补丁应用失败总是抛出错误：`ignorePatchFailures` 设置已被移除。当一组中的多个补丁被应用时，其中一个失败不会阻止其余补丁被尝试；所有补丁错误会在最后一起报告。

:::
