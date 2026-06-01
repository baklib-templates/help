# Wiki Help Center (`help`)

English | [简体中文](README.zh-CN.md)

Baklib **Wiki** theme focused on **customer self-service and help centers** (with optional FAQ-style home): content-first layout, sidebar navigation, in-page TOC, AI search, share-to-LLM tools, and Turbo-powered transitions. It is a sibling of the Docs-oriented wiki theme, with documentation-centric index variants removed in favor of help-oriented layouts.

## Requirements

- Node.js (for asset builds)
- Baklib site using the **Wiki** scope with this theme installed (`theme_scope`: `wiki` in `config/settings_schema.json`)

## Repository layout

| Path                          | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `config/settings_schema.json` | Theme metadata (`theme_name`: `help`), languages, and editor settings   |
| `layout/`                     | Base layouts                                                            |
| `templates/`                  | Page templates (see **Homepage templates** below), `page`, `search`, …  |
| `snippets/`                   | Partials (header, footer, sidebar, page tools, feedback, …)             |
| `locales/`                    | Runtime UI strings (`*.json`) and theme-editor labels (`*.schema.json`) |
| `src/`                        | Source CSS/JS (Tailwind, esbuild)                                       |
| `assets/`                     | Compiled stylesheets, scripts, and theme preview images                 |
| `statics/`                    | Static custom HTML examples                                             |

## Homepage (`index`) templates

Choose one in the site editor as the wiki home:

| Template                 | File                         | Summary |
| ------------------------ | ---------------------------- | ------- |
| **Help Center**          | `index.help_center.liquid`   | Hero + search, channel grid, optional featured topics / latest / popular blocks. |
| **FAQ Center**           | `index.faqs.liquid`          | Tabbed categories + collapsible FAQ list. |
| **Card Home**            | `index.card.liquid`          | Large category cards with article previews (Intercom-style). |
| **Support Home**         | `index.support.liquid`       | Main column (left): headline, search, popular articles on white. Sticky right sidebar (light background): common topics + **Contact support** HTML from site settings (`contact_html`). |

### Support Home sidebar: `contact_html`

Under **Theme settings → Custom HTML**, set **Contact support (HTML)** (`contact_html`). It renders in the right sticky sidebar of **Support Home** under the “Contact support” heading (together with **Common topics** links above it).

## Supported locales

Runtime translations and theme-editor (schema) translations ship for:

- `en`, `zh-CN`, `zh-TW`, `ko`, `ja`, `de`, `fr`

Add or edit keys in `locales/<locale>.json` (UI) and `locales/<locale>.schema.json` (theme-editor labels). When introducing a new locale, register it under `theme_info.theme_languages` in [`config/settings_schema.json`](config/settings_schema.json).

## Build assets

```bash
yarn install
yarn build
```

During development:

```bash
yarn dev
```

Optional live reload (requires Ruby + livereload browser extension):

```bash
bundle install
bundle exec guard
```

## Per-language preview images

The theme card and screenshots in the Baklib admin are resolved by language. Drop localized previews into `assets/images/theme/<lang>/` so admins see them in their UI language:

```text
assets/images/theme/<lang>/
├── thumb.png            # theme card thumbnail
├── index.png            # primary preview
├── index-help-center.png
├── index-faqs.png
├── index-card.png
├── index-support.png
└── page.png
```

Template `thumb_url` / `preview_image_urls` and theme preview paths in `config/settings_schema.json` all use `images/theme/${lang}/`. The `${lang}` placeholder is resolved automatically:

```json
"theme_thumb_url": "images/theme/${lang}/thumb.png",
"theme_preview_images": [
  "images/theme/${lang}/index.png",
  "images/theme/${lang}/index-help-center.png",
  "images/theme/${lang}/index-faqs.png",
  "images/theme/${lang}/index-card.png",
  "images/theme/${lang}/index-support.png",
  "images/theme/${lang}/page.png"
]
```

If a localized image is missing, Baklib falls back to the default language directory.

## Documentation

- Theme guide: <https://help.baklib.cn/themes/docs>
- Settings reference: <https://help.baklib.cn/themes/docs/settings>
- Baklib template development guide: <https://dev.baklib.cn/guide/git>

## License

See [LICENSE](LICENSE) (or the parent repository if no `LICENSE` file is present).
