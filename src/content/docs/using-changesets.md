---
title: "在 pnpm 中使用 Changesets"
headingIds: ["setup","adding-new-changesets","releasing-changes","integration-with-github-actions","add-a-publish-script","add-the-workflow"]
---

:::tip[提示]

自 v11.13.0 起，pnpm 无需 Changesets CLI 就能原生管理工作区发布。它读写相同的 `.changeset/*.md` 文件。参见[发布管理](/docs/versioning)。

自 v11.16.0 起，[pnpm update --changeset](/docs/cli/update#--changeset) 还能为一次更新所做的依赖版本提升写入一个 changeset。

:::

:::note[说明]

在撰写本文档时，最新的 pnpm 版本是 v10.4.1。最新的 [Changesets](https://github.com/changesets/changesets) 版本是 v2.28.0。

:::

## 设置

要在 pnpm 工作区上设置 changesets，将 changesets 作为开发依赖安装在工作区根目录：

```bash
pnpm add -Dw @changesets/cli
```

然后运行 changesets 的 init 命令以生成 changesets 配置：

```bash
pnpm changeset init
```

## 添加新的 changesets

要生成一个新的 changeset，在仓库根目录运行 `pnpm changeset`。在 `.changeset` 目录中生成的 markdown 文件应提交到仓库。

## 发布变更

1. 运行 `pnpm changeset version`。这会提升之前用 `pnpm changeset` 指定的包（以及它们的任何依赖方）的版本，并更新变更日志文件。
2. 运行 `pnpm install`。这会更新锁文件并重新构建包。
3. 提交这些更改。
4. 运行 `pnpm publish -r`。此命令将发布所有版本已提升但 registry 中尚不存在的包。

## 与 GitHub Actions 集成

要将此过程自动化，你可以在 GitHub Actions 中使用 `changeset version`。该 action 会在 changeset 文件进入 `main` 分支时检测到，然后新建一个列出所有已提升版本包的 PR。每当有新的 changeset 文件进入 `main`，该 PR 都会自动更新自己。一旦合并，包就会被更新，并且如果在 action 上指定了 `publish` 输入，它们将使用给定的命令发布。

### 添加发布脚本

添加一个名为 `ci:publish` 的新脚本，执行 `pnpm publish -r`。一旦 `changeset version` 创建的 PR 被合并，它就会发布到 registry。如果该包是公共且带 scope 的，可能需要添加 `--access=public`，以防止 npm 拒绝发布。

**package.json**

```json
{
   "scripts": {
      "ci:publish": "pnpm publish -r"
   },
   ...
}
```

### 添加工作流

在 `.github/workflows/changesets.yml` 添加一个新的工作流。此工作流会创建新的分支和 PR，因此应在仓库设置（`github.com/<repo-owner>/<repo-name>/settings/actions`）中为 Actions 授予**读取和写入**权限。如果在 `changesets/action` 步骤中包含 `publish` 输入，仓库还应包含一个名为 `NPM_TOKEN` 的 npm 认证令牌作为仓库密钥。

**.github/workflows/changesets.yml**

```yaml
name: Changesets

on:
  push:
    branches:
      - main

env:
  CI: true

jobs:
  version:
    timeout-minutes: 15
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code repository
        uses: actions/checkout@v4

      - name: Setup pnpm and Node.js
        uses: pnpm/setup@v2
        with:
          runtime: node@20
          cache: true
      
      - name: Create and publish versions
        uses: changesets/action@v1
        with:
          commit: "chore: update versions"
          title: "chore: update versions"
          publish: pnpm ci:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

有关 changesets action 的更多信息和文档可在[此处](https://github.com/changesets/action)找到。
