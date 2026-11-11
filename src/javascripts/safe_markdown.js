import { marked } from "marked";

const allowedTags = new Set(["P", "BR", "STRONG", "EM", "DEL", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE", "H1", "H2", "H3", "H4", "H5", "H6", "HR", "A", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD"]);
const blockedTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "FORM", "INPUT", "BUTTON", "TEXTAREA", "TEMPLATE"]);

export function renderMarkdown(markdown, document) {
  const template = document.createElement("template");
  template.innerHTML = marked.parse(markdown, { async: false, breaks: true });
  function clean(node) {
    if (node.nodeType === 3) return document.createTextNode(node.textContent);
    if (node.nodeType !== 1 || blockedTags.has(node.tagName)) return document.createDocumentFragment();
    const element = allowedTags.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : document.createDocumentFragment();
    if (node.tagName === "A") {
      try {
        const url = new URL(node.getAttribute("href"), document.baseURI);
        if (["http:", "https:"].includes(url.protocol)) {
          element.setAttribute("href", url.href);
          if (url.origin !== new URL(document.baseURI).origin) {
            element.setAttribute("target", "_blank");
            element.setAttribute("rel", "noopener noreferrer");
          }
        }
      } catch (_) {}
    }
    for (const child of node.childNodes) element.append(clean(child));
    return element;
  }
  const fragment = document.createDocumentFragment();
  for (const node of template.content.childNodes) fragment.append(clean(node));
  return fragment;
}
