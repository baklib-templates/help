import { Controller } from "@hotwired/stimulus";
import { renderMarkdown } from "../safe_markdown.js";

export default class extends Controller {
  static targets = ["input", "output", "status", "submit"];
  static values = { url: String, thinking: String, error: String, empty: String, completed: String };

  connect() {
    this.onBeforeCache = () => {
      if (this.source) this.showStatus("");
      this.stop();
    };
    document.addEventListener("turbo:before-cache", this.onBeforeCache);
  }

  disconnect() {
    this.stop();
    document.removeEventListener("turbo:before-cache", this.onBeforeCache);
  }

  submit(event) {
    event.preventDefault();
    const question = this.inputTarget.value.trim();
    if (!question) {
      this.showStatus(this.emptyValue);
      this.inputTarget.focus();
      return;
    }
    this.stop();
    this.answer = "";
    this.outputTarget.replaceChildren();
    this.outputTarget.hidden = false;
    this.outputTarget.setAttribute("aria-busy", "true");
    this.showStatus(this.thinkingValue);
    let url;
    try {
      url = new URL(this.urlValue, window.location.href);
      if (url.origin !== window.location.origin) throw new Error("Invalid AI search endpoint");
      url.searchParams.set("message", question);
      const source = new EventSource(url.href);
      this.source = source;
      source.onmessage = (message) => {
        if (this.source !== source) return;
        this.resetTimeout();
        let data;
        try { data = JSON.parse(message.data); } catch (_) { this.fail(); return; }
        if (!data || !["system", "streaming", "completed", "error"].includes(data.status)) {
          this.fail();
          return;
        }
        if (data.status === "system") {
          this.showStatus(typeof data.message === "string" ? data.message : this.thinkingValue);
        } else if (data.status === "streaming" || data.status === "completed") {
          this.answer += typeof data.message === "string" ? data.message : "";
          this.outputTarget.replaceChildren(renderMarkdown(this.answer, document));
          if (data.status === "completed") {
            this.stop();
            this.showStatus(this.completedValue);
          }
        } else if (data.status === "error") {
          this.fail();
        }
      };
      source.onerror = () => { if (this.source === source) this.fail(); };
      this.resetTimeout();
    } catch (_) { this.fail(); }
  }

  resetTimeout() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.fail(), 45000);
  }

  fail() {
    this.stop();
    this.showStatus(this.errorValue);
  }

  stop() {
    this.source?.close();
    this.source = null;
    clearTimeout(this.timeout);
    if (this.hasOutputTarget) this.outputTarget.setAttribute("aria-busy", "false");
  }

  showStatus(text) {
    if (this.hasStatusTarget) this.statusTarget.textContent = text;
  }
}
