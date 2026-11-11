# Help 案例设计手册

适用：客户指定参考品牌或希望个性化 Help Center / Support Center。观察日期：2026-10-19。案例是设计参考，不是客户事实，不是运行时品牌分支。目录中的七例分别记录首页、代表内页、可配置起点与定制差距。

## 先理解任务，再组织设计

1. 识别访客首先做什么：输入问题、选择主题、选择型号、浏览短答案、联系支持。三个首页变体都有搜索，不能只看到搜索框就做相同首页。
2. 看内容形态：少量直达任务、型号下多种资料、深层模块树、长篇排错、独立问答。长 FAQ 正文不等于多个可展开的知识页。
3. 提炼参考的三项核心特征：首屏构图、区块顺序、内页导航。再选字体层级、留白、卡片和颜色角色。颜色是品牌的表达，不能代替结构设计。
4. 输出简短设计方案并继续执行：基础配置 → 有真实资料的内容 → 必要的组织候选 → 首页及内页实览。只追问会阻断结果的资料；用户说“像某案例”已经是设计方向。

## 匹配矩阵

| 客户目标 | 优先参考 | 对应首页变体 | 内页与定制重点 |
| --- | --- | --- | --- |
| 消费品牌售后，产品排障与订单政策并重 | Ulike | `index.help_center`（原 search） | tree 上下文；产品带、FAQ、主题卡、渠道区的顺序 |
| 多机型设备，全生命周期教程 | Procolored | `index.help_center`（原 products） | tree；限定机型目录、下载/视频等资料关联 |
| 新用户迅速开始使用，少量任务与视频 | INFFNI | `index.help_center`（原 search） | tree；四任务入口、附件与教程网格 |
| 先识别型号，型号资料与全局服务分离 | RingConn | `index.help_center`（原 products） | reader；产品图卡与资料标签定制 |
| 复杂 SaaS，按模块和角色查操作方法 | 纷享销客 | `index.help_center` | tree + cards；深层目录与模块子链接 |
| 专业技术排错与知识资源 | WIBU | `index.help_center`（原 search） | reader + list；阅读板、精选内容、侧面 TOC |
| 账户/平台业务办理与常见疑问 | PingPong | `index.help_center`（原 search） | tree + list；任务图标卡、热词、常见问题列表 |

七例的首屏差异已并入 `index.help_center` 变体，原 `search` / `collections` / `products` 不再是可选枚举；如需独立的产品卡片或居中搜索首屏，用组织候选新增变体。`tree` 当前提供顶层主题及当前父级/同级/子页上下文，不是无限递归树。`reader` 默认页内目录在正文上方，不能声称已得到 WIBU 的桌面右侧目录。`article_layout` / `category_layout` 保持 `auto` 时由所选首页变体派生；需要目录或专注阅读时按明确设计意图显式覆盖。完整对应见各案例。

## 可实现层级

| 层级 | 当前做法 |
| --- | --- |
| 公共配置 | `configure_site` 写 manifest 允许的品牌/Logo、阅读与分类布局、支持入口、作者日期显示；首页变体由 `index_style` 选择；没有任意 CSS 色值字段 |
| 首页内容 | `seed_content` 写首页 hero、正式 DAM 图片、精选真实路径、FAQ 来源与显示开关；先读取创建后的路径 |
| 知识正文 | 通过知识库写入与同步；每板块写后 `read_page`，保护人工修改与来源 |
| 普通页展示 | 产品图、图标、摘要、单页布局、视频和关联页可在页面设置编辑，但当前 wiki Agent 写入工具不支持这些 fields；不能声称已自动填写 |
| 候选设计 | 首屏构图、区块顺序、卡片、深树、侧栏、标签导航、页头页脚、颜色与间距用 `customize_template`；需要实际预览并采用后才成为当前设计 |
| 外部业务 | 订单、工单、物流、付款不由模板实现；只有已提供的真实链接才展示 |

品牌参考只迁移设计语言，不迁移其 Logo、人物/产品图、正文、电话、链接、服务时段或保证。优先查询当前组织 DAM；缺图保留清晰文字入口，不盗用客户图片，不伪造资产编号。无真实栏目或 FAQ 时不为凑版面编造。

## 模板修改路径

先 `read_template` 列目录，再完整读取实际修改的文件。当前常用入口：

| 设计区域 | 文件 |
| --- | --- |
| 首页区块与顺序 | `templates/index.help_center.liquid`、`templates/index.faqs.liquid`、`templates/index.support.liquid` |
| Hero 与搜索 | `snippets/_home_hero.liquid`、`snippets/_search_form.liquid` |
| 主题/产品入口 | `snippets/_home_categories.liquid`、`snippets/_home_category_card.liquid` |
| 推荐、FAQ、支持渠道 | `snippets/_home_featured.liquid`、`snippets/_home_faqs.liquid`、`snippets/_support_contact.liquid` |
| 内页主列、分类与阅读导航 | `templates/page.liquid`、`snippets/_category_content.liquid`、`snippets/_reading_navigation.liquid`、`snippets/_reading_toc.liquid` |
| 品牌页头页脚、样式加载 | `snippets/_header.liquid`、`snippets/_footer.liquid`、`layout/theme.liquid` |

候选每次最多 8 个文件、单文件最多 48,000 字节，不运行 Tailwind 构建。现有编译 CSS 已超过单文件限制，不整包替换；新增小型 `assets/stylesheets/` CSS 并在 layout 引用，复用现有样式，避免新 utility 未编译导致无效果。候选只改设计，不改 readonly 正文来源、权限、搜索表单、反馈、身份接口或 DAM 协议。不要把客户产品资料硬编码到模板以绕过内容接口。

## 现代适配与验收

这些是新版设计目标，不声称所有参考站都已满足：

- 桌面正文保留舒适行宽；目录、正文、TOC 最多三列。热门推荐放文末，避免四列挤压正文。
- 手机改成一列或紧凑双列入口；目录与 TOC 收起但可访问；搜索、返回主题、支持入口可触达。图片裁切不遮挡标题。
- 保持真实图片比例、卡片点击区域、标题层级、可见焦点、足够对比度与空状态；不复制参考站缺失图片、错误文字和拥挤问题。
- 验收至少首页 → 分类/产品 → 深层文章，并覆盖手机、搜索、FAQ 展开、支持链接、返回路径、无资料状态。标签导航如无对应内容，不做失效按钮。
- 交付说清楚“配置成功 / 候选预览通过 / 已采用 / 待素材”，不能把工具描述、截图或方案当成已实现功能。
