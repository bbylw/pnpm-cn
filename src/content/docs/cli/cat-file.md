---
title: "pnpm cat-file"
headingIds: []
---

根据 `sha512-<base64>` 哈希值打印存储中的文件内容。[`pnpm cat-index`](/docs/cli/cat-index) 打印的十六进制 `digest` 不被接受。该哈希值既可以指向普通文件，也可以指向可执行文件。例如：

```bash
pnpm cat-file sha512-mvavhfVcEREI7d8dfvfvIkuBLnx7+rrkHHnPi8mpEDUlNpY4CUY+CvJ5mrrLl18iQYo1odFwBV7z/cOypG7xxQ==
```
