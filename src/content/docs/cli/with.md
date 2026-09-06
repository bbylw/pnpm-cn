---
title: "pnpm with"
headingIds: ["examples","related-settings","pmonfail"]
---

自 v11.0.0 起提供

在单次调用中按指定版本（或当前正在运行的版本）运行 pnpm，忽略项目清单的 `packageManager` 和 `devEngines.packageManager` 字段。

```bash
pnpm with <version|current> <args...>
```

下载的 pnpm 使用与 [pnpm self-update](/docs/cli/self-update) 相同的机制安装，并缓存到全局虚拟存储中，供后续运行复用。

## 示例

运行全局安装的 pnpm，忽略清单中锁定的版本：

```bash
pnpm with current install
```

运行指定版本：

```bash
pnpm with 12.3.4 install
```

使用 dist-tag：

```bash
pnpm with next install
```

## 相关设置

### pmOnFail

如果想永久跳过 `packageManager` / `devEngines.packageManager` 检查（例如因为版本管理由 asdf、mise、Volta 或类似工具处理），可将 [pmOnFail](/docs/settings/cli#pmonfail) 设置设为 `ignore`，而不必让每条命令都通过 `pnpm with` 运行：

pnpm-workspace.yaml

```yaml
pmOnFail: ignore
```
