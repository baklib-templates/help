# Wiki Docs (`docs`)

English | [简体中文](README.zh-CN.md)

Baklib **Wiki** theme tailored for **product documentation, help centers, and FAQ portals**: a content-first layout with sidebar navigation, table of contents, AI search, share-to-LLM tools, and Turbo-powered page transitions.

## Requirements

- Node.js (for asset builds)
- Baklib site using the **Wiki** scope with this theme installed (`theme_scope`: `wiki` in `config/settings_schema.json`)

## Repository layout

| Path                          | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `config/settings_schema.json` | Theme metadata, languages, and editor settings                          |
| `layout/`                     | Base layouts                                                            |
| `templates/`                  | Page templates (home, docs, help center, list, FAQs, page, search, …)   |
| `snippets/`                   | Partials (header, footer, sidebar, page tools, feedback, …)             |
| `locales/`                    | Runtime UI strings (`*.json`) and theme-editor labels (`*.schema.json`) |
| `src/`                        | Source CSS/JS (Tailwind, esbuild)                                       |
| `assets/`                     | Compiled stylesheets, scripts, and theme preview images                 |
| `statics/`                    | Static custom HTML examples                                             |

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
├── index-list.png
├── index-docs.png
├── index-faqs.png
└── page.png
```

The `${lang}` placeholder used in `config/settings_schema.json` is resolved automatically:

```json
"theme_thumb_url": "images/theme/${lang}/thumb.png",
"theme_preview_images": [
  "images/theme/${lang}/index.png",
  "images/theme/${lang}/index-help-center.png",
  "images/theme/${lang}/index-list.png",
  "images/theme/${lang}/index-docs.png",
  "images/theme/${lang}/index-faqs.png",
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
