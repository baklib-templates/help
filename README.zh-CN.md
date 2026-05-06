# Wiki 帮助中心（`help`）

[English](README.md) | 简体中文

面向 Baklib **Wiki** 的 **客户自助与帮助中心** 主题（可选 FAQ 式首页）：以内容为先，配套侧栏导航、页内目录、AI 搜索、分享到 LLM、Turbo 无刷新切换等。与偏「产品文档站」的 Docs 主题同族，本主题已弱化纯文档型首页，突出帮助中心场景。

## 环境要求

- Node.js（用于构建前端资源）
- Baklib 站点使用 **Wiki** 范围并启用本主题（`config/settings_schema.json` 中 `theme_scope` 为 `wiki`，`theme_name` 为 `help`）

## 目录说明

| 路径                            | 说明                                       |
| ----------------------------- | ---------------------------------------- |
| `config/settings_schema.json` | 主题元数据、可选语言与编辑器配置项                        |
| `layout/`                     | 基础布局                                     |
| `templates/`                  | 页面模板（见下文 **首页模板**），及详情、搜索等              |
| `snippets/`                   | 片段（页头、页脚、侧栏、页面工具、反馈等）                    |
| `locales/`                    | 前台文案（`*.json`）与主题编辑器文案（`*.schema.json`）  |
| `src/`                        | 源码 CSS/JS（Tailwind、esbuild）              |
| `assets/`                     | 构建后的样式、脚本与主题预览图                          |
| `statics/`                    | 自定义静态 HTML 示例                            |

## 首页（`index`）模板

在站点编辑器中选择其一作为 Wiki 首页：

| 模板           | 文件                         | 说明 |
| -------------- | ---------------------------- | ---- |
| **帮助中心**   | `index.help_center.liquid`   | 首屏与搜索、栏目宫格，可选专题 / 最新 / 热门等区块。 |
| **常见问题**   | `index.faqs.liquid`          | 分类标签 + 可折叠问答列表。 |
| **卡片式首页** | `index.card.liquid`          | 大卡片区展示栏目与子文预览（偏 Intercom 风格）。 |
| **支持站首页** | `index.support.liquid`       | 主区白底：标题、搜索、热门文章；**右侧**浅底 **sticky** 侧栏：常见主题（根与一级栏目 `link_text`）+ **联系支持**（见下）。 |

### 支持站首页侧栏：`contact_html`

在 **主题设置 → 自定义 HTML** 中配置 **联系支持（HTML）**（字段 `contact_html`）。内容会渲染在 **支持站首页** 右侧固定侧栏中「联系支持」标题下方（其上方为「常见主题」链接列表）。

## 支持的语言

前台与 schema 已包含：

- `en`、`zh-CN`、`zh-TW`、`ko`、`ja`、`de`、`fr`

新增/修改文案请编辑 `locales/<locale>.json`（前台）与 `locales/<locale>.schema.json`（主题编辑器）。新增语言时请在 [`config/settings_schema.json`](config/settings_schema.json) 的 `theme_info.theme_languages` 中登记。

## 构建资源

```bash
yarn install
yarn build
```

开发监听：

```bash
yarn dev
```

本地浏览器自动刷新（需要本地 Ruby 环境 + 浏览器 livereload 插件）：

```bash
bundle install
bundle exec guard
```

## 按语言切换的预览图

主题卡片与后台示意图按语言解析。请把不同语言的截图放到 `assets/images/theme/<lang>/`，后台会自动按当前语言加载：

```text
assets/images/theme/<lang>/
├── thumb.png            # 主题卡缩略图
├── index.png            # 主预览图
├── index-help-center.png
├── index-faqs.png
├── index-card.png
├── index-support.png
└── page.png
```

主题编辑器里各首页变体的缩略图还可放在 `assets/images/schema/`（如 `index-support.png`）。

`config/settings_schema.json` 中的 `${lang}` 占位会被自动替换：

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

若某语言下缺图，Baklib 会回退到默认语言目录。

## 文档

- 主题使用说明：<https://help.baklib.cn/themes/docs>
- 设置项参考：<https://help.baklib.cn/themes/docs/settings>
- Baklib 模板开发指南：<https://dev.baklib.cn/guide/git>

## 许可

见 [LICENSE](LICENSE)（若本目录无 LICENSE 文件，请以父仓库为准）。
