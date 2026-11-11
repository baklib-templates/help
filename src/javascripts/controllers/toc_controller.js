import { Controller } from "@hotwired/stimulus";

export function buildToc(content, list) {
  const headings = [...content.querySelectorAll("h2, h3")].filter((heading) => heading.textContent.trim());
  const document = content.ownerDocument;
  list.replaceChildren();
  headings.forEach((heading, index) => {
    if (!heading.id || document.getElementById(heading.id) !== heading) {
      const base = heading.id || heading.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || `section-${index + 1}`;
      let id = base;
      let suffix = 2;
      while (document.getElementById(id)) id = `${base}-${suffix++}`;
      heading.id = id;
    }
    const link = document.createElement("a");
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.textContent = heading.textContent.trim();
    link.dataset.level = heading.tagName.slice(1);
    const item = document.createElement("li");
    item.append(link);
    list.append(item);
  });
  return headings;
}

export default class extends Controller {
  static targets = ["content", "list", "panel"];

  connect() {
    if (!this.hasContentTarget || !this.hasListTarget) return;
    this.headings = buildToc(this.contentTarget, this.listTarget);
    this.listTargets.slice(1).forEach((list) => buildToc(this.contentTarget, list));
    this.panelTargets.forEach((panel) => { panel.hidden = !this.headings.length; });
    if (!this.headings.length) return;
    this.linkGroups = this.listTargets.map((list) => [...list.querySelectorAll("a")]);
    this.onScroll = () => {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => {
        this.highlight();
        this.frame = null;
      });
    };
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.highlight();
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll);
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  highlight() {
    let active = 0;
    this.headings.forEach((heading, index) => {
      if (heading.getBoundingClientRect().top <= 150) active = index;
    });
    this.linkGroups.forEach((links) => {
      links.forEach((link, index) => {
        if (index === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }
}
