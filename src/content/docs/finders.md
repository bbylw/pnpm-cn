---
title: "查找器"
headingIds: ["defining-finder-functions","finder-context-ctx","using-finders","returning-extra-metadata"]
---

自 v10.16.0 起提供

查找器函数允许你**通过包的任意属性（而不仅是名称）搜索依赖图**。它们可以声明在 [.pnpmfile.mjs](/docs/pnpmfile) 中，并与 [pnpm list](/docs/cli/list) 和 [pnpm why](/docs/cli/why) 一起使用。

## 定义查找器函数

查找器函数在你项目的 [.pnpmfile.mjs](/docs/pnpmfile) 文件中、在 finders 导出下声明。每个函数接收一个上下文对象，并且必须返回以下之一：

- `true` → 在结果中包含此依赖，
- `false` → 跳过它，
- 或一个 `string` → 包含此依赖并将该字符串作为附加信息打印出来。

示例：一个匹配 `peerDependencies` 中含有 **React 17** 的任意依赖的查找器：

.pnpmfile.mjs

```js
export const finders = {
  react17: (ctx) => {
    return ctx.readManifest().peerDependencies?.react === "^17.0.0"
  }
}
```

### 查找器上下文 (ctx)

每个查找器函数接收一个上下文对象，描述正在访问的依赖节点。

| **Field** | **类型/示例** | **Description** |
| --- | --- | --- |
| `name` | `"minimist"` | 包名。 |
| `version` | `"1.2.8"` | 包版本。 |
| `readManifest()` | 返回 `package.json` 对象 | 加载包清单（用于读取 `peerDependencies`、`license`、`engines` 等字段）。 |

## 使用查找器

你可以使用 `--find-by=<functionName>` 标志调用一个查找器：

```
pnpm why --find-by=react17
```

Output:

```
@apollo/client 4.0.4
├── @graphql-typed-document-node/core 3.2.0
└── graphql-tag 2.12.6
```

## 返回额外元数据

查找器也可以返回一个字符串。该字符串将在输出中与匹配到的包一起显示。

示例：打印包的许可证：

```js
export const finders = {
  react17: (ctx) => {
    const manifest = ctx.readManifest()
    if (manifest.peerDependencies?.react === "^17.0.0") {
      return `license: ${manifest.license}`
    }
    return false
  }
}
```

Output:

```
@apollo/client 4.0.4
├── @graphql-typed-document-node/core 3.2.0
│   license: MIT
└── graphql-tag 2.12.6
    license: MIT
```

其他示例用例：

- 查找所有具有特定许可证的包。
- 检测要求最低 Node.js 版本的包。
- 列出所有公开二进制文件的依赖。
- 打印所有包的资助 URL。
