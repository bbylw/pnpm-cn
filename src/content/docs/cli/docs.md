---
title: "pnpm docs"
headingIds: ["options","--registry-url","examples"]
---

自 v11.0.0 起提供

别名： `home`

在浏览器中打开某个包的文档（或主页）。

```sh
pnpm docs <pkg>[@<version>]
```

pnpm 会从 registry 获取该包的元数据。

如果包未声明有效的 `homepage`，pnpm 会退回到 `https://npmx.dev/package/<name>`。当无法打开浏览器时，pnpm 会打印该 URL。

## 选项

### --registry <url>

获取包元数据所使用的 registry。

## 示例

打开某个已发布包的文档：

```sh
pnpm docs lodash
```
