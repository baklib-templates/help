# Help

A fresh Baklib help center for customer self-service, ecommerce after-sales knowledge, and product support. One content model, one settings contract, and three homepage variants. Earlier Wiki or Help customizations are not migrated.

| Homepage variant | Fixed mode | Article layout in `auto` | Category layout in `auto` | Use |
| --- | --- | --- | --- | --- |
| `templates/index.help_center.liquid` | `collections` | `reader` | `cards` | Topic-based help center (default) |
| `templates/index.faqs.liquid` | `faqs` | `reader` | `faq` | Common questions with expandable answers |
| `templates/index.support.liquid` | `support` | `support` | `list` | Compact service hub with a contact sidebar |

Choose a variant through the homepage template style (`index_style`) when the site is created or in the site editor. There is no global `home_layout` setting: each variant carries a fixed mode, and inner pages derive their automatic article/category layout from the selected style. Override the reading experience globally with `article_layout` and `category_layout`, or for one article with `reading_layout`. All variants share navigation, search, brand colors, accessibility controls, and article feedback. Interface languages: English and Simplified Chinese.

The earlier search-first and product-grid homepage treatments are folded into the help center variant. Dedicated variants can be added as organization candidates without reintroducing a global layout switch.

## Content

Connect a knowledge space. Its hierarchy becomes the help center structure, while article titles and bodies remain source-owned. Create categories/products and their help articles in the knowledge base. With no content, the site shows an honest empty state.

Use real site paths for featured articles, related articles, and the FAQ source. Media uses Baklib DAM references. Contact actions appear only when configured; AI search appears only when the site has an AI provider. No bundled customer logos, fake service claims, orders, or ticket backend.

## Build

Node.js and npm are required. Run `npm ci`, then `npm run build`. Commit the generated CSS and JavaScript assets with source changes. No runtime CSS CDN, external fonts, or Alpine dependency.

The application provides Liquid rendering, Turbo, Stimulus, site permissions, source synchronization, feedback, and search. This template uses those contracts directly.

## AI setup

The pinned version includes [Agent instructions](docs/skill/SKILL.md), its machine-readable manifest, and [setup knowledge](docs/setup_knowledge.yml). The Agent recommends a homepage variant from the customer's primary task; the variant itself is a template style, not a `configure_site` field. Reading settings are normal site settings and can be configured without editing template code.

The [design playbook](docs/skill/references/design-playbook.md) and seven customer references cover Ulike, Procolored, INFFNI, RingConn, FXIAOKE, WIBU, and PingPong. The guide supplies a short index; the Agent reads relevant references with `read_template` after site creation. Each reference separates observed layouts, available settings, and candidate customization. These are design instructions, not bundled customer skins or content. Import them with a new pinned theme version; existing installations retain their version.

See [中文说明](README.zh-CN.md).

## Verify

From the Baklib Rails application root, run:

```sh
bundle exec rails runner /absolute/path/to/help/scripts/verify.rb
```

The script defaults to the theme containing it. Set `HELP_THEME_ROOT=/absolute/path/to/help` to verify another candidate. It checks all Liquid and schema fields, both locale files, snippet and manifest references, renders every homepage variant plus article/category combinations, and tests FAQ content access plus author/date/related/support settings. It uses in-memory fixtures for platform forms and permission decisions and performs no application model queries or writes.

Run `npm run build` from the theme directory after changes. Browser checks of navigation, responsive layout, TOC, media, search, feedback and authentication are separate acceptance steps; this script does not certify those integrations.
