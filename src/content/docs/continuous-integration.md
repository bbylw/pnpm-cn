---
title: "持续集成"
headingIds: ["installing-pnpm","appveyor","azure-pipelines","bitbucket-pipelines","circleci","github-actions","gitlab-ci","jenkins","semaphore","travis"]
---

pnpm 可以轻松地用于各种持续集成系统。

## 安装 pnpm

在每个作业都运行于容器镜像的 CI 系统上，请使用[官方 pnpm 镜像](/docs/docker#official-pnpm-base-image) `ghcr.io/pnpm/pnpm` 作为作业镜像。pnpm 已经在 `PATH` 上，因此作业无需安装步骤，而 `pnpm runtime set node lts -g` 可以安装 Node.js。下面的 [Bitbucket Pipelines](#bitbucket-pipelines) 和 [GitLab CI](#gitlab-ci) 示例就使用了它。如果你的 Dockerfile 基于其它镜像（例如 `node:24`）构建，请[从官方镜像复制 pnpm](/docs/docker#adding-pnpm-to-your-own-image)。

在 GitHub Actions 之外（它有[自己的 action](#github-actions)），请用独立脚本安装 pnpm。如果 `get.pnpm.io` 无法访问，第二条命令会从最新的[安装器发布版本](https://github.com/pnpm/get.pnpm.io/releases/latest)下载同一份脚本：

```sh
{ curl -fsSL https://get.pnpm.io/ -o /tmp/pnpm-install.sh \
  || curl -fsSL https://github.com/pnpm/get.pnpm.io/releases/latest/download/install.sh -o /tmp/pnpm-install.sh; } \
  && sh /tmp/pnpm-install.sh
```

脚本会先保存到文件再运行，并且只有在某一次下载成功时才会运行，因此下载失败绝不会执行不完整的脚本。

有两点让这在 CI 中很方便：

- **不需要 Node.js。** pnpm 是自包含的可执行文件，之后可以用 `pnpm runtime set node lts -g` 为你安装运行时，因此任务一开始并不需要 Node.js 镜像。
- **跟随项目的版本。** 引导过程会安装最新的稳定版 pnpm，随后如果你的 `package.json` 中有 `packageManager` 或 `devEngines.packageManager` 字段，pnpm 会在首次使用时切换到该版本，因此流水线不必在两处锁定版本。

脚本安装到 `PNPM_HOME` 并向 shell 配置文件追加内容，而 CI 任务从不重新加载这些配置。你需要自行声明 `PNPM_HOME` 并把 `$PNPM_HOME/bin` 加入 `PATH`，使用平台提供的任意机制即可，下面的示例对每个平台都做了演示。

:::note[说明]

不要使用 Corepack。它每次调用都会通过一个 Node.js shim 来运行 pnpm。

:::

:::note[说明]

所有提供的配置文件中都缓存了存储。不过这并非必需，缓存存储也不保证能加快安装。因此你可以不在任务中缓存 pnpm 存储。

:::

:::tip[同时缓存元数据缓存]

[pnpm cache path](/docs/cli/cache-path) 会输出 pnpm 用于元数据缓存的目录，任务可以直接缓存它，无需复刻 pnpm 自身的路径解析。该目录还保存着锁文件校验日志，使任务可以跳过对未变更锁文件相对已配置[供应链策略](/docs/supply-chain-security)的重复检查。在存储预热之后，这是 CI 中安装开销的主要来源。

:::

:::important[重要]

只在受信任任务可写的位置缓存 pnpm 的存储与缓存目录。不要让不受信任的 CI 任务写入受信任任务随后会还原的存储或元数据缓存。这些目录属于受信任缓存，详见 [storeDir](/docs/settings/store#storedir) 和 [cacheDir](/docs/settings/other#cachedir) 设置。

:::

:::tip[CI 中的锁文件行为]

当 pnpm 检测到自己在 CI 中运行时，会自动切换到冻结锁文件模式。传入 `--no-frozen-lockfile` 可以退出该模式，也可以设置 [`ci`](/docs/settings/other#ci) 设置来强制启用或禁用 CI 检测。[pnpm ci](/docs/cli/ci) 会先运行 `pnpm clean`，然后执行一次冻结安装。pnpm 在 CI 中遇到不兼容的锁文件也会失败：如果锁文件由更新的 pnpm 主版本写入，安装将报错，而不是悄悄重写它。把 CI 中的 pnpm 版本升级到与生成锁文件时所用的版本一致。

:::

## AppVeyor

在 [AppVeyor](https://www.appveyor.com) 上，把以下内容加入你的 `appveyor.yml` 即可使用 pnpm 安装依赖：

appveyor.yml

```yaml
environment:
  PNPM_HOME: C:\pnpm

install:
  - ps: $env:PATH = "$env:PNPM_HOME;$env:PNPM_HOME\bin;$env:PATH"
  - ps: Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
  - ps: pnpm install
```

pnpm 自带运行时，因此不再需要 `Install-Product node`。如果你的构建脚本直接调用 `node`，添加 `pnpm runtime set node lts -g`。

## Azure Pipelines

在 Azure Pipelines 上，把以下内容加入你的 `azure-pipelines.yml` 即可使用 pnpm 安装并缓存依赖。下面的示例避免使用顶层 `variables:` 块，因此也可以复制到 steps 模板中：

azure-pipelines.yml

```yaml
steps:
  - task: Cache@2
    inputs:
      key: 'pnpm | "$(Agent.OS)" | pnpm-lock.yaml'
      path: $(Pipeline.Workspace)/.pnpm-store
    displayName: Cache pnpm

  - bash: |
      { curl -fsSL https://get.pnpm.io/ -o /tmp/pnpm-install.sh \
        || curl -fsSL https://github.com/pnpm/get.pnpm.io/releases/latest/download/install.sh -o /tmp/pnpm-install.sh; } \
        && sh /tmp/pnpm-install.sh
      echo "##vso[task.prependpath]$PNPM_HOME/bin"
      "$PNPM_HOME/bin/pnpm" config set store-dir "$PNPM_STORE_PATH"
    displayName: "Setup pnpm"
    env:
      PNPM_HOME: $(Pipeline.Workspace)/.pnpm
      PNPM_STORE_PATH: $(Pipeline.Workspace)/.pnpm-store

  - bash: |
      pnpm install
      pnpm run build
    displayName: "pnpm install and build"
    env:
      PNPM_HOME: $(Pipeline.Workspace)/.pnpm
```

此示例请使用 Linux 或 macOS agent。Azure Pipelines 会在每个步骤前展开任务输入和环境变量值中的 `$(Pipeline.Workspace)`。安装脚本用 Bash 语法读取它的变量。`task.prependpath` 会把 pnpm 加入后续步骤的 `PATH`。

## Bitbucket Pipelines

你可以使用 pnpm 安装并缓存依赖：

.bitbucket-pipelines.yml

```yaml
definitions:
  caches:
    pnpm: $BITBUCKET_CLONE_DIR/.pnpm-store

pipelines:
  pull-requests:
    "**":
      - step:
          name: Build and test
          image: ghcr.io/pnpm/pnpm:12
          script:
            - pnpm config set store-dir "$BITBUCKET_CLONE_DIR/.pnpm-store"
            - pnpm runtime set node lts -g
            - pnpm install
            - pnpm run build # Replace with your build/test…etc. commands
          caches:
            - pnpm
```

该示例从官方 pnpm 镜像开始，让 pnpm 安装 Node.js，并把 `store-dir` 指向缓存保存的目录。

## CircleCI

在 CircleCI 上，把以下内容加入你的 `.circleci/config.yml` 即可使用 pnpm 安装并缓存依赖：

.circleci/config.yml

```yaml
version: 2.1

jobs:
  build: # this can be any name you choose
    docker:
      - image: node:24
    environment:
      PNPM_HOME: /root/.local/share/pnpm

    steps:
      - checkout
      - restore_cache:
          name: Restore pnpm Package Cache
          keys:
            - pnpm-packages-{{ checksum "pnpm-lock.yaml" }}
      - run:
          name: Install pnpm package manager
          command: |
            { curl -fsSL https://get.pnpm.io/ -o /tmp/pnpm-install.sh \
              || curl -fsSL https://github.com/pnpm/get.pnpm.io/releases/latest/download/install.sh -o /tmp/pnpm-install.sh; } \
              && sh /tmp/pnpm-install.sh
            echo 'export PATH="$PNPM_HOME/bin:$PATH"' >> "$BASH_ENV"
            "$PNPM_HOME/bin/pnpm" config set store-dir .pnpm-store
      - run:
          name: Install Dependencies
          command: |
            pnpm install
      - save_cache:
          name: Save pnpm Package Cache
          key: pnpm-packages-{{ checksum "pnpm-lock.yaml" }}
          paths:
            - .pnpm-store
```

CircleCI 在每个步骤前都会加载 `$BASH_ENV`，pnpm 由此对后续步骤生效。

## GitHub Actions

在 GitHub Actions 上，可以按如下方式使用 pnpm 安装并缓存依赖（写入 `.github/workflows/NAME.yml`）：

.github/workflows/NAME.yml

```yaml
name: pnpm Example Workflow
on:
  push:

jobs:
  build:
    runs-on: ubuntu-24.04
    strategy:
      matrix:
        node-version: [24]
    steps:
      - uses: actions/checkout@v6
      - name: Install pnpm and Node.js
        uses: pnpm/setup@fa36a5ef7dcdefc3a7cb25655c122e00cf6e636e # v3.1.2
        with:
          runtime: node@${{ matrix.node-version }}
          cache: true
```

[pnpm/setup](https://github.com/pnpm/setup) 会安装 pnpm，然后用它安装所请求的运行时，因此不需要单独的 `actions/setup-node` 步骤。它还会为你运行 `pnpm install`，`cache: true` 会在多次运行之间缓存 pnpm 存储。如果你更想自己执行安装，设为 `install: false`。

pnpm 版本来自你的 `package.json` 中的 `packageManager` 或 `devEngines.packageManager` 字段，因此修改版本后工作流无需更新。如果你的 `package.json` 两者都没有，添加一个 `version` 输入。

## GitLab CI

在 GitLab 上，可以按如下方式使用 pnpm 安装并缓存依赖（写入 `.gitlab-ci.yml`）：

.gitlab-ci.yml

```yaml
stages:
  - build

build:
  stage: build
  image: ghcr.io/pnpm/pnpm:12
  before_script:
    - pnpm config set store-dir .pnpm-store
    - pnpm runtime set node 24 -g
  script:
    - pnpm install # install dependencies
  cache:
    key:
      files:
        - pnpm-lock.yaml
    paths:
      - .pnpm-store
```

## Jenkins

你可以使用 pnpm 安装你的依赖：

Jenkinsfile

```groovy
pipeline {
    agent {
        docker {
            image 'node:lts-bookworm-slim'
        }
    }
    environment {
        PNPM_HOME = "${WORKSPACE}/.pnpm"
        PATH = "${PNPM_HOME}/bin:${PATH}"
    }
    stages {
        stage('Build') {
            steps {
                sh '''
                    { curl -fsSL https://get.pnpm.io/ -o /tmp/pnpm-install.sh \\
                      || curl -fsSL https://github.com/pnpm/get.pnpm.io/releases/latest/download/install.sh -o /tmp/pnpm-install.sh; } \\
                      && sh /tmp/pnpm-install.sh
                '''
                sh 'pnpm install'
            }
        }
    }
}
```

每个 `sh` 步骤都在独立的 shell 中运行，因此 `PATH` 在流水线的 `environment` 块中设置，而不是在步骤内部 export。

## Semaphore

在 [Semaphore](https://semaphoreci.com) 上，把以下内容加入你的 `.semaphore/semaphore.yml` 文件即可使用 pnpm 安装并缓存依赖：

.semaphore/semaphore.yml

```yaml
version: v1.0
name: Semaphore CI pnpm example
agent:
  machine:
    type: e1-standard-2
    os_image: ubuntu2404
blocks:
  - name: Install dependencies
    task:
      env_vars:
        - name: PNPM_HOME
          value: /home/semaphore/.local/share/pnpm
      jobs:
        - name: pnpm install
          commands:
            - export PATH="$PNPM_HOME/bin:$PATH"
            - curl -fsSL https://get.pnpm.io/ -o /tmp/pnpm-install.sh || curl -fsSL https://github.com/pnpm/get.pnpm.io/releases/latest/download/install.sh -o /tmp/pnpm-install.sh
            - sh /tmp/pnpm-install.sh
            - checkout
            - cache restore node-$(checksum pnpm-lock.yaml)
            - pnpm install
            - cache store node-$(checksum pnpm-lock.yaml) $(pnpm store path)
```

## Travis

在 [Travis CI](https://travis-ci.org) 上，把以下内容加入你的 `.travis.yml` 文件即可使用 pnpm 安装依赖：

.travis.yml

```yaml
cache:
  npm: false
  directories:
    - "~/.pnpm-store"
env:
  global:
    - PNPM_HOME="$HOME/.local/share/pnpm"
    - PATH="$PNPM_HOME/bin:$PATH"
before_install:
  - curl -fsSL https://get.pnpm.io/ -o /tmp/pnpm-install.sh || curl -fsSL https://github.com/pnpm/get.pnpm.io/releases/latest/download/install.sh -o /tmp/pnpm-install.sh
  - sh /tmp/pnpm-install.sh
  - pnpm config set store-dir ~/.pnpm-store
install:
  - pnpm install
```
