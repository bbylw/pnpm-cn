---
title: "pnpm docs"
headingIds: ["examples"]
---

自 v11.0.0 起提供

别名： `home`

在浏览器中打开某个包的文档（或主页）。

```bash
pnpm docs [<pkg> ...]
```

在包目录内不带参数运行时，会打开当前项目的文档。

如果包未声明有效的 `homepage`，pnpm 会退回到 `https://npmx.dev/package/<name>`。

## 示例

打开某个已发布包的文档：

```bash
pnpm docs lodash
```

一次打开多个包的文档：

```bash
pnpm docs react react-dom
```

打开当前项目的文档：

```bash
pnpm docs
```
