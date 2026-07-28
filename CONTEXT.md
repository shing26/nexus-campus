# Nexus-Vibe

A Vibe Coding & AI 开发者交流论坛，由赛博朋克校园论坛 Nexus-Campus 改造而来。
核心定位是内容沉淀、交互讨论与 AI 辅助编程实践分享。

## Language

**VibePost**:
论坛的核心内容单元，代表一篇包含代码、Prompt 或 AI 实践经验的帖子。
_Avoid_: BbsPost, Post, Article

**Channel**:
帖子的分类归属，每个 Channel 有唯一的 slug 标识和数字 id。Slug 用于前端路由，id 用于后端 API 查询。
包括：社区公告(announcements)、Prompt 工坊(prompts)、作品展示(showcase)、Agent 实战(agents)、Vibe Coding 经验(vibe-coding)、代码急诊室(debug)、资源聚合(resources)。
_Avoid_: BbsCategory, Category, Board

**ReviewEvent**:
用户发布 VibePost 时触发的异步事件，驱动 AI Agent 进行 Code Review 或 Prompt 评估。
_Avoid_: ReviewTask, AuditEvent

**AiAgent**:
系统内置的 AI 机器人角色，有实体账号（role=AI_AGENT），可自动回帖、执行 Code Review、进行语义安全检测。
_Avoid_: Bot, AutoReviewer

**CodeSnippet**:
VibePost 中提取出的可执行或可审查的代码片段（以 ` 标记提取），以 JSON 数组形式存储在 ibe_post.code_snippets 字段。
_Avoid_: CodeBlock, Attachment

**VibeComment**:
对 VibePost 的回复，包含普通用户评论和 AI Agent 自动生成的审查评论。
_Avoid_: BbsComment, Reply

## Channels

- **announcements**: 系统公告、更新日志（仅管理员发帖）
- **prompts**: System Prompt 设计、Chain-of-Thought、少样本技巧
- **showcase**: Vibe Coding 成品展示：网页、工具、自动化流程
- **agents**: Multi-Agent、工具调用、OpenClaw/Codex 使用心得
- **vibe-coding**: 上下文控制、幻觉治理、架构设计的纯经验讨论
- **debug**: 贴报错上下文，社区或 AI Agent 协助分析
- **resources**: 工具链推荐、API 评测、教程链接

## Frontend Architecture

**Layouts**:
- MainLayout: Navbar（Logo + 频道导航 + 搜索框 + 用户菜单）+ Outlet + Footer，覆盖用户端所有页面
- AdminLayout: 左侧边栏 + 右侧内容区，不含 Navbar/Footer，用于管理后台

**State**:
- TanStack Query: 服务端状态（帖子、评论、频道列表、缓存/自动重新验证/乐观更新）
- Zustand: 客户端状态（token、当前用户、UI 开关）

**Routes**:
- / → 首页
- /channel/:slug → 频道帖子列表
- /post/:id → 帖子详情
- /post/new → 发帖
- /post/:id/edit → 编辑帖子（预留）
- /search?q=xxx → 搜索结果
- /login, /register → 认证
- /user/:id, /user/settings → 用户
- /admin/audit, /admin/dashboard → 管理

## AI Agent Review

- 触发：仅带代码块（`）的帖子
- 内容：结构化四段——评分、代码质量、安全隐患、优化建议
- 展示：自动回帖（全文）+ 帖子详情页评分徽章

## LLM 语义安全审查

四分类 + 按类处理：

| 分类 | 处理 |
|------|------|
| Prompt 注入 | 帖子可见，标记 PENDING_REVIEW，入审核队列 |
| 不当内容 | 自动隐藏（status=3），系统消息通知作者 |
| 垃圾广告 | 自动隐藏（status=3），不通知 |
| 安全 | 仅写入 ai_review_log |
