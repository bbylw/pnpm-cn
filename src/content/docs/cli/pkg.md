---
title: "pnpm pkg"
headingIds: ["commands","get","set","delete","fix","options","--json","--recursive--r"]
---

自 v11.3.0 起提供

从命令行管理 `package.json` 的内容。

```bash
pnpm pkg get [<key> [<key> ...]]
pnpm pkg set <key>=<value> [<key>=<value> ...]
pnpm pkg delete <key> [<key> ...]
pnpm pkg fix
```

嵌套字段使用点分隔路径定位（例如 `scripts.test`、`repository.url`）。

## 命令

### get

从 `package.json` 获取值。不带参数时打印完整 manifest；带一个或多个键时打印所请求的字段。

```bash
pnpm pkg get name
pnpm pkg get name version
pnpm pkg get scripts.test
```

当仅请求一个键且其解析为字符串时，打印原始值；否则以 JSON 编码输出该值。传入 `--json` 可始终打印 JSON。

### set

在 `package.json` 中设置一个或多个值。每个参数采用 `key=value` 形式。

```bash
pnpm pkg set name=my-package
pnpm pkg set scripts.build="tsc -p ."
pnpm pkg set 'keywords[0]'=cli
```

默认情况下，值以字符串形式存储。传入 `--json` 可在存储前将值解析为 JSON（适用于布尔值、数字、数组和对象）：

```bash
pnpm pkg set private=true --json
pnpm pkg set 'engines={"node":">=22"}' --json
```

### delete

从 `package.json` 中移除一个或多个键。

```bash
pnpm pkg delete scripts.test
pnpm pkg delete keywords
```

### fix

自动纠正 `package.json` 中的常见错误（例如移除非字符串的 `name` 或 `version`，删除值不是对象的依赖 / `scripts` 块，删除既不是字符串也不是对象的 `bin` 字段）。

```bash
pnpm pkg fix
```

## 选项

### --json

设置时，在写入前将每个 `value` 解析为 JSON。获取单个键时，返回 JSON 编码形式而非原始值。

### --recursive, -r

对每个工作区项目运行该子命令，或对所有被 `--filter` 选中的项目运行。

```bash
pnpm -r pkg get name
pnpm -r pkg set version=1.0.0
pnpm --filter "./packages/*" pkg get name
```

`pnpm -r pkg get` 返回一个以包名为键的 JSON 对象；`set`、`delete` 和 `fix` 会应用于每个匹配的项目。
