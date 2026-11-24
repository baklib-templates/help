# 字段

字段定义来自本模板的 settings schema 与 Liquid schema。下表的「可写」表示 schema 允许编辑；快速开始还须经过 manifest 的字段白名单。知识库投影的标题和正文保持只读。

## 全站

| id | 类型 | 能否改 |
| --- | --- | --- |
| `logo_url` | image_picker | 可写 |
| `brand_name` | text | 可写 |
| `tagline` | text | 可写 |
| `header_link_label` | text | 可写 |
| `header_link_url` | text | 可写 |
| `footer_text` | text | 可写 |
| `show_primary_nav` | checkbox | 可写 |
| `article_layout` | select | 可写 |
| `category_layout` | select | 可写 |
| `support_title` | text | 可写 |
| `support_description` | textarea | 可写 |
| `support_url` | text | 可写 |
| `support_email` | text | 可写 |
| `support_phone` | text | 可写 |
| `show_author` | checkbox | 可写 |
| `show_published_at` | checkbox | 可写 |
| `enable_ai_search` | checkbox | 可写 |
| `show_related_articles` | checkbox | 可写 |
| `show_feedback_form` | checkbox | 可写 |

## `index.help_center` / `index.faqs` / `index.support`

三个首页变体共用以下字段表，各自有独立的 `name`、`description` 与预览图；渲染模式在模板内固定，不提供 `home_layout` 设置。

| id | 类型 | 能否改 |
| --- | --- | --- |
| `title` | text | 只读 |
| `content` | richtext | 只读 |
| `hero_title` | text | 可写 |
| `hero_description` | textarea | 可写 |
| `hero_image` | image_picker | 可写 |
| `featured_title` | text | 可写 |
| `featured_pages` | textarea | 可写 |
| `show_featured` | checkbox | 可写 |
| `faq_source` | text | 可写 |
| `show_faqs` | checkbox | 可写 |

## `page`

| id | 类型 | 能否改 |
| --- | --- | --- |
| `title` | text | 只读 |
| `content` | richtext | 只读 |
| `description` | textarea | 可写 |
| `icon_image` | image_picker | 可写 |
| `icon_name` | select | 可写 |
| `reading_layout` | select | 可写 |
| `tags` | tag_picker | 可写 |
| `related_pages` | textarea | 可写 |

`search`、`tag`、`feedback`、`403`、`404`、`error` 以及反馈流没有设置项。
