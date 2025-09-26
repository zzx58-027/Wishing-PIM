# 已识别的可改进项
- 结合 AI 开发的合理范式:
  - 应充分结合 Git 代码管理工具, 解决 AI 协助开发中的伴随的代码变更大以及代码混乱的问题, 保持主分支提交历史的整洁. debug&fix 分支, feat 分支, main 分支.

# 项目亮点
- UI/UX:
  - 优化的文件上传组件/页面: 文件上传动作和文件信息展示的 UX 优化: 数值变化过渡, 元素进出的过渡.
- Logic/UX:
  - 根据业务流程和数据流向专门设计的 UI 布局和页面路由: 将 UI 实体最简化, 只增加最必要的 UI 实体, 产品查询 -> 产品详细/产品跑单情况/产品相关资料.

# 项目结构
- FE-main:
  - 
- BE-server:
  - src/utils: 通用工具函数, 如哈希函数, 加密函数, 解析函数等. 不存放业务相关逻辑.
  - src/models: 数据库表模型.
  - modules 及 services 文件管理结构中的 scope 定义: 根据外部服务分组, 如 Poole, Wishing 等.
  - src/modules/(scope): 管理内外部功能模块, 可能结合有一定的业务逻辑. 例子: Inngest 的初始化管理; OpenAPI 入口实例及描述; 业务相关功能部件: 如 PDF-Main 提取等.
  - src/services/(scope): 管理业务单元, 提供对外服务, 文件夹结构/成员如下:
    - index.ts: 成员统一导出, unplugin-auto-exports 自动生成.
    - xxx.logic.ts: 业务逻辑函数, 外部服务的 mapper 或纯粹的业务函数.
    - xxx.cf-do.ts: clouflare DO (Durable Object) 的类定义.
    - openapi.ts: 模块化的 hono 路由组.
    - xxx.api.ts: Chanfana-OpenAPI/Hono 的端点定义文件. (Controller/Endpoint 的角色定义).
    - xxx.webhook.ts: 业务相关 webhook 处理及定义, 与 xxx.api.ts 定位相同.
    - xxx.ingest.ts: 业务相关 Inngest Func 定义, 逻辑及类型等.

# 项目日志
- 2025-09-15: 重新整理 server 项目的文件管理结构: 因项目涉及外部模块较多, 不再按照外部服务进行分组分治, 转为按照业务模块进行分组分治.
- 2025-09-26: 完成 Poole-FTP 模块的文件组织重构并完成功能测试. & 了解 CF-DO 使用并增加支持.