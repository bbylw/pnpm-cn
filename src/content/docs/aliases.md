---
title: "别名"
headingIds: []
---

别名允许你以自定义名称安装包。

假设你的项目中到处都在使用 `lodash`。`lodash` 有一个会导致项目出错的 bug。你已经修好了，但 `lodash` 不会合并你的修复。通常你可以直接从自己的 fork 安装 `lodash`（作为 git 依赖），或者换个名字发布。如果选择后者，你就得把项目里所有的 require 都替换成新的依赖名（`require('lodash')` => `require('awesome-lodash')`）。有了别名，你还有第三个选择。

发布一个名为 `awesome-lodash` 的新包，并以 `lodash` 作为别名安装它：

```
pnpm add lodash@npm:awesome-lodash
```

无需改动任何代码。所有对 `lodash` 的 require 现在都会解析到 `awesome-lodash`。

npm 别名选择器有如下形式：

```text
<alias>@npm:<package>
<alias>@npm:<package>@<version-or-tag>
```

目标包可以是带作用域的。例如，下面这条会以本地名 `babel-core` 安装 `@babel/core` 的某个特定版本：

```sh
pnpm add babel-core@npm:@babel/core@8.0.6
```

别名是写入 `package.json` 并被你的代码使用的依赖名，`npm:` 之后的包是 pnpm 实际解析的包。这里的 `npm:` 是包别名协议，而不是[具名 registry](/docs/package-sources#named-registries)；目标包仍然使用它默认的或按作用域配置的 npm registry。

有时你会想在项目里同时使用同一个包的两个不同版本。很简单：

```bash
pnpm add lodash1@npm:lodash@1
pnpm add lodash2@npm:lodash@2
```

现在你可以通过 `require('lodash1')` 引用第一个版本的 lodash，通过 `require('lodash2')` 引用第二个。

要在不改动代码的情况下替换依赖图中各处的某个包，请使用 [`overrides`](/docs/settings/dependency-resolution#overrides)。

与钩子结合后，这会变得更加强大。也许你想用 `awesome-lodash` 替换 `node_modules` 中所有包里的 `lodash`。你可以通过下面这个 `.pnpmfile.mjs` 轻松实现：

```js
function readPackage(pkg) {
  if (pkg.dependencies && pkg.dependencies.lodash) {
    pkg.dependencies.lodash = 'npm:awesome-lodash@^1.0.0'
  }
  return pkg
}

export const hooks = {
  readPackage
}
```
