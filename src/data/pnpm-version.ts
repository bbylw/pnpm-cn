/**
 * 构建时从 npm registry 获取 pnpm 的最新版本。
 * 结果在单次构建内缓存，避免每个页面重复请求；网络不可用时回退到静态版本号。
 */
const FALLBACK = "12.x";
let cached: Promise<string> | undefined;

async function loadVersion(): Promise<string> {
  try {
    const response = await fetch("https://registry.npmjs.com/pnpm/latest", {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = (await response.json()) as { version?: unknown };
      if (typeof data.version === "string" && /^\d+\.\d+\.\d+/.test(data.version)) {
        return data.version;
      }
    }
  } catch {
    // 离线或请求失败时保留回退值
  }
  return FALLBACK;
}

export function getPnpmVersion(): Promise<string> {
  cached ??= loadVersion();
  return cached;
}
