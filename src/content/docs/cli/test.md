---
title: "pnpm test"
headingIds: []
---

别名： `t`, `tst`

等价于 `pnpm run test`。

运行包的 `scripts` 对象中 `test` 属性所指定的任意命令。

该属性的预期用途是指定一个为你的程序运行单元或集成测试的命令。

`pnpm test` 之后的参数会传给脚本：

```sh
pnpm test --watch
```
