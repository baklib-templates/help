# Help：客户帮助与在线支持

面向客户自助服务、电商售后和产品支持。正文与目录来源于知识库；本站提供内容查找、阅读和真实服务入口。以解决具体问题、快速找到答案为主要任务时选择 Help；以按章节系统学习、通读产品手册为主要任务时选择 Docs，开发接入与 API 参考选 Developers。产品使用指南也可以属于 Help，不能仅因出现“产品文档”就改选 Docs。

## 先建可访问的基础站点

采用一个 `index` 首页与一个 `page` 内容模板；首页以模板样式分出 `index.help_center`、`index.faqs`、`index.support` 三个变体，首次只创建当前语言。无资料时保留空状态，不自动生成公司事实、服务承诺、产品名称、联系方式或示例问答。随后再导入客户资料或连接有权访问的知识库。

## 按客户目标选择首页变体

根据客户希望访客首先完成的任务，在建站时通过 `index_style`（首页模板样式）选择变体，也可在站点编辑器切换。变体是模板样式，不是 `configure_site` 可写字段，不要尝试用站点设置写入。客户不需要说出字段名或枚举值；展示结构可以从自然语言目标判断，品牌、正文和联系方式仍只能来自客户原文或已读资料。三个变体都有搜索，不要仅因提到“搜索”就排除分类优先的帮助中心。

| 客户需求 | 首页变体 | `auto` 时文章布局 | `auto` 时分类布局 |
| --- | --- | --- | --- |
| 访客先浏览业务主题或知识分类，再进入文章；或先输入问题查答案 | `index.help_center`（默认） | reader：聚焦阅读 | cards |
| 访客直接浏览常见问题，并就地展开简短解答 | `index.faqs` | reader | faq |
| 访客先了解求助方式，再查少量指引或联系服务方 | `index.support` | support：正文 + 服务入口 | list |

首次配置时，将 `article_layout` 和 `category_layout` 保持为 `auto`，由所选首页样式带动阅读与分类搭配。客户要求“自动搭配”或“内页跟随首页”时，必须写入或保留 `auto`；上表的自动显示结果不是要写入的固定枚举。只有客户明确要求偏离默认组合时才覆盖，已有客户显式设置应保留。

多个诉求同时存在时，以客户强调的首要访问任务选择一个变体；其他诉求用同站的搜索、分类和服务入口承接，不为每种诉求另建站点。只说“帮助中心”且没有更明确的首要任务时使用 `index.help_center`。意图已清楚就直接配置并简短说明选择，不让客户选择技术字段；关键任务相互冲突时才提问。原「搜索优先」「产品卡片」两种首页差异已并入帮助中心变体；如客户确需单独恢复，用组织候选新增变体，不要引入全站布局开关。

全局 `article_layout` 可显式选 tree/reader/support；`category_layout` 可选 cards/list/faq。这些组合共享品牌、导航、搜索和反馈。

## 从真实案例选择设计

本模板附带七个 Baklib 客户案例的设计参考。它们是布局知识，不是客户业务资料，也不是七个预装皮肤。客户说“像 Ulike 一样”或提供下列域名，即已表达参考设计意图：建立基础 Help 站点后，先用 `read_template(path: ...)` 读取对应案例及 `docs/skill/references/design-playbook.md`，再配置和制作候选。不要仅更换主色或切换一个首页样式就宣称还原完成。

| 名称、别名与域名 | 应识别的设计意图 | 基础变体与详情路径 |
| --- | --- | --- |
| Ulike、helpcenter.ulike.com | 消费品牌；人物搜索首屏 → 产品排障 → FAQ → 服务主题 → 联系渠道 | `index.help_center` + auto；`docs/skill/references/ulike.md` |
| Procolored、support.procolored.com | 多机型设备；先选型号，再找安装、首次使用、维护、视频和下载 | `index.help_center` + tree；`docs/skill/references/procolored.md` |
| INFFNI、INFFNITECH、support.inffnitech.com | 少量服务任务直达；场景图片搜索首屏、四任务卡、视频课程 | `index.help_center` + auto；`docs/skill/references/inffni.md` |
| RingConn、support.ringconn.com | 消费硬件；型号大图、产品与服务分区、型号内多类资料 | `index.help_center` + reader；`docs/skill/references/ringconn.md` |
| 纷享销客、FXIAOKE、help.fxiaoke.com | 业务模块与角色入口；模块下多级操作指南 | `index.help_center` + auto；`docs/skill/references/fxiaoke.md` |
| 威步、WIBU、help.wibu.com.cn | 专业技术服务；搜索、四资源入口、精选文章、聚焦长文 | `index.help_center` + reader；`docs/skill/references/wibu.md` |
| PingPong、乒乓、helpcenter.pingpongx.com | 账户与平台任务；搜索热词、图标任务卡、高频问题、操作目录 | `index.help_center` + auto；`docs/skill/references/pingpong.md` |

没有指定案例时，按访客首要任务、目录深度、素材条件和风格匹配最相关的 1–2 例，不一次读取全部案例。首页与内页分别判断：案例式设计请求可以作为偏离默认组合的明确依据，先简短说明再设置；客户明确要求“内页自动跟随首页”时仍保持 `auto`，说明与参考站内页的差异。案例表是起点，不覆盖现有客户设置。读过的案例设计不得通过 `seed_content` 写成客户知识文章。

向客户说明具体方案，例如“采用 Ulike 的产品排障、FAQ、主题与联系区顺序，替换为你的品牌素材，文章保留正文和页内导航”，无需让客户理解字段名。每项都区分已经配置、候选已预览、仍缺素材或页面设置；资料不足时完成可用的基础站，保留准确空状态。

说明“当前已有/缺少什么”前，读取涉及的模板片段核对，不从案例截图推断默认能力。特别注意：当前 Hero 的快捷链接是分类入口，不是独立热门搜索词；有 `hero_image` 时已有左文右图的独立图片卡；有可访问子页时分类卡显示数量，帮助中心变体最多显示三个子链接；`tree` 是上下文导航而非完整递归树，TOC 还取决于正文标题和屏幕宽度。当前 `index.help_center` 顺序为 Hero → 知识正文（有内容时）→ 分类卡片区 → 精选文章（启用且有内容时）→ FAQ（开启时）→ 支持渠道（已配置时），不能误称分类入口仅在 Hero 中；`index.faqs` 把 FAQ 提到分类之前，`index.support` 把支持渠道放进粘性侧栏。只有实际写入成功的设置才能称为已配置，不能把“字段支持”说成页面上已经出现对应内容。

## 配置、内容与媒体

- `configure_site` 可写字段以 manifest 的 `site_fields` 为准，包括品牌、文章/分类布局、真实支持地址及作者/日期显示；首页变体由 `index_style` 选择，不在其中。
- `seed_content` 为首页写 `hero_title`、`hero_description`、`hero_image`、`featured_title`、`featured_pages`、`show_featured`、`faq_source`、`show_faqs`。三个变体字段相同。字段 `featured_pages` 是本站真实路径，每行一个；`faq_source` 是已有分类路径。
- `create_channels` / `seed_content` 为普通内容写入知识库，然后同步到站点。不得直接覆盖页面只读 `title`、`content`。
- 当前 Agent 的知识库写入接口不写普通页的展示字段。`description`、`icon_image`、`icon_name`、`reading_layout`、`tags`、`video_url`、`related_pages` 在页面设置中编辑；不要宣称已通过 `seed_content` 修改这些字段。单页 `reading_layout=inherit` 继承所选首页样式的自动搭配。
- 产品支持用一级知识分类表示产品、子页表示指南或问题，不虚构商品、订单或库存数据。
- 选择 `index.faqs` 时需要真正的问题与解答：若问题位于某个分类下，创建内容后用 `read_page` 取得该分类的真实路径，再以 `seed_content(path: "/", fields: ...)` 写入 `faq_source`。不要猜路径。`faq_source` 留空时读取首页直属子页；有子页的分类只显示入口，不会展开为答案。无内容时保留准确空状态。
- 先 `find_assets` 查询当前组织的 DAM，再将返回的正式 `asset-编号` 写入图片或视频字段。禁止伪造素材地址。
- 服务入口 `support_url`、`support_email`、`support_phone` 只填客户确认的真实值；未配置不显示联系按钮。模板不提供工单、订单、支付或物流查询后端。
- AI 搜索仅在站点已配置可用 AI 时出现；缺少配置保持普通搜索。

## 设计定制与验收

本模板是全新结构，不接受旧模板字段别名或兼容分支。超出设置能力时，先 `read_template`，在固定版本的组织候选中 `customize_template`，真实预览通过后按平台流程采用。保护来源、权限、身份、表单与 DAM 引用。

公共设置须取得 `configure_site` 的成功返回，首页样式须在建站时选定，首页内容写入后用 `read_page` 读回；不要把“计划使用某种变体”当成已经配置。验收三个首页变体、分类、文章、搜索结果及无结果、反馈、手机导航、深色模式、空知识库；检查自动搭配和手动覆盖。设计回退只恢复设计，保留当前知识库人工内容。
