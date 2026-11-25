---
title: "pnpm bin"
headingIds: ["options","--global--g"]
---

打印依赖的可执行文件被链接到的目录，即项目的 `node_modules/.bin`；若自定义了 [`modulesDir`](/docs/settings/node-modules#modulesdir)，则为 `<modulesDir>/.bin`。

```sh
$ pnpm bin
/path/to/project/node_modules/.bin
```

## 选项

### --global, -g

打印全局安装的可执行文件所在位置。
