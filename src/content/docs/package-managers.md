---
title: "其他包管理器"
headingIds: ["where-each-one-comes-from","declaring-the-package-manager-of-a-project","runtimes","installing-one-globally","running-one-for-a-single-command","preparing-a-git-hosted-dependency","what-changes-for-a-project-coming-from-v11"]
---

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

pnpm 安装的包管理器不只是它自己：还有 **npm**、**Yarn Classic**、**Yarn Berry**、**Yarn 6**（`yarnpkg/zpm`）和 **Bun**。其中经 npm 发布的成员通过受信任的包管理器 registry 解析和拉取，并在执行某个精确版本之前对照 npm 的签名校验该版本，这正是 pnpm 切换自身版本时无需询问的同一标准。而 Yarn 6 和 Bun 以各自项目提供的平台归档形式发布，由发布者校验和锁定。

在没有 Node.js 的机器上，JavaScript 包管理器会获得一个受管理的 LTS 运行时供其运行，因此这一切都不需要你自行安装 Node.js。

三种场景会用到它：

- **git 托管的依赖**会用其要求的包管理器来准备，参见[准备 git 托管的依赖](#preparing-a-git-hosted-dependency)；
- [pnpm dlx](/docs/cli/pnx#running-a-package-manager-or-a-runtime)（`pnx`）为单条命令运行某个包管理器；
- [pnpm shim add](/docs/cli/shim) 链接一个命令，使其按当前项目锁定的版本运行。

## 各自的来源

| **包管理器** | **提供方** |
| --- | --- |
| npm | registry 上的 `npm` 包 |
| Yarn Classic (`<2`) | registry 上的 `yarn` 包 |
| Yarn Berry (`2` – `5`) | registry 上的 `@yarnpkg/cli-dist` 包 |
| Yarn 6 | `yarnpkg/zpm` 发布归档 |
| Bun | `oven-sh/bun` 发布归档 |

经 registry 发布的成员与 pnpm 自身的引擎走同一套解析、校验、安装管线。以平台归档形式提供的成员由发布者校验和锁定，与[受管理的运行时](/docs/cli/runtime)相同。

每个包管理器都解析到 pnpm 主目录下各自的环境锁文件中，因此一个包管理器的锁定永不改写另一个的。

## 声明项目的包管理器

在 `pnpm add` 中指名某个包管理器时，记录的是项目使用该管理器，而不是安装与其同名的 npm 包：

```bash
pnpm add yarn@4
```

声明会被写到相应包管理器读取它的位置：

- **Yarn** 经由项目的 `packageManager` 字段锁定来启动，该字段只接受精确版本。因此所请求的版本行会先解析再写入：`pnpm add yarn@4` 记录 `"packageManager": "yarn@4.18.0"`。在 Yarn Classic 线（`<2`）上，锁定的产物是 npm tarball，因此值中还带有该 tarball 的 `+sha512.…` 完整性信息：`"packageManager": "yarn@1.22.22+sha512.…"`。
- **其他所有包管理器**都记录在 [devEngines.packageManager](/docs/package_json#devenginespackagemanager) 中，该字段存放版本范围。

两个字段最终只会留下一个：它们声明的是同一件事，而两份声明互相矛盾的项目会被版本切换器拒绝运行。

package.json

```json
{
  "devEngines": {
    "packageManager": {
      "name": "npm",
      "version": "^11.0.0"
    }
  }
}
```

以下两点有意不在其覆盖范围内：

- **pnpm 自身。**修改 pnpm 自己的锁定会让下一条命令切换正在运行的 CLI，这是 [pnpm self-update](/docs/cli/self-update) 有意承担的职责，而不是 `add` 顺带的副作用。
- **带过滤的选择。**项目使用哪个包管理器是项目自身的声明，因此 `pnpm add yarn --filter …` 会以 `ERR_PNPM_PACKAGE_MANAGER_IN_SELECTION` 失败。在项目自身目录中运行该命令。

指定的是*包*的位置、而非请求某个发布版本的说明符，仍会按普通依赖安装其所指的内容：

```bash
pnpm add yarn@npm:yarn@1.22.22
pnpm add yarn@yarnpkg/berry
```

除 pnpm 外，其他包管理器的解析版本不会写入 `pnpm-lock.yaml`，而是锁定在 pnpm 主目录下各自的环境锁文件中。项目锁文件中只记录 pnpm 自身的锁定，位于 `packageManagerDependencies` 下。

### 运行时

`pnpm add` 对运行时遵循同样的规则：指名 `node` 或 `deno` 会将其记录在 `engines.runtime` 下，正如已有的显式写法 `node@runtime:22` 那样。

`bun` 既是运行时也是包管理器，且包管理器优先响应：`pnpm add bun` 会把它声明为项目的包管理器。要将其作为运行时添加，需指名版本：`pnpm add bun@runtime:1.3.0`。

## 全局安装某个包管理器

```bash
pnpm add -g yarn
```

安装的是当前的 Yarn 发布线，而不是 npm 上仅指向 Classic 的 `yarn` 包；`pnpm add -g node@22` / `pnpm add -g deno@2` 安装的是对应的 Node.js 或 Deno 发行版本身，而不是一个替你下载它们的包装包。

全局安装的包管理器同样遵循项目的版本锁定，就像全局安装的 Node.js 遵循 [devEngines.runtime](/docs/package_json#devenginesruntime) 一样：在项目锁定版本之处运行锁定版本，其余场合以全局安装的副本作为回退。pnpm 通过为该包管理器添加一条 [globalShims](/docs/settings/other#globalshims) 条目来实现这一点，除非你已经自行决定：显式条目（包括 `false`）会按你设置的值保留。

关于版本如何选择以及 pnpm 何时请求确认，参见[项目感知的全局命令](/docs/global-packages#project-aware-global-bins)。

## 为单条命令运行某个包管理器

```bash
pnx yarn@4 install
pnx npm@11 ci
pnx bun@1.3.0 install
```

See [Running a package manager or a runtime](/docs/cli/pnx#running-a-package-manager-or-a-runtime).

## 准备 git 托管的依赖

需要在安装前先构建的 [git 托管的依赖](/docs/package-sources#git-repository)，会用其自身要求的包管理器来准备，而不是宿主恰好装了什么就用什么：

- 其 `packageManager` / `devEngines.packageManager` 锁定会被遵循；
- 若无锁定，则由随包附带的锁文件指名的包管理器决定：且 Yarn Classic 写出的 `yarn.lock` 不再由 Yarn Berry 安装。Berry 会为自己写出的每个锁文件打上 `__metadata:` 标记，而两条线无法读取对方的锁文件，因此「是谁写的」是一项约束，而非偏好。

当依赖锁定了版本，或宿主无法满足依赖所需时，pnpm 会提供该包管理器：因此用 Yarn 构建的仓库如今在只装了 pnpm 的机器上也能安装，而已经拥有合适管理器的宿主则继续用自己的。

## 从 v11 迁移过来的项目有何变化

| **Command** | **v11** | **v12** |
| --- | --- | --- |
| `pnpm add yarn` | 安装名为 `yarn` 的 npm 包 | 记录项目的包管理器（该包仍可通过 `pnpm add yarn@npm:yarn@1.22.22` 安装） |
| `pnpm add -g yarn` | 安装 Yarn Classic | 安装当前的 Yarn 发布线 |
| `pnpm add -g node` / `pnpm add -g deno` | 安装一个下载构建产物的包装包 | 安装对应的 Node.js 或 Deno 发行版 |
| `pnx node` / `pnx deno` | 运行包装包 | 运行该发行版 |
| 全局安装的包管理器 | 始终使用全局副本 | 在项目有锁定时遵循项目的锁定 |
