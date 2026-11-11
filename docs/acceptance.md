# Help 3.0 验收记录

日期：2026-10-18。环境：Baklib 本地开发服务，用户指定的 tanmer 测试组织。

> 本文件是当时的历史验收记录。其后的版本已把单份 `index.liquid` + 五种 `home_layout` 还原为 `index.help_center` / `index.faqs` / `index.support` 三个首页变体，表中的「5 个首页」「81 个组合」「产品概览」不再描述当前结构；当前以 `scripts/verify.rb` 的输出为准。

## 已验证

| 层次 | 结果 |
| --- | --- |
| 平台协议 | SettingsSchema、SettingSchema、严格 Liquid、片段引用、中英文翻译和 Agent manifest 通过 |
| 内容与权限 | FAQ 仅展开有权访问的叶子正文；分类仅提供入口；来源 title/content 保持 readonly |
| 布局 | 5 个首页、81 个全局/单页阅读组合、3 个分类布局及产品层级规则通过 |
| 真实 Drop 渲染 | 5 首页均展示 6 个真实分类；FAQ 指向真实分类，3 阅读布局保留知识库正文 |
| 前端 | npm 构建通过；6 个 JS 行为测试通过，覆盖 AI 流、Markdown、安全图片交互和双端目录 |
| 应用回归 | TemplateRegistry、TemplateSkill 共 13 个 RSpec 示例通过 |
| 浏览器 | 桌面 5 首页、产品概览、文章、搜索结果/无结果、目录、反馈提交与 404 通过 |
| 手机 | 390px 首页与文章无水平溢出；导航展开、目录展开和深色模式通过 |
| get-started | 使用真实 AssembleBlueprint 创建隔离测试站；ConfigureSite 成功设置布局；固定版本 Skill/Recipe/Catalog 构建通过 |

实际浏览器发现并修正：PagesDrop 计数需用 `| size`；搜索词需跨 render 显式传递；手机树形阅读需同时生成页内目录；FAQ 分类正文必须检查访问权限。清理了未调用的复制控制器逻辑。

## 测试范围

测试站仅含明确标识的演示知识。AI 搜索的流处理与安全 Markdown 用行为测试验证，未将真实模型答案质量或客户资料导入质量计入本次通过项。未迁移客户定制、未更新公共模板引用、未发布生产版本。

本地接入须正常导入 Help 3.0 的新固定版本。现有已固定的客户版本仍按其版本管理；本模板不包含旧字段或旧页面样式兼容层。

## 复跑

在模板目录执行 `npm ci && npm test && npm run build`。

在 Baklib Rails 根目录执行：

```sh
bundle exec rails runner themes/wiki/help/scripts/verify.rb
bundle exec rspec spec/services/site/template_registry_spec.rb spec/services/site/template_skill_spec.rb
```

模板校验不读写业务记录。真实数据验收脚本与截图保留在本次工作区的 `tmp/help-modern-evidence`、`tmp/verify-help-modern-real.rb`，不作为客户种子数据发布。
