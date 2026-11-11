import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.images = [...this.element.querySelectorAll("img")].filter((image) => !image.closest("a, button"));
    this.originalAttributes = new Map();
    this.images.forEach((image) => {
      this.originalAttributes.set(image, ["tabindex", "role", "aria-label"].map((attribute) => image.getAttribute(attribute)));
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `${document.body.dataset.helpUiImageOpenValue || ""}${image.alt ? `: ${image.alt}` : ""}`);
    });
    this.onClick = (event) => {
      const image = event.target.closest("img");
      if (!this.images.includes(image)) return;
      this.open(image);
    };
    this.onKeydown = (event) => {
      if (!["Enter", " "].includes(event.key) || !this.images.includes(event.target)) return;
      event.preventDefault();
      this.open(event.target);
    };
    this.element.addEventListener("click", this.onClick);
    this.element.addEventListener("keydown", this.onKeydown);
    this.onBeforeCache = () => this.close(false);
    document.addEventListener("turbo:before-cache", this.onBeforeCache);
  }

  disconnect() {
    this.element.removeEventListener("click", this.onClick);
    this.element.removeEventListener("keydown", this.onKeydown);
    document.removeEventListener("turbo:before-cache", this.onBeforeCache);
    this.close(false);
    this.originalAttributes.forEach((values, image) => {
      ["tabindex", "role", "aria-label"].forEach((attribute, index) => {
        if (values[index] === null) image.removeAttribute(attribute);
        else image.setAttribute(attribute, values[index]);
      });
    });
  }

  open(image) {
    this.close(false);
    const dialog = document.createElement("dialog");
    if (typeof dialog.showModal !== "function") return;
    dialog.className = "help-image-dialog";
    const closeLabel = document.body.dataset.helpUiImageCloseValue;
    dialog.setAttribute("aria-label", image.alt || document.body.dataset.helpUiImageOpenValue);
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", closeLabel);
    close.addEventListener("click", () => dialog.close());
    const preview = document.createElement("img");
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    dialog.append(close, preview);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => { if (this.dialog === dialog) this.close(); }, { once: true });
    document.body.append(dialog);
    this.dialog = dialog;
    this.opener = image;
    dialog.showModal();
  }

  close(restoreFocus = true) {
    this.dialog?.remove();
    this.dialog = null;
    if (restoreFocus && this.opener?.isConnected) this.opener.focus();
    this.opener = null;
  }
}
