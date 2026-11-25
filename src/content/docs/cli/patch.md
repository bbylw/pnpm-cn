---
title: "pnpm patch <pkg>"
headingIds: ["options","--edit-dir--d-dir","--ignore-existing","configuration","patcheddependencies","allowunusedpatches"]
---

为包打补丁做准备（灵感来自 Yarn 中的类似命令）。

此命令会将包解压到 `node_modules/.pnpm_patches/<pkg>`，其中 `<pkg>` 就是传入的参数，例如 `foo` 或 `foo@1.0.0`（也可以通过 [`--edit-dir`](#--edit-dir--d-dir) 指定），这是一个你可以随意编辑的目录。

完成修改后，运行 `pnpm patch-commit <path>`（`<path>` 为你收到的目录）以生成补丁文件，并通过 [`patchedDependencies`](#patcheddependencies) 字段将其注册到顶层 manifest。

用法：

```sh
pnpm patch <pkg name>@<version>
```

请先运行 `pnpm install`。如果依赖尚未安装，该命令会失败并报错 `ERR_PNPM_PATCH_NO_LOCKFILE`。

如果安装了同一个包的多个版本，pnpm 会询问要给哪个版本打补丁，然后询问是否要把补丁应用到所有版本。如果应用到所有版本，`patchedDependencies` 的键就是不带版本的包名。

:::note[说明]

如果你想修改一个包的依赖，不要用打补丁来修改该包的 `package.json` 文件。如需覆盖依赖，请使用 [overrides](/docs/settings/dependency-resolution#overrides) 或[包钩子](/docs/pnpmfile#hooksreadpackagepkg-context-pkg--promisepkg)。

:::

## 选项

### --edit-dir, -d <dir>

需要打补丁的包会被解压到此目录。如果该目录已存在且不为空，命令会失败并报错 `ERR_PNPM_PATCH_EDIT_DIR_EXISTS`。不传此选项时，默认目录不为空会报错 `ERR_PNPM_EDIT_DIR_NOT_EMPTY`。

### --ignore-existing

打补丁时忽略已有的补丁文件。

## 配置

### patchedDependencies

运行 [pnpm patch-commit](/docs/cli/patch-commit) 时会自动添加/更新此字段。它使用一个字典来定义依赖的补丁，其中：

- **键**：包名，可带精确版本、版本范围，或仅为包名。
- **值**：补丁文件的相对路径。

示例：

```yaml
patchedDependencies:
  express@4.18.1: patches/express@4.18.1.patch
```

可以按版本范围对依赖打补丁。优先级顺序为：

1. 精确版本（最高优先级）
2. 版本范围
3. 仅包名的补丁（除非被覆盖，否则适用于所有版本）

示例：

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

示例：

```yaml
patchedDependencies:
  # Specialized sub-range
  "foo@2.2.0-2.8.0": patches/foo.2.2.0-2.8.0.patch
  # General patch, excluding the sub-range above
  "foo@>=2.0.0 <2.2.0 || >2.8.0": patches/foo.gte2.patch
```

大多数情况下，定义精确版本就足以覆盖更宽的范围。

### allowUnusedPatches

- 默认值：**false**
- 类型：**Boolean**

为 `true` 时，即使 `patchedDependencies` 字段中的部分补丁未被应用，安装也不会失败。

```yaml
patchedDependencies:
  express@4.18.1: patches/express@4.18.1.patch
allowUnusedPatches: true
```

补丁应用失败会导致安装失败。当一组中的多个补丁被应用时，其中一个失败不会阻止其余补丁被尝试；所有补丁错误会在最后一起报告。
