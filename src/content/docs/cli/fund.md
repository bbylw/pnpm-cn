---
title: "pnpm fund"
headingIds: ["options","--json","--which-number"]
---

按资助链接分组，列出已安装依赖的资助信息。

```sh
pnpm fund
pnpm fund --json
pnpm --recursive fund
pnpm --filter my-app fund
```

`pnpm fund <package>` 会打开该包最新已安装版本的资助链接。你也可以传入项目路径，例如 `pnpm fund .`。未安装的包不会从 registry 拉取。

如果一个包列出了多个资助链接，pnpm 会打印带编号的列表。使用 `pnpm fund <package> --which <number>` 打开其中之一。编号从 1 开始。

## 选项

### --json

以 JSON 格式打印资助报告。递归运行和带过滤条件的运行会打印一个报告数组，每个选中的项目对应一项。

### --which <number>

当一个包列出多个资助来源时，指定要打开的资助链接。
