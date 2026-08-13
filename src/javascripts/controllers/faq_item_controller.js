import { Controller } from "@hotwired/stimulus"

/**
 * FAQ accordion: keep answer HTML in <template> until opened so collapsed
 * items do not fetch images. Drop leftover relative /images/... srcs
 * (e.g. Rails guide demo content) that 404 on the site origin.
 */
export default class extends Controller {
  static targets = ["panel", "source"]

  connect() {
    this.element.addEventListener("toggle", this.onToggle)
    if (this.element.open) this.hydrate()
  }

  disconnect() {
    this.element.removeEventListener("toggle", this.onToggle)
  }

  onToggle = () => {
    if (this.element.open) this.hydrate()
  }

  hydrate() {
    if (!this.hasSourceTarget || !this.hasPanelTarget) return

    const fragment = this.sourceTarget.content.cloneNode(true)
    fragment.querySelectorAll("img").forEach((img) => {
      const src = (img.getAttribute("src") || "").trim()
      if (this.isOrphanRelativeImage(src)) img.remove()
    })
    this.panelTarget.append(fragment)
    this.sourceTarget.remove()
  }

  isOrphanRelativeImage(src) {
    if (!src) return true
    if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return false
    return /^(\.\/)?\/?images\//i.test(src)
  }
}
