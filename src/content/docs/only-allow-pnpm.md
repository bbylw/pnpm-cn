---
title: "仅允许 pnpm"
headingIds: []
---

当你在项目中使用 pnpm 时，你不会希望其他人误跑 `npm install` 或 `yarn`。要阻止开发者使用其他包管理器，可以在 `package.json` 中添加以下 `preinstall` 脚本：

```json
{
	"scripts": {
		"preinstall": "npx only-allow pnpm"
	}
}
```

此后每当有人运行 `npm install` 或 `yarn`，得到的都会是错误，安装不会继续。

当脚本恰好是 `npx only-allow pnpm` 时，pnpm 会跳过它，因此不会拖慢 `pnpm install`。

若想在不使用脚本的情况下固定 `package.json` 中的包管理器，请使用 [`devEngines.packageManager`](/docs/package_json#devenginespackagemanager)。
