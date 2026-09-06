[简体中文](https://pnpm.io/zh/) |
[日本語](https://pnpm.io/ja/) |
[한국어](https://pnpm.io/ko/) |
[Italiano](https://pnpm.io/it/) |
[Português Brasileiro](https://pnpm.io/pt/)

<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://i.imgur.com/qlW1eEG.png">
  <source media="(prefers-color-scheme: dark)"  srcset="https://i.imgur.com/qlW1eEG.png">
  <img src="https://i.imgur.com/qlW1eEG.png" alt="pnpm">
</picture>

快速、节省磁盘空间的包管理器：

* **快速。** 比同类方案快达 2 倍（见[基准测试](#benchmark)）。
* **高效。** `node_modules` 中的文件都从单一内容寻址存储中硬链接而来。
* **[非常适合 monorepos（单体仓库）](https://pnpm.io/workspaces)。**
* **严格。** 一个包只能访问在其 `package.json` 中声明的依赖。
* **确定性。** 拥有名为 `pnpm-lock.yaml` 的锁文件。
* **可用作 Node.js 版本管理器。** 详见 [pnpm runtime](https://pnpm.io/11.x/cli/runtime)。
* **随处可用。** 支持 Windows、Linux 和 macOS。
* **久经考验。** 自 2016 年起，[各种规模的团队](https://pnpm.io/workspaces#usage-examples)都在生产环境中使用。
* **实验性 Rust 移植版。** 包含 [pacquet](https://github.com/pnpm/pnpm/tree/main/pnpm)，一个用 Rust 编写的实验性 CLI 移植版。
* [查看与 npm 和 Yarn 的完整功能对比](https://pnpm.io/feature-comparison)。

引用 [Rush](https://rushjs.io/) 团队的话：

> Microsoft 在 Rush 仓库中使用 pnpm 管理数百个项目，每天有数百个 PR，我们发现它非常快速且可靠。

[![npm version](https://img.shields.io/npm/v/pnpm.svg?label=latest)](https://github.com/pnpm/pnpm/releases/latest)
[![Ecosystem E2E](https://github.com/pnpm/pnpm/actions/workflows/ecosystem-e2e.yml/badge.svg?branch=main)](https://github.com/pnpm/pnpm/actions/workflows/ecosystem-e2e.yml)
[![OpenCollective](https://opencollective.com/pnpm/backers/badge.svg)](https://opencollective.com/pnpm)
[![OpenCollective](https://opencollective.com/pnpm/sponsors/badge.svg)](https://opencollective.com/pnpm)
[![X Follow](https://img.shields.io/twitter/follow/pnpmjs.svg?style=social&label=Follow)](https://x.com/intent/follow?screen_name=pnpmjs&region=follow_link)
[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

<!-- sponsors -->

## 白金赞助商

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://bit.cloud/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer"><img src="https://pnpm.io/img/users/bit.svg" width="80" alt="Bit"></a>
      </td>
      <td align="center" valign="middle">
        <a href="https://openai.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/openai_dark.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/openai_light.svg" />
            <img src="https://pnpm.io/img/users/openai_dark.svg" width="160" alt="OpenAI" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://notion.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer"><img src="https://pnpm.io/img/users/notion.svg" width="80" alt="Notion"></a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://coderabbit.ai/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/coderabbit.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/coderabbit_light.svg" />
            <img src="https://pnpm.io/img/users/coderabbit.svg" width="220" alt="CodeRabbit" />
          </picture>
        </a>
      </td>
    </tr>
  </tbody>
</table>

## 金牌赞助商

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://sanity.io/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/sanity.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/sanity_light.svg" />
            <img src="https://pnpm.io/img/users/sanity.svg" width="120" alt="Sanity" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://discord.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/discord.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/discord_light.svg" />
            <img src="https://pnpm.io/img/users/discord.svg" width="220" alt="Discord" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://vite.dev/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer"><img src="https://pnpm.io/img/users/vitejs.svg" width="42" alt="Vite"></a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://serpapi.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/serpapi_dark.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/serpapi_light.svg" />
            <img src="https://pnpm.io/img/users/serpapi_dark.svg" width="160" alt="SerpApi" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://stackblitz.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/stackblitz.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/stackblitz_light.svg" />
            <img src="https://pnpm.io/img/users/stackblitz.svg" width="190" alt="Stackblitz" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://workleap.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/workleap.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/workleap_light.svg" />
            <img src="https://pnpm.io/img/users/workleap.svg" width="190" alt="Workleap" />
          </picture>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://nx.dev/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/nx.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/nx_light.svg" />
            <img src="https://pnpm.io/img/users/nx.svg" width="50" alt="Nx" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://latitude.so/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer"><img src="https://pnpm.io/img/users/latitude.svg" width="160" alt="Latitude"></a>
      </td>
    </tr>
  </tbody>
</table>

## 银牌赞助商

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://replit.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/replit.png" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/replit_light.png" />
            <img src="https://pnpm.io/img/users/replit.png" width="140" alt="Replit" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://cybozu.co.jp/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer"><img src="https://pnpm.io/img/users/cybozu.svg" width="70" alt="Cybozu"></a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.bairesdev.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/bairesdev.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/bairesdev_light.svg" />
            <img src="https://pnpm.io/img/users/bairesdev.svg" width="160" alt="BairesDev" />
          </picture>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://www.thesys.dev/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/thesys.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/thesys_light.svg" />
            <img src="https://pnpm.io/img/users/thesys.svg" width="120" alt="Thesys" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://devowl.io/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer"><img src="https://pnpm.io/img/users/devowlio.svg" width="100" alt="devowl.io"></a>
      </td>
      <td align="center" valign="middle">
        <a href="https://uscreen.de/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/uscreen.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/uscreen_light.svg" />
            <img src="https://pnpm.io/img/users/uscreen.svg" width="180" alt="u|screen" />
          </picture>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://www.leniolabs.com/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer"><img src="https://pnpm.io/img/users/leniolabs.jpg" width="40" alt="Leniolabs_"></a>
      </td>
      <td align="center" valign="middle">
        <a href="https://depot.dev/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/depot.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/depot_light.svg" />
            <img src="https://pnpm.io/img/users/depot.svg" width="100" alt="Depot" />
          </picture>
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://cerbos.dev/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">
          <picture>
            <source media="(prefers-color-scheme: light)" srcset="https://pnpm.io/img/users/cerbos.svg" />
            <source media="(prefers-color-scheme: dark)" srcset="https://pnpm.io/img/users/cerbos_light.svg" />
            <img src="https://pnpm.io/img/users/cerbos.svg" width="90" alt="Cerbos" />
          </picture>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://time.now/?utm_source=pnpm&utm_medium=readme" target="_blank" rel="noopener noreferrer">⏱️ Time.now</a>
      </td>
    </tr>
  </tbody>
</table>

<!-- sponsors end -->

通过这个项目[成为赞助商](https://opencollective.com/pnpm#sponsor)来支持它。

## 背景

pnpm 使用内容寻址文件系统，将磁盘上所有模块目录的文件统一存储。
使用 npm 时，如果你有 100 个使用 lodash 的项目，磁盘上就会有 100 份 lodash 副本。
而在 pnpm 中，lodash 会被存放在内容寻址存储中，因此：

1. 如果你依赖不同版本的 lodash，只有存在差异的文件才会被加入存储。
  如果 lodash 有 100 个文件，而新版本仅改动其中 1 个文件，
  `pnpm update` 只会向存储中新增 1 个文件。
1. 所有文件都保存在磁盘上的同一个位置。安装包时，其文件会从该位置链接而来，
  不占用额外的磁盘空间。链接通过硬链接（hard-links）或引用链接（reflinks，写时复制）实现。

因此，你可以在磁盘上节省数 GB 空间，并获得快得多的安装速度！
如果你想了解更多关于 pnpm 创建的独特 `node_modules` 结构，以及它为何能在 Node.js 生态中良好运作的细节，请阅读这篇小文章：[扁平的 node_modules 并非唯一方式](https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way)。

💖 喜欢这个项目？发条 [tweet](https://r.pnpm.io/tweet) 让更多人知道吧

## 快速开始

- [安装](https://pnpm.io/installation)
- [使用](https://pnpm.io/pnpm-cli)
- [常见问题](https://pnpm.io/faq)
- [X](https://x.com/pnpmjs)
- [Bluesky](https://bsky.app/profile/pnpm.io)
- [Discord](https://r.pnpm.io/chat)

## 基准测试

pnpm 比 npm 和 Yarn classic 快达 2 倍。查看所有基准测试[此处](https://r.pnpm.io/benchmarks)。

在一个依赖众多的应用上的基准测试：

![](https://pnpm.io/img/benchmarks/alotta-files.svg)

## 许可证

采用 [MIT](https://github.com/pnpm/pnpm/blob/main/LICENSE) 许可证，但 [`pnpr/`](https://github.com/pnpm/pnpm/tree/main/pnpr) 目录除外——该目录使用 [PolyForm Shield License 1.0.0](https://github.com/pnpm/pnpm/blob/main/pnpr/LICENSE.md)，以源代码可见（source-available）方式授权。
