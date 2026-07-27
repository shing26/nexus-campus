# Nexus-Vibe: 从校园论坛到 AI 开发者社区

## Problem Statement

Nexus-Campus 是一个功能完整的赛博朋克校园论坛系统，拥有 Spring Boot 3.3 + MyBatis-Plus + Redis + Elasticsearch 的扎实技术栈，以及高并发点赞落盘、重力衰减热榜、滑动窗口限流、DFA 敏感词过滤等硬核能力。但它的业务定位停留在"校园 CRUD 大作业"层面——选课、二手、吐槽等板块无法在简历上体现其真实技术深度。

目标是将同一套代码底座升维为 **Vibe Coding & AI 开发者交流论坛（Nexus-Vibe）**，同时扩展 AI Agent 自动审查、LLM 语义安全检测、前后端分离等现代架构能力，让项目的技术含金量与业务叙事完全对齐。

## Solution

保留现有后端架构和所有基础设施能力（Redis 缓存/限流/热榜、Spring Event 异步机制、DFA 敏感词、JWT 认证），进行三层改造：

1. **领域迁移**：全量重命名实体和数据库表（BbsPost → VibePost, BbsCategory → Channel 等），替换校园频道为 AI 社区 7 个频道，rebrand 前端为开发者社区风格
2. **功能升级**：前后端分离（React + Vite + Tailwind），新增 AI Co-pilot Agent（异步 LLM Code Review + 自动回帖），代码/Prompt 渲染增强
3. **安全增强**：在 DFA 快速筛查基础上增加异步 LLM 语义审查（四分类 + 按类差异化处理）

## User Stories

### Phase 1 — 领域迁移

1. As a **visitor**, I want to see channels named after AI community topics (Prompt 工坊、Agent 实战等), so that the site purpose is immediately clear
2. As a **returning user**, I want existing posts/comments to remain accessible after migration, so that no data is lost
3. As an **admin**, I want the announcement channel to be read-only for regular users, so that only admins can post system updates
4. As a **developer browsing the codebase**, I want entity names to match the domain language (VibePost, Channel, VibeComment), so that I don't have to mentally map BBS names to AI concepts

### Phase 2a — 前端重写

5. As a **user**, I want to browse hot posts and channels on the landing page, so that I discover interesting content quickly
6. As a **user**, I want to navigate by channel slug (e.g., /channel/prompts), so that URLs are readable and shareable
7. As a **user**, I want to search posts by keyword and see results on a dedicated /search page, so that I can find relevant content
8. As a **user**, I want to view post detail with syntax-highlighted code blocks and a one-click copy button, so that I can reuse code snippets easily
9. As a **user**, I want to create posts using a Markdown editor with code block insertion support, so that I can format code-rich content
10. As a **user**, I want to see an estimated token count while writing, so that I can gauge prompt/code length
11. As a **user**, I want to log in/register via the SPA, so that the auth flow is seamless without page reloads
12. As an **admin**, I want an admin layout with a sidebar for audit queue and dashboard, so that moderation workflows are efficient

### Phase 2b — AI Agent

13. As a **user**, when I post a VibePost containing code blocks, I want an AI Agent to automatically review my code and post a structured comment, so that I get immediate feedback on code quality and security
14. As a **user**, I want to see an AI review badge on the post detail page showing the overall score, so that I can quickly assess the review result without scrolling to comments
15. As a **user**, I want the AI review to be non-blocking — the post appears immediately, and the review arrives asynchronously, so that my publishing workflow is not slowed down

### Phase 3 — LLM 安全增强

16. As a **user**, when my post contains a Prompt injection attempt, I want it to remain visible but enter the admin audit queue, so that I'm not silently censored
17. As a **user**, when my post contains genuinely harmful content, I want it auto-hidden with a system notification explaining why, so that the community stays safe
18. As a **user**, when my post is spam, I want it auto-hidden silently (no notification), so that spammers cannot game the feedback loop
19. As an **admin**, I want to see LLM safety check results in the audit panel alongside DFA results, so that I can make informed moderation decisions

## Implementation Decisions

### Architecture

- **同仓分离部署**：前端 rontend/ 和后端 src/ 在同一个 git repo 中，各自独立构建和部署。前端构建产物部署到 Nginx，后端以 Spring Boot WAR 部署。开发期 Vite proxy 转发 /api/ 到后端。
- **前后端分离**：保留现有 REST API（/api/v1/），PageController 和 JSP 视图在 Phase 2 前端覆盖所有功能后退化为废弃状态，在 /code-review 阶段集中删除。
- **JSP 清理策略**：React 端完成 T4/T5/T6（覆盖所有用户端 + 管理端页面）并通过验收后，另开一个 cleanup ticket 删除 PageController、src/main/webapp/WEB-INF/views/ 目录以及 JSP 相关依赖（	omcat-embed-jasper、JSTL 等），简化构建配置。

### Data Model & Migration

- **全量 RENAME TABLE**：bs_post → ibe_post，bs_category → ibe_channel，bs_comment → ibe_comment，bs_tag → ibe_tag，bs_post_tag → ibe_post_tag。sys_user 和 sys_message 保持不变。
- **Java 类同步重命名**：BbsPost → VibePost，BbsCategory → Channel，BbsComment → VibeComment，BbsTag → VibeTag
- **ibe_channel 新增 slug 字段**（varchar 50, unique），用于前端路由 /channel/:slug
- **ibe_post 新增字段**：code_snippets（text, JSON）, i_reviewed（tinyint）, i_review_score（int）, 	oken_count（int）
- **新增 i_review_log 表**：存储 LLM 安全审查和 AI Agent Code Review 记录
- **新增 Channel 后端 API**：GET /api/v1/channels 返回含 slug/id 映射的频道列表；帖子列表 API 增加 ?channelSlug=prompts 参数

### Channels

7 个频道：社区公告(announcements, 管理员只读)、Prompt 工坊(prompts)、作品展示(showcase)、Agent 实战(agents)、Vibe Coding 经验(vibe-coding)、代码急诊室(debug)、资源聚合(resources)。

### Frontend

- **Tech stack**：React 18 + Vite + React Router + Tailwind CSS + TypeScript
- **State**：TanStack Query（服务端缓存 + 乐观更新） + Zustand（客户端状态：auth, UI）
- **Layouts**：MainLayout（Navbar + Outlet + Footer）for user-facing pages；AdminLayout（sidebar + content）for admin pages
- **Routes**：/, /channel/:slug, /post/:id, /post/new, /post/:id/edit（预留）, /search?q=, /login, /register, /user/:id, /user/settings, /user/messages, /admin/audit, /admin/dashboard
- **Nginx**：反向代理 /api/ 到后端；SPA fallback（所有非 API 路由 → index.html）

### AI Agent

- **Pre-set account**：sys_user 中预置 AiAgent 账号（ole=AI_AGENT），密码随机不可登录
- **Event-based**：AiReviewEvent 在 VibePostService.createPost() 中发布，由 AiReviewEventListener（@Async）消费
- **Trigger**：仅检测帖子中是否包含 fenced 代码块（`），纯文本帖子跳过
- **Output**：结构化 Markdown 四段式——评分(score)、代码质量(quality)、安全隐患(security)、优化建议(suggestions)
- **Display**：自动以 AiAgent 身份回帖（全文）+ 帖子详情页顶部显示评分徽章
- **LLM client**：OpenAI 兼容接口，通过配置切换端点。System Prompt 固定模板。30s 超时，失败静默降级。

### LLM 安全审查

- **DFA first**：同步 DFA 检查保持原逻辑（毫秒级），通过后异步提交 LLM
- **Four classes**：Prompt 注入（→ PENDING_REVIEW + 审核队列）、不当内容（→ status=3 + 通知作者）、垃圾广告（→ status=3 + 不通知）、安全（→ 仅写日志）
- **Non-blocking**：LLM 异常不影响主流程，帖子始终可见或按 DFA 结果处理

## Testing Decisions

### Testing seams（从高到低排列）

1. **API 集成测试**（最优先）— @SpringBootTest + MockMvc，测试完整的发帖 → AI 审查 → 自动回帖流程。这是覆盖用户端到端体验的最高层 seam。
2. **Service 单元测试** — AiReviewService mock HTTP 调用，验证 LLM 响应解析逻辑；SensitiveWordService 验证四分类路由逻辑
3. **Listener 测试** — AiReviewEventListener 和 AiSafetyCheckListener 验证事件触发 + 异常降级
4. **前端组件测试** — CodeBlock（渲染 + 复制）、TokenCounter（估算准确性）、ReviewBadge（评分显示）
5. **前端 API 集成** — MSW mock API，验证 TanStack Query 缓存和乐观更新

### Testing principles

- 测试外部行为，不测实现细节
- LLM 调用用 mock，不依赖真实 API endpoint
- 异常路径必须覆盖：LLM 超时、Redis 不可用、无效响应格式
- 前端组件优先测试渲染输出和用户交互，不测试内部状态
- 现有测试（如 LikeCounterService 测试）保持不动，只新增

## Out of Scope

- Elasticsearch 搜索增强（保持现有集成，不作改动）
- Docker 部署配置（前端 Nginx 部署配置延后到实施阶段解决，不在 spec 中预设计）
- 移动端原生 App
- 第三方 OAuth 登录（GitHub/Google）
- 帖子富文本编辑器（使用基础 Markdown Textarea + 预览，不引入 ProseMirror 等重量级编辑器）
- 国际化（i18n）

## Further Notes

- 所有 LLM 调用通过配置开关 campus.ai.review.enabled 控制，可在 dev 环境关闭
- .env 文件管理 LLM_API_KEY，不提交到 git
- 前端项目初始化用 create-vite，TypeScript strict 模式
- "社区公告（Announcements）"频道只在后端层面限制发帖权限；前端隐藏"发帖"按钮作为辅助
- 项目名更新：README、pom.xml（<name>）、Swagger 配置中的项目名称同步改为 Nexus-Vibe

