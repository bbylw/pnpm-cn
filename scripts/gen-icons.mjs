import fs from "node:fs";
const DIR = "node_modules/@phosphor-icons/core/assets/regular";
const WANTED = [
  "check", "x", "arrow-right", "arrow-up-right", "arrows-clockwise", "terminal", "code",
  "package", "cube", "database", "hard-drive", "hdd", "lightning", "shield-check", "seal-check",
  "git-branch", "folder", "folder-simple", "file", "link-simple", "list", "funnel", "gear",
  "cpu", "monitor", "users", "user-circle", "globe", "github-logo", "discord-logo", "bluesky-logo",
  "sun", "moon", "clipboard", "book-open", "book-bookmark", "fast-forward", "magic-wand",
  "squares-four", "storefront", "warehouse", "stack", "files", "copy", "export", "question",
  "info", "warning-circle", "sparkle", "caret-right", "caret-down", "magnifier", "lock-key",
  "trash", "floppy-disk", "calendar-blank", "tag", "percent", "quotes", "x-logo", "bluesky-logo",
  "gauge", "timer", "check-circle", "hand-thumb-up", "confetti", "arrow-line-down", "download",
];
const items = [];
for (const n of WANTED) {
  const p = `${DIR}/${n}.svg`;
  if (!fs.existsSync(p)) continue;
  const svg = fs.readFileSync(p, "utf8");
  const inner = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1].trim();
  items.push([n, inner]);
}
const body = items
  .map(([n, inner]) => `  ${JSON.stringify(n)}: ${JSON.stringify(inner)},`)
  .join("\n");
const out = `// 由 scripts/gen-icons.mjs 生成。图标数据取自 @phosphor-icons/core（Apache-2.0）
export const ICONS = {
${body}
} as const;

export type IconName = keyof typeof ICONS;
`;
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("src/data/icons.ts", out);
console.log(items.length, "icons embedded");
