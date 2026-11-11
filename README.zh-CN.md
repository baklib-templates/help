# Help 中文说明

面向客户自助服务、电商售后知识与产品支持的 Baklib 帮助中心。使用同一套内容模型与设置契约，提供三种首页变体，不迁移旧版 Wiki / Help 的客户定制。

| 首页变体 | 固定模式 | `auto` 时的文章布局 | `auto` 时的分类布局 | 适用 |
| --- | --- | --- | --- | --- |
| `templates/index.help_center.liquid` | `collections` | `reader` | `cards` | 按主题浏览的帮助中心（默认） |
| `templates/index.faqs.liquid` | `faqs` | `reader` | `faq` | 常见问题与可展开的简短解答 |
| `templates/index.support.liquid` | `support` | `support` | `list` | 紧凑主栏 + 粘性联系支持侧栏 |

建站时通过首页模板样式 `index_style` 选择变体，也可在站点编辑器切换；模板不再提供全站 `home_layout` 设置。每个变体自带固定模式，内页的自动文章/分类搭配由所选首页样式派生。仍可用 `article_layout`、`category_layout` 全局覆盖，或用单页 `reading_layout` 覆盖。三种变体共用导航、搜索、品牌色、无障碍控件与文章反馈。界面语言：英语、简体中文。

原「搜索优先」与「产品卡片」两种首页差异已合并进帮助中心变体；如需单独恢复，可新增组织候选变体，不再引入全站布局开关。

## 内容

连接知识空间后，其目录成为帮助中心结构，文章标题与正文始终以知识库为真源。请在知识库中创建分类/产品及其帮助文章；没有内容时站点显示准确空状态。

精选文章、相关文章与 FAQ 来源都填写站内真实路径，媒体使用 Baklib DAM 引用。联系入口仅在配置后出现，AI 搜索仅在站点已开通时出现。模板不内置客户 Logo、虚构服务承诺、订单或工单后端。

## 构建

需要 Node.js 与 npm：`npm ci` 后执行 `npm run build`，并把生成的 CSS/JS 与源码一起提交。不使用运行时 CSS CDN、外部字体或 Alpine。

平台提供 Liquid 渲染、Turbo、Stimulus、站点权限、来源同步、反馈与搜索；本模板直接遵循这些契约。

## 快速开始

固定版本内含 [Agent 说明](docs/skill/SKILL.md)、机器可读 [manifest](docs/skill/manifest.yml) 与 [建站知识](docs/setup_knowledge.yml)。Agent 根据客户的首要访问任务推荐首页变体；变体本身是模板样式，不是 `configure_site` 可写字段。阅读相关设置属于普通站点设置，无需改模板代码即可配置。

[设计手册](docs/skill/references/design-playbook.md) 与七个客户案例（Ulike、Procolored、INFFNI、RingConn、纷享销客、WIBU、PingPong）提供按需设计参考；Agent 建站后用 `read_template` 读取相关案例。案例是设计说明，不是预装皮肤或客户内容。导入新固定版本后生效，既有站点仍使用各自版本。

## 校验

在 Baklib Rails 根目录执行：

```sh
bundle exec rails runner /absolute/path/to/help/scripts/verify.rb
```

脚本默认校验其所在主题，可用 `HELP_THEME_ROOT=/absolute/path/to/help` 指定其他候选。它检查 Liquid、schema 字段、双语文案、片段与 manifest 引用，渲染三种首页变体及文章/分类组合，并验证 FAQ 内容权限与作者/日期/相关/联系设置。平台表单与权限判定使用内存 fixture，不读写业务记录。

改动后在主题目录执行 `npm run build`。导航、响应式、目录、媒体、搜索、反馈与登录的浏览器验收另行进行，不由该脚本背书。
