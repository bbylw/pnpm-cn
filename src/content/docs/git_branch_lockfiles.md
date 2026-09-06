---
title: "Git 分支锁文件"
headingIds: ["use-git-branch-lockfiles","merge-git-branch-lockfiles","pnpm-install---merge-git-branch-lockfiles","branch-matching"]
---

Git 分支锁文件让你可以完全避免锁文件合并冲突，稍后再解决它们。

## 使用 git 分支锁文件

你可以通过配置 `pnpm-workspace.yaml` 文件来开启此功能。

```yaml
gitBranchLockfile: true
```

这样做之后，锁文件名将根据当前分支名生成。

例如，当前分支名是 `feature-1`。那么，生成的锁文件名将是 `pnpm-lock.feature-1.yaml`。你可以将它提交到 Git，并稍后合并所有 git 分支锁文件。

```
- <project_folder>
|- pnpm-lock.yaml
|- pnpm-lock.feature-1.yaml
|- pnpm-lock.<branch_name>.yaml
```

:::note[说明]

`feature/1` 比较特殊，因为 `/` 会自动转换为 `!`，所以对应的锁文件名将是 `pnpm-lock.feature!1.yaml`。

:::

## 合并 git 分支锁文件

### `pnpm install --merge-git-branch-lockfiles`

要合并所有 git 分支锁文件，只需向 `pnpm install` 命令指定 `--merge-git-branch-lockfiles`。

之后，所有 git 分支锁文件将被合并为一个 `pnpm-lock.yaml`

### 分支匹配

pnpm 允许你通过匹配当前分支名来指定 `--merge-git-branch-lockfiles`。

例如，在 `pnpm-workspace.yaml` 文件中进行以下设置后，在 `main` 分支以及分支名以 `release` 开头的分支中运行时，`pnpm install` 将合并所有 git 分支锁文件。

```yaml
mergeGitBranchLockfilesBranchPattern:
- main
- release*
```
