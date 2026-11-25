---
title: "pnpm start"
headingIds: []
---

等价于 `pnpm run start`。

```sh
pnpm start [<args>...]
```

运行包的 `scripts` 对象中 `start` 属性所指定的任意命令。`pnpm start` 之后的参数会原样传给脚本。

若 `scripts` 对象上没有指定 `start` 属性，当项目目录中存在 `server.js` 时，pnpm 会运行 `node server.js`。当 [`enablePrePostScripts`](/docs/settings/other#enableprepostscripts) 开启时，`prestart` 与 `poststart` 脚本仍会在其前后运行。若两者都不存在，该命令会以 `Missing script start or file server.js` 失败。

该属性的预期用途是指定一个启动你的程序的命令。
