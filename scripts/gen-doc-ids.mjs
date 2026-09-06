import fs from "node:fs";
const files = fs
  .readdirSync("../_upstream/docs", { recursive: true })
  .map(String)
  .filter((p) => (p.endsWith(".md") || p.endsWith(".mdx")) && !p.split(/[\\/]/).pop().startsWith("_"))
  .map((p) => p.replace(/\\/g, "/").replace(/\.(md|mdx)$/, ""))
  .sort();
fs.mkdirSync("scripts/out", { recursive: true });
fs.writeFileSync("scripts/out/doc-ids.json", JSON.stringify(files, null, 1));
console.log(files.length, "pages");
console.log(files.filter((f) => f.includes("/")).length, "nested");
