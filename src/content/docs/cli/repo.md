---
title: "pnpm repo"
headingIds: ["examples","options","--registry-url"]
---

自 v11.3.0 起提供

在浏览器中打开包的仓库 URL。

```bash
pnpm repo [<pkg> ...]
```

不带参数时，打开当前项目的仓库（读取自 `package.json` 的 `repository` 字段）。

带有一个或多个包名时，从 registry 拉取每个包的元数据并打开其仓库 URL。

仓库 URL 会归一化为对应的 Web 地址，例如 `git+ssh://git@github.com/foo/bar.git` 会打开为 `https://github.com/foo/bar`。当 `repository` 字段包含 `directory` 时，URL 指向仓库内的该子目录。

## 示例

```bash
# Open the repo of the current project
pnpm repo

# Open the repo of a package on the registry
pnpm repo lodash

# Open multiple repos at once
pnpm repo react react-dom
```

## 选项

### --registry <url>

给出显式包名时，从中拉取包元数据的 registry。按 scope 与命名的 registry（通过 [registries](/docs/settings/dependency-resolution#registries) 和 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 配置）均会被遵循。
