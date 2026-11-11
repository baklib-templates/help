import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.element.querySelectorAll("a[href]").forEach((anchor) => {
      let url;
      try { url = new URL(anchor.getAttribute("href"), window.location.href); } catch (_) { return; }
      if (!["https:", "http:"].includes(url.protocol) || url.origin === window.location.origin) return;
      anchor.target = "_blank";
      anchor.relList.add("noopener", "noreferrer");
    });
  }
}
