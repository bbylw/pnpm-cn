---
title: "pnpm start"
headingIds: []
---

别名： `run start`

运行包的 `scripts` 对象中 `start` 属性所指定的任意命令。如果 `scripts` 对象上没有指定 `start` 属性，它会尝试以默认方式运行 `node server.js`，若两者都没有则失败。

该属性的预期用途是指定一个启动你的程序的命令
