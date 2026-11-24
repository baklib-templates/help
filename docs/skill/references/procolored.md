# Procolored：按机型组织的设备支持

观察日期：2026-10-19。来源为官方支持站的只读 HTTP 页面、同日桌面浏览器验收与本地 `themes/cms/shop_procolored` 源码。线上事实与本地能力分别说明；本地源码不证明线上采用完全相同版本。本次截图索引：`tmp/help-customer-design-20261019/screenshots/` 下的 `procolored-home.jpg`、`procolored-product.jpg`、`procolored-article.jpg`。

## 已观察的界面与页面链

[首页](https://support.procolored.com/)采用浅灰蓝横幅：左侧标题和搜索，右侧客服人物图，以橙红色强调重点。下方产品支持区以居中标题、产品类别标签和机型图卡组织内容；视频区同样按类别切换。联系区有邮件、电话、在线聊天、联系表单四种入口。搜索框提示可按产品、问题、错误码查找。

实际访问链：

- [产品目录](https://support.procolored.com/products) → [K13 Lite 机型支持](https://support.procolored.com/products/dtf-printers/k13-lite) → [开箱检查](https://support.procolored.com/products/dtf-printers/k13-lite/setup-guide/unboxing-and-inspection)。机型内分为介绍、规格、手册、软件下载、安装、首次打印、维护、故障排查和 FAQ。
- [K13 Lite 视频集合](https://support.procolored.com/videos/dtf-printers/k13-lite) → [开箱视频](https://support.procolored.com/videos/dtf-printers/k13-lite/k13-lite-quick-start)。独立视频页有视频、文章反馈、下一篇和继续求助入口。
- [软件下载](https://support.procolored.com/products/dtf-printers/k13-lite/software-download)是该机型的独立内容页，提供真实外部下载链接。

机型内页保留面包屑；左侧约 240 px 的树限定在当前机型，当前项为浅灰底，右侧是宽正文。开箱正文使用两列图文步骤表。这里的主要组织单位是“机型下的任务”，不是把所有型号的问题混成一个 FAQ 列表。

## 可复用处方

适合拥有多个型号、需要安装和持续维护的设备品牌。先让用户认出自己的机型，再进入安装、使用、维护、排障；同一机型下关联图文、视频与下载。首页保留直接搜索和真实求助入口，让用户可以跳过目录。

借鉴横幅的图文分工、机型图卡和连续步骤阅读，不复制客户品牌、人物照片、产品参数、客服电话或服务承诺。机型照片优先帮助识别型号，装饰图不能替代它。

## 现有 Help 配置与候选定制边界

| 需求 | 现有能力与实施边界 |
| --- | --- |
| 先选产品再查帮助 | 选 `index.help_center` 变体作为基础；一级知识分类承载产品，子页承载任务。它不会自动生成按工艺切换的机型标签组。 |
| 文章左侧目录 | `article_layout=auto` 在 `index.help_center` 下显示聚焦阅读（reader）。客户明确要求本案例的目录阅读时，可显式设为 `tree`；当前树展示全站主题、当前父级及子页，完整的“仅当前机型多级树”仍需候选定制。 |
| 横幅文字、品牌及一张主图 | 现有品牌设置与首页 `hero_title`、`hero_description`、`hero_image` 可提供基础。客服人物的裁切、横幅比例、颜色和装饰需在候选内设计；主图必须有真实 DAM 素材。 |
| 产品图卡、视频与下载 | 普通页有 `icon_image` 等展示字段，视频写在正文里，没有单独的视频字段。当前知识库 Agent 不通过 `seed_content` 写这些展示字段。机型图片需在页面设置中配置；视频、PDF、下载地址必须有客户资料和真实引用，不能声称 AI 已自动上传、关联或制作。 |
| 按类别切换的产品/视频区、四联系卡 | 需要候选增加数据映射与交互。当前支持组件只有一个 `support_url` 加邮箱、电话；同时独立展示聊天和表单不能靠同一 URL 伪装完成。 |
| 两列图文步骤表 | 需要真实图文来源及适配后的正文样式；不为复刻版式改写只读来源正文，也不把缺图步骤填成演示事实。 |

当前首页只提供 `index.help_center`、`index.faqs`、`index.support` 三个变体。原按产品卡片组织的首页差异已并入帮助中心变体；视频标签区、机型限定树等要求进入组织候选定制，不新增旧模板别名。普通页 `description`、`icon_image`、`icon_name`、`reading_layout`、`tags`、`related_pages` 由页面设置管理；视频写在正文里。正文经知识库同步，保护权限和来源。

## 移动适配建议（本次未实测）

- 横幅上下排列，优先保留搜索；人物图缩小或移到文字之后。
- 产品类别标签可横向滚动，机型卡采用一列或两列，保持型号名完整可读。
- 机型树收为可展开目录，持续显示当前机型和文章标题；返回后保留阅读位置。
- 图文步骤表改为逐步单列，图和对应说明相邻；视频保留比例，下载链接有足够点击区域。
- 联系入口换行，不用悬浮客服按钮遮住正文、目录或反馈。

## 适用范围与命名需求示例

适用于多型号硬件、打印设备、安装维护和故障排查。只有少量常见问题的服务品牌无需照搬多层机型树；以通读教材或开发接口为主时，先评估 Docs 或 Developers。

客户说“参考 Procolored，先选设备，再看安装和维修”时，提取为“产品优先首页＋机型范围内任务导航＋图文/视频/下载关联”。先选定 `index.help_center` 变体并把型号做成真实一级分类；客户明确要目录阅读时再显式覆盖文章布局。素材不足时保留真实空态，列明待提供的型号图、视频和文件。不能只选定一个首页变体就宣称已完成 Procolored 式整站。
