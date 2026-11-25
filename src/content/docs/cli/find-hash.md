---
title: "pnpm find-hash"
headingIds: []
---

:::warning[警告]

此命令为实验性命令

:::

列出包含指定哈希值文件的包。哈希值可以是 `sha512-<base64>` 形式，也可以是十六进制摘要，后者由 [`pnpm cat-index`](/docs/cli/cat-index) 打印。例如：

```bash
pnpm find-hash sha512-mvavhfVcEREI7d8dfvfvIkuBLnx7+rrkHHnPi8mpEDUlNpY4CUY+CvJ5mrrLl18iQYo1odFwBV7z/cOypG7xxQ==
```

每个匹配结果单独打印一行，格式为 `<name>@<version>`，后面跟着它在存储索引中的键。
