---
title: "pnpm bugs"
headingIds: ["options", "--registry-url", "examples"]
---

自 v11.1.0 起提供

在浏览器中打开某个包的缺陷跟踪 URL。

```bash
pnpm bugs [<pkg> ...]
```

在包目录内不带参数运行时，它会打开当前项目的缺陷跟踪器（使用 `package.json` 中的 `bugs` 字段）。

当传入一个或多个包名时，pnpm 从 registry 获取每个包的元数据并打开其缺陷跟踪器。

如果某个包未声明 `bugs` 字段，pnpm 会回退到由 `repository` 字段派生的 `<repository>/issues`。

## 选项

### --registry <url>

获取所命名包的元数据所用的 registry。

## 示例

打开一个已发布包的缺陷跟踪器：

```bash
pnpm bugs lodash
```

一次性打开多个包的缺陷跟踪器：

```bash
pnpm bugs react react-dom
```

打开当前项目的缺陷跟踪器：

```bash
pnpm bugs
```
