# Wiki Docs（`docs`）

[English](README.md) | 简体中文

面向 Baklib **Wiki** 的 **产品文档、帮助中心与 FAQ 门户** 主题：以内容为先的布局，配套侧栏导航、页内目录、AI 搜索、分享到 LLM 工具、Turbo 无刷新切换等能力。

## 环境要求

- Node.js（用于构建前端资源）
- Baklib 站点使用 **Wiki** 范围并启用本主题（`config/settings_schema.json` 中 `theme_scope` 为 `wiki`）

## 目录说明

| 路径                            | 说明                                       |
| ----------------------------- | ---------------------------------------- |
| `config/settings_schema.json` | 主题元数据、可选语言与编辑器配置项                        |
| `layout/`                     | 基础布局                                     |
| `templates/`                  | 页面模板（首页、文档、帮助中心、目录、常见问题、详情、搜索等）          |
| `snippets/`                   | 片段（页头、页脚、侧栏、页面工具、反馈等）                    |
| `locales/`                    | 前台文案（`*.json`）与主题编辑器文案（`*.schema.json`）  |
| `src/`                        | 源码 CSS/JS（Tailwind、esbuild）              |
| `assets/`                     | 构建后的样式、脚本与主题预览图                          |
| `statics/`                    | 自定义静态 HTML 示例                            |

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
