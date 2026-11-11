import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["themeToggle"];

  connect() {
    this.onClick = (event) => this.closeMenus(event);
    this.onKeydown = (event) => {
      if (event.key === "Escape") this.closeMenus(event);
    };
    this.onBeforeCache = () => this.closeMenus();
    document.addEventListener("click", this.onClick);
    document.addEventListener("keydown", this.onKeydown);
    document.addEventListener("turbo:before-cache", this.onBeforeCache);
    this.updateThemeButtons();
  }

  disconnect() {
    document.removeEventListener("click", this.onClick);
    document.removeEventListener("keydown", this.onKeydown);
    document.removeEventListener("turbo:before-cache", this.onBeforeCache);
  }

  toggleTheme() {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("help-theme", theme); } catch (_) {}
    this.updateThemeButtons();
  }

  updateThemeButtons() {
    this.themeToggleTargets.forEach((button) => {
      button.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "dark"));
    });
  }

  closeMenus(event) {
    this.element.querySelectorAll("details[data-help-menu][open]").forEach((menu) => {
      if (event?.type === "click" && menu.contains(event.target)) return;
      menu.open = false;
      if (event?.key === "Escape") menu.querySelector("summary")?.focus();
    });
  }
}
