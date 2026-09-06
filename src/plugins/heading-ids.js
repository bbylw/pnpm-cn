/**
 * remark 插件：按文档顺序把抓取时保留的 docusaurus 标题锚点 id 写回标题。
 * 抓取脚本在 frontmatter 里输出 headingIds 数组（与标题出现顺序一一对应），
 * 这样即使标题文本被中文化，#anchor 链接仍与上游/旧链接保持一致。
 */
export function headingIds() {
  /** @param {any} tree @param {any} file */
  return (tree, file) => {
    const ids =
      file?.data?.astro?.frontmatter?.headingIds ??
      file?.data?.frontmatter?.headingIds ??
      file?.data?.remarkPluginFrontmatter?.headingIds ??
      tree?.data?.frontmatter?.headingIds;
    if (!Array.isArray(ids) || ids.length === 0) return;
    let i = 0;
    visitHeadings(tree, (node) => {
      const id = ids[i++];
      if (id) {
        node.data = node.data || {};
        node.data.hProperties = { ...(node.data.hProperties || {}), id };
      }
    });
  };
}

/** @param {any} tree @param {(n:any)=>void} cb */
function visitHeadings(tree, cb) {
  if (tree && typeof tree === "object") {
    if (tree.type === "heading" && typeof tree.depth === "number") cb(tree);
    if (Array.isArray(tree.children)) for (const c of tree.children) visitHeadings(c, cb);
  }
}
