/**
 * 抓取 pnpm.io 官方文档 → Astro 内容集合 Markdown
 *
 * 策略：
 *  - 默认抓 zh 版（https://pnpm.io/zh/<id>，默认路由 = 12.x 当前版）。
 *  - 页面级语言检测：正文中文字符占比过低 → 改抓 en 版并把所有文本块标记为待译。
 *  - 块级语言检测：zh 页里 Crowdin 漏译的英文段落逐块标记。
 *  - 标题提取为待译清单（官方 zh 标题多数未译），锚点 id 原样保留到 frontmatter.headingIds。
 *  - 图片下载到 public/img/，文档内部链接重写为 /docs/...，其余回落 pnpm.io 绝对链接。
 *
 * 产物：
 *  - src/content/docs 下的 .md（带 T:bid 哨兵注释）
 *  - scripts/out/blocks.jsonl  待译清单 {p,b,k,t}
 *  - scripts/out/pages.json    每页 {source, coverage, url}
 *  - public/img/**             图片资产
 */
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";

const ORIGIN = "https://pnpm.io";
const DOC_IDS = new Set(JSON.parse(fs.readFileSync("scripts/out/doc-ids.json", "utf8")));
const OUT_DIR = "src/content/docs";
const IMG_DIR = "public/img";
const blocks = [];
const pageMeta = {};
const images = new Set();
let CUR_PAGE = "";

let BLOCK_SEQ = 0;
const newBlockId = (page) => `${page}#${BLOCK_SEQ++}`;

const hasCJK = (s) => /[㐀-䶿一-鿿]/.test(s);
function cjkRatio(s) {
  const letters = s.match(/[A-Za-z㐀-䶿一-鿿]/g);
  if (!letters || letters.length < 20) return hasCJK(s) ? 1 : 0;
  const cjk = s.match(/[㐀-䶿一-鿿]/g) || [];
  return cjk.length / letters.length;
}
/** 是否含值得翻译的散文词（剥离行内代码/链接图片后仍 >=2 个英文词） */
function hasWords(text) {
  const probe = text.replace(/`[^`]*`/g, " ").replace(/!?\[[^\]]*\]\([^)]*\)/g, " ");
  return (probe.match(/[A-Za-z]{2,}/g) || []).length >= 2;
}
/** 去掉行内代码/链接括号后统计英文单词，决定是否值得翻译 */
function translatable(text) {
  if (!/[A-Za-z]{3}/.test(text) || !hasWords(text)) return false;
  return cjkRatio(text) < 0.1;
}

async function fetchHtml(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "pnpm-cn-docs-mirror/1.0" } });
      if (res.status === 404) return { status: 404, html: "" };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { status: res.status, html: await res.text() };
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

/* ---------------- 链接重写 ---------------- */
function rewriteHref(href) {
  if (!href) return href;
  if (href.startsWith("#") || href.startsWith("mailto:")) return href;
  if (/^https?:/.test(href)) {
    if (href.startsWith(ORIGIN + "/zh/") || href.startsWith(ORIGIN + "/")) {
      const local = mapLocalPath(href.replace(ORIGIN, ""));
      if (local) return local;
    }
    return href;
  }
  if (href.startsWith("/")) {
    const local = mapLocalPath(href);
    if (local) return local;
    return ORIGIN + href;
  }
  return href;
}
function mapLocalPath(p) {
  const m = p.match(/^\/(?:zh)?\/?((?:1[012]\.x)\/)?(.+?)(#.*)?$/);
  if (!m) return null;
  const [, version, rest, hash] = m;
  if (version) return null; // 版本化深链保持指向上游
  const id = rest.replace(/\/+$/, "");
  if (!DOC_IDS.has(id)) return null;
  return `/docs/${id}${hash || ""}`;
}

/* ---------------- 行内序列化 ---------------- */
function inline($, el) {
  let out = "";
  const collect = (n) => $(n).text().replace(/[\t ]+/g, " ").trim();
  const walk = (node) => {
    if (node.type === "text") {
      out += node.data.replace(/\s+/g, " ");
      return;
    }
    if (node.type !== "tag") return;
    const tag = node.name.toLowerCase();
    const $n = $(node);
    if (tag === "br") return (out += "<br>\n");
    if (tag === "svg" || tag === "button" || $n.hasClass("hash-link")) return;
    if (tag === "a") {
      const href = rewriteHref($n.attr("href") || "");
      const label = collect(node).replace(/[\[\]]/g, "");
      out += `[${label}](${href})`;
      return;
    }
    if (tag === "img") {
      let src = $n.attr("src") || "";
      const alt = ($n.attr("alt") || "").replace(/[[\]]/g, "");
      const cls = $n.attr("class") || "";
      const altOut = alt && translatable(alt) ? flagAlt(CUR_PAGE, alt) : alt;
      if (src.startsWith("data:image/")) {
        src = saveDataUri(src);
      } else if (src.startsWith("/zh/img/") || src.startsWith("/img/")) {
        src = "/img/" + src.replace(/^\/(?:zh\/)?img\//, "");
        images.add(src);
      }
      if (/themedComponent/.test(cls)) {
        out += `<img src="${src}" class="${/dark/.test(cls) ? "only-dark" : "only-light"}" alt="${altOut}">`;
        return;
      }
      out += `![${altOut}](${src})`;
      return;
    }
    if (tag === "code") {
      const t = $n.text().replace(/[\t ]+/g, " ").trim();
      out += t.includes("`") ? "`` " + t + " ``" : "`" + t + "`";
      return;
    }
    if (tag === "strong" || tag === "b") return void (out += `**${collect(node)}**`);
    if (tag === "em" || tag === "i") return void (out += `*${collect(node)}*`);
    if (tag === "del" || tag === "s") return void (out += `~~${collect(node)}~~`);
    if (tag === "sup") return void (out += `^${collect(node)}^`);
    for (const c of node.children || []) walk(c);
  };
  for (const child of Array.isArray(el) ? el : el.children || []) walk(child);
  return out.replace(/ {2,}/g, " ").trim();
}

/* ---------------- 代码块 ---------------- */
function codeBlock($, pre) {
  const $pre = $(pre);
  const cls = ($pre.attr("class") || "") + " " + ($pre.parent().attr("class") || "") + " " + ($pre.parent().parent().attr("class") || "");
  const m = cls.match(/language-([a-zA-Z0-9+#-]+)/);
  let lang = m ? m[1] : "";
  lang = { sh: "bash", shell: "bash", zsh: "bash", console: "bash", text: "" }[lang] ?? lang;
  let code = $pre
    .find("div.token-line")
    .toArray()
    .map((d) => $(d).text().replace(/\n$/, ""))
    .join("\n");
  if (!code) code = $pre.text();
  code = code.replace(/\u00a0/g, " ").replace(/\s+$/, "");
  let fence = "```";
  while (code.includes(fence)) fence += "`";
  return fence + lang + "\n" + code + "\n" + fence;
}

/* ---------------- 块级序列化 ---------------- */
function block($, node, page, all) {
  if (node.type === "text") {
    const t = node.data.trim();
    return t ? flagText(page, t, all) : "";
  }
  if (node.type !== "tag") return "";
  const $n = $(node);
  const tag = node.name.toLowerCase();
  if ($n.hasClass("hash-link") || $n.attr("id")?.startsWith("bsa") || tag === "header") return "";
  if (/^(script|style|svg|button)$/.test(tag)) return "";

  if (/^h[2-6]$/.test(tag)) {
    const id = $n.attr("id") || "";
    const text = inline($, node);
    if (!text) return "";
    return { md: `${"#".repeat(+tag[1])} ${flagHeading(page, text, all)}\n`, id };
  }
  if (tag === "p") {
    const t = inline($, node);
    return t ? flagText(page, t, all) + "\n" : "";
  }
  if (tag === "ul" || tag === "ol") {
    const ordered = tag === "ol";
    const start = parseInt($n.attr("start") || "1", 10);
    const items = $n
      .children("li")
      .toArray()
      .map((li, i) => {
        const marker = ordered ? `${start + i}. ` : "- ";
        const kids = $(li).children().toArray();
        const onlyInline = kids.every((k) => !/^(p|ul|ol|pre|div|blockquote|table|details|h[1-6])$/.test((k.name || "").toLowerCase()));
        if (onlyInline) {
          const t = inline($, $(li).contents().toArray());
          return marker + flagText(page, t, all, "li");
        }
        const inner = childrenMd($, $(li).contents().toArray(), page, all).trim();
        const lines = inner.split("\n").filter((l, idx) => l.trim() || idx === 0);
        return marker + lines[0] + (lines.length > 1 ? "\n" + lines.slice(1).map((l) => "  " + l).join("\n") : "");
      });
    return items.join("\n") + "\n";
  }
  if (tag === "pre") return codeBlock($, node) + "\n";
  if (tag === "blockquote") {
    const inner = childrenMd($, $n.contents().toArray(), page, all);
    return (
      inner
        .trim()
        .split("\n")
        .map((l) => (l ? "> " + l : ">"))
        .join("\n") + "\n"
    );
  }
  if (tag === "table") {
    const rows = [];
    $n.find("tr").each((_, tr) => {
      const cells = [];
      $(tr)
        .find("th,td")
        .each((__, c) => {
          let t = inline($, c).replace(/\|/g, "\\|");
          if (c.name === "th" && !t.startsWith("**")) t = `**${t}**`;
          cells.push(t);
        });
      if (cells.length) rows.push(cells);
    });
    if (!rows.length) return "";
    const width = Math.max(...rows.map((r) => r.length));
    let out = "| " + rows[0].join(" | ") + " |\n| " + rows[0].map(() => "---").join(" | ") + " |\n";
    for (const r of rows.slice(1)) {
      while (r.length < width) r.push("");
      out += "| " + r.join(" | ") + " |\n";
    }
    return out;
  }
  if (tag === "details") {
    const summary = $n.children("summary").first().text().trim();
    const inner = childrenMd(
      $,
      $n.contents().filter((_, c) => c.name !== "summary").toArray(),
      page,
      all
    );
    return `<details>\n<summary>${summary}</summary>\n\n${inner.trim()}\n\n</details>\n`;
  }
  if (tag === "hr") return "---\n";
  const admon = ($n.attr("class") || "").split(/\s+/).find((c) => c.startsWith("theme-admonition-"));
  if (admon) {
    const type = admon.replace("theme-admonition-", "");
    const ZH_LABEL = { note: "说明", tip: "提示", important: "重要", caution: "注意", danger: "警告" };
    const isHeading = (i, c) => /admonition[-_]?(heading|title)/i.test($(c).attr("class") || "");
    let title = $n.children().filter(isHeading).first().text().trim().replace(/\s+/g, " ");
    if (!title || title.toLowerCase() === type.toLowerCase()) title = ZH_LABEL[type] || title;
    else if (translatable(title)) title = flagAlt(page, title);
    const body = childrenMd($, $n.children().toArray().filter((c, i) => !isHeading(i, c)), page, all);
    const head = title ? `:::${type}[${title}]\n\n` : `:::${type}\n\n`;
    return head + body.trim() + "\n\n:::\n";
  }
  if (tag === "div" || tag === "section" || tag === "main" || tag === "figure" || tag === "span") {
    return childrenMd($, $n.contents().toArray(), page, all);
  }
  const t = inline($, node);
  return t ? flagText(page, t, all) + "\n" : "";
}

/** @returns {{mds:string[], ids:string[]}} */
function childrenMdRaw($, nodes, page, all) {
  const mds = [];
  const ids = [];
  for (const c of nodes) {
    const r = block($, c, page, all);
    if (!r) continue;
    if (typeof r === "object") {
      mds.push(String(r.md).trimEnd());
      if (r.id) ids.push(r.id);
    } else mds.push(String(r).trimEnd());
  }
  return { md: mds.filter(Boolean).join("\n\n"), ids };
}
let HEAD_ACC = [];
function childrenMd($, nodes, page, all) {
  const { md, ids } = childrenMdRaw($, nodes, page, all);
  HEAD_ACC.push(...ids);
  return md;
}

/* ---------------- 待译标记 ---------------- */
function flagHeading(page, text, all) {
  if (all || !hasCJK(text)) {
    const bid = newBlockId(page);
    blocks.push({ p: page, b: bid, k: "heading", t: text });
    return `<!--T:${bid}-->${text}<!--/T-->`;
  }
  return text;
}
function flagText(page, text, all, kind = "para") {
  const needs = hasWords(text) && (all ? /[A-Za-z]{3}/.test(text) : translatable(text));
  if (needs) {
    const bid = newBlockId(page);
    blocks.push({ p: page, b: bid, k: kind, t: text });
    return `<!--T:${bid}-->${text}<!--/T-->`;
  }
  return text;
}
function flagAlt(page, text) {
  const bid = newBlockId(page);
  blocks.push({ p: page, b: bid, k: "alt", t: text });
  return `<!--T:${bid}-->${text}<!--/T-->`;
}

import { createHash } from "node:crypto";
function saveDataUri(uri) {
  const m = uri.match(/^data:image\/(svg\+xml|png|jpe?g|webp|gif);base64,([\s\S]+)$/);
  if (!m) return uri;
  const buf = Buffer.from(m[2], "base64");
  const ext = m[1] === "svg+xml" ? "svg" : m[1].replace("jpeg", "jpg");
  const name = `/img/gen/${createHash("sha1").update(buf).digest("hex").slice(0, 16)}.${ext}`;
  const dest = path.join("public", name.slice(1));
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
  }
  return name;
}

/* ---------------- 页面处理 ---------------- */
async function scrapePage(page) {
  let { status, html } = await fetchHtml(`${ORIGIN}/zh/${page}`);
  if (status !== 200) html = (await fetchHtml(`${ORIGIN}/${page}`)).html;
  if (!html) return { page, error: "missing" };
  const $ = cheerio.load(html);
  const root = $("div.theme-doc-markdown");
  if (!root.length) return { page, error: "no-root" };
  const h1 = $("article h1, header h1").first().text().trim() || page;
  $("header").remove();
  const ratio = cjkRatio(root.text());
  const useEn = ratio < 0.35;
  if (useEn) {
    const en = await fetchHtml(`${ORIGIN}/${page}`);
    if (en.status === 200) {
      const $$ = cheerio.load(en.html);
      $$("div.theme-doc-markdown header").remove();
      return build(page, $$, $$("div.theme-doc-markdown").contents().toArray(), true, h1, ratio, `${ORIGIN}/${page}`);
    }
  }
  return build(page, $, root.contents().toArray(), useEn, h1, ratio, `${ORIGIN}/zh/${page}`);

  function build(p, $_, nodes, all, title, cov, url) {
    CUR_PAGE = p;
    HEAD_ACC = [];
    blocksBefore = blocks.length;
    const body = childrenMd($_, nodes, p, all).trim();
    if (translatable(title)) blocks.push({ p, b: p + "@title", k: "title", t: title });
    const ym = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `headingIds: ${JSON.stringify(HEAD_ACC)}`,
      "---",
    ].join("\n");
    const flagCount = blocks.length - blocksBefore;
    const outPath = path.join(OUT_DIR, p + ".md");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, ym + "\n\n" + body + "\n");
    pageMeta[p] = { source: all ? "en" : "zh", coverage: +cov.toFixed(2), flagged: flagCount, url };
    return { page: p, flagged: flagCount };
  }
}
let blocksBefore = 0;

/* ---------------- 主流程 ---------------- */
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync("scripts/out", { recursive: true });

const queue = [...DOC_IDS];
const t0 = Date.now();
let active = 0;
let done = 0;
await new Promise((resolve) => {
  const next = () => {
    while (active < 5 && queue.length) {
      const p = queue.shift();
      active++;
      scrapePage(p)
        .then((r) => r.error && console.log("ERR", r.page, r.error))
        .catch((e) => console.log("FAIL", p, String(e)))
        .finally(() => {
          active--;
          done++;
          if (done % 15 === 0) console.log(`${done}/${queue.length + active} left ${Math.round((Date.now() - t0) / 1000)}s`);
          if (!queue.length && !active) resolve();
          else next();
        });
    }
  };
  next();
});

fs.writeFileSync("scripts/out/blocks.jsonl", blocks.map((b) => JSON.stringify(b)).join("\n") + "\n");
fs.writeFileSync("scripts/out/pages.json", JSON.stringify(pageMeta, null, 1));

const imgs = [...images];
await Promise.all(
  imgs.map(async (src) => {
    const dest = path.join(IMG_DIR, src.replace(/^\/img\//, ""));
    if (fs.existsSync(dest)) return;
    try {
      const res = await fetch(ORIGIN + "/zh" + src);
      if (res.ok) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      } else console.log("img", res.status, src);
    } catch {
      console.log("img fail", src);
    }
  })
);
console.log("DONE pages:", Object.keys(pageMeta).length, "blocks:", blocks.length, "images:", imgs.length);
