---
title: "pnpm profile"
headingIds: ["commands","get","set","enable-2fa","disable-2fa","options","--registry-url","--json","-p---parseable","--otp-otp"]
---

修改 registry 账户档案上的设置。

```sh
pnpm profile get [<property>...]
pnpm profile set <property> <value>
pnpm profile set password
pnpm profile enable-2fa [auth-only|auth-and-writes]
pnpm profile disable-2fa
```

## 命令

### get

显示账户档案的所有属性，或显示指定属性的值（以制表符分隔）。

```sh
pnpm profile get
pnpm profile get email
```

### set

设置某个档案属性的值。可写的属性为 `email`、`fullname`、`homepage`、`freenode`、`twitter`、`github` 和 `password`。

```sh
pnpm profile set fullname "Example User"
```

`pnpm profile set password` 会提示输入当前密码和新密码。不要在命令行中传递密码。

### enable-2fa

启用双因素认证，或修改其模式。默认模式是 `auth-and-writes`。pnpm 会提示输入密码。首次设置时，pnpm 会显示用于验证器应用的二维码，要求输入其中的验证码，并打印你的恢复码。

该命令是交互式的，因此不支持 `--json` 或 `--parseable`。

```sh
pnpm profile enable-2fa
pnpm profile enable-2fa auth-only
```

### disable-2fa

为你的账户禁用双因素认证。pnpm 会提示输入密码。

```sh
pnpm profile disable-2fa
```

## 选项

### --registry <url>

npm registry 的基础 URL。

### --json

以 JSON 格式输出结果。

### -p, --parseable

以制表符分隔的格式输出结果。

### --otp <otp>

双因素验证器生成的一次性密码。
