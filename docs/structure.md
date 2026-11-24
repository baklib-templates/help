# 结构

此模板使用知识库作为标题与正文的来源。站点投影不再维护第二份文章正文；分类和文章均使用 `page`，由真实知识库目录决定层级。

| 模板 | 子页面 |
| --- | --- |
| `templates/index.help_center.liquid` | `page` |
| `templates/index.faqs.liquid` | `page` |
| `templates/index.support.liquid` | `page` |
| `templates/index.card.liquid` | `page` |
| `templates/page.liquid` | `page` |

首页是「模板 + 样式」结构：`index.help_center`、`index.faqs`、`index.support`、`index.card` 各自固定一个渲染模式，由首页的 `template_style`（建站时的 `index_style`）选择，模板身份仍是 `index`。内页在 `article_layout=auto` / `category_layout=auto` 时读取 `site.index_page.template_style` 派生搭配：`help_center` 与 `card` 为 reader + cards，`faqs` 为 reader + faq，`support` 为 support + list；单页 `reading_layout` 可单独覆盖。卡片首页恢复自改版前的栏目卡片布局。其余首页可配置说明、头图、精选内容和 FAQ；引用已有页面时必须使用真实路径。

`search`、`tag`、`feedback`、`403`、`404`、`error` 以及反馈流没有子页面，不作为导入目标。服务入口可以链接到客户已有支持渠道，不提供工单、订单或物流系统。搜索与 AI 回答使用站点实际权限与开通状态，不能以界面入口推断已经开通。
