const LABELS = { note: "说明", tip: "提示", important: "重要", caution: "注意", danger: "警告" };

/**
 * 在 remark-directive 之后运行：把 :::type[label] 容器转成带样式的 aside。
 */
export function admonitions() {
  return (tree) => {
    walk(tree, null, null);
  };
}

function walk(node, parent, key) {
  if (!node || typeof node !== "object") return;
  if (node.type === "containerDirective" && ["note", "tip", "important", "caution", "danger"].includes(node.name)) {
    const label = node.attributes?.label?.value || LABELS[node.name] || node.name;
    const title = {
      type: "paragraph",
      data: { hName: "p", hProperties: { class: "admonition__title" } },
      children: [{ type: "text", value: String(label) }],
    };
    node.data = {
      hName: "aside",
      hProperties: { class: `admonition admonition--${node.name}` },
    };
    node.type = "container";
    node.name = null;
    node.attributes = {};
    node.children = [title, ...(node.children || [])];
    return;
  }
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => walk(c, node, k));
    else if (v && typeof v === "object" && v.type) walk(v, node, k);
  }
}
