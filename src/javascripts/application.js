import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import { initLucideIcons } from './lucide_icons'
import './controllers'

window.Alpine = Alpine
Alpine.plugin(collapse)
Alpine.start()

document.addEventListener('turbo:load', initLucideIcons)
document.addEventListener('turbo:frame-render', initLucideIcons)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLucideIcons)
} else {
  initLucideIcons()
}
