const LABELS = {
  note: "说明",
  tip: "提示",
  important: "重要",
  caution: "注意",
  danger: "危险",
  warning: "警告",
  info: "信息",
};
const TYPES = Object.keys(LABELS);

const textOf = (node) =>
  (node?.children || []).map((c) => (c.type === "text" ? c.value : "")).join("").trim();

/**
 * remark-directive 会把 :::type[标签] 中的标签放进第一个子段落（data.directiveLabel），
 * 并把该段落保留在正文里。取标签时以它为准，取过后把它从正文移除。
 */
function takeLabel(node) {
  const children = node.children || [];
  const first = children[0];
  if (first && first.type === "paragraph" && first.data?.directiveLabel) {
    const label = textOf(first);
    node.children = children.slice(1);
    return label;
  }
  const attr = node.attributes?.label?.value;
  return attr == null ? "" : String(attr);
}

/** 标签若与类型名相同（英文），视为未翻译，回落到中文默认标签 */
function labelOf(node, raw) {
  const label = (raw || "").trim();
  if (!label || TYPES.includes(label.toLowerCase())) return LABELS[node.name] || node.name;
  return label;
}

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
  if (node.type === "containerDirective" && TYPES.includes(node.name)) {
    const raw = takeLabel(node);
    const label = labelOf(node, raw);
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
