---
title: "pnpm prune"
headingIds: ["options","--prod","--no-optional"]
---

移除不必要的包。

## 选项

### --prod

移除 `devDependencies` 中指定的包。

### --no-optional

移除 `optionalDependencies` 中指定的包。

:::warning[warning]

prune 命令目前不支持在 monorepo 上递归执行。若要在 monorepo 中仅安装生产依赖，可以删除 `node_modules` 目录，然后用 `pnpm install --prod` 重新安装。

:::
