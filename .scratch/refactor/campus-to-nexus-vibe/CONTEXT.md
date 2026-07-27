# Nexus-Campus -> Nexus-Vibe 改造交接上下文

## 变更入口
- 改造分支：`refactor/nexus-vibe`
- 基线：`baseline/campus`（`53bd8ba`）
- 原始主分支：`master`，冻结不动，仅作参考/回滚用

## 改造目标
把现有校园论坛骨架，重构为 **Nexus-Vibe：面向 AI/Vibe Coding 开发者的交流社区**。

不推倒重来的原因：
- 技术栈现代且可用：Spring Boot 3.3.5、MyBatis-Plus 3.5.9、Redis、MySQL、Elasticsearch 8.13.4
- 关键能力已有可运行实现：异步事件、点赞 Write-Behind、热度衰减、限流、DFA 敏感词
- 业务域轻量，适合“置换语义，保留骨架”

## 一、直接复用，不改结构
- event: `MessageEvent` + `MessageEventListener`
  - 当前职责：点赞/评论后写 `sys_message` + 维护 Redis 未读 Hash
  - 改造后职责：保持不变，仅增加消息类型枚举，不做删除
- service: `LikeCounterService` + `task/LikeSyncTask`
  - Redis Set 去重 + Lua toggle + dirty set + 每 5 分钟异步同步 MySQL
  - Redis 故障时直接写 MySQL 降级
- service: `PostRankingService`
  - 重力衰减公式 + Redis ZSet 小时级重算 + 7 天窗口
  - Redis 故障时降级 MySQL 排序
- config: `RateLimitInterceptor`
  - Redis + Lua 滑动窗口限流
  - 60s / 10 次，作用于发帖/评论
- util/service: `DfaFilter` + `SensitiveWordService`
  - DFA Trie 检测 + Redis Pub/Sub 热更新
  - REGULAR 就地替换，CRITICAL 进审核队列
- config: `AsyncConfig`
  - 线程池已就绪，供后续 Agent / LLM 回调使用
- resources/lua 目录
  - 继续复用，新增脚本直接放这里

## 二、明确要新增的模块
### 2.1 AI Reviewer Agent（最小闭环）
目的：用户发帖后 1 秒内获得 AI 代码审查/建议评论，主接口 RT 不增。

实现原则：
- 不改 `BbsPostService.createPost` 主链路
- 基于现有 Spring Event 新增 `AiReviewEvent`
- 新增 `AiReviewEventListener`，`@Async` 调用 LLM，结果写为系统评论并触发消息通知

依赖确认：
- 需要一个 LLM API Key / 客户端封装（待配置到 `.env`，见 TODO）

### 2.2 语义增强的双层安全治理
- 第一层：保留现有 DFA，毫秒级筛查通过后放行业务写入
- 第二层：异步提交轻量 LLM，做 Prompt 注入 / 合规语义二次判定
- 违规则更新帖子状态为 `PENDING_AUDIT` 或标记，不阻断主流程

### 2.3 渲染增强（延后，建议 Phase 2/3）
- 帖子详情支持 Markdown 代码块高亮 + 一键复制
- Token 数量粗略估算可独立成工具页
- Diff 对比视图可独立成小工具，不阻塞主线

## 三、明确要替换的“校园语义”
- `BbsCategory` 现有值：选课、二手、吐槽等校园板块
- 替换为：Prompt Templates、Agent Showcase、Vibe Coding、Debug Help 等
- 替换方式：优先在 `BbsCategory` 中加新记录；若原记录是硬编码枚举，再落地枚举修正
- 前端菜单/文案同步替换为 AI 社区语境

## 四、明确不动的部分
- 用户体系 `SysUser`
- 权限校验 `JwtAuthFilter`
- 评论/消息数据模型
- 管理员后侧基本 CRUD
- 容器化 `Dockerfile` / `docker-compose.yml`
- Elasticsearch 基础检索结构

## 五、改造顺序
### Phase 1：业务语义替换，不扩功能
- 更新 `BbsCategory` 默认数据
- 修正前段导航文案
- 目标：系统仍是原功能，但呈现为 AI 社区

### Phase 2：接入 AI Reviewer Agent
- 新增 `AiReviewEvent`
- 新增 `AiReviewEventListener`
- 接入 LLM 客户端和最小 prompt
- 去掉 TODO，连接真实 Endpoint

### Phase 3：安全治理 + 渲染增强
- 落 LLM 异步审查链路
- 增加 Markdown/代码块展示增强
- Token 估算 / Diff 工具页

## 六、交接清单（给下一位开发者/自己）
- [ ] 确认 `.env` 中已配置 LLM API Key，并接入 `LLMClient`
- [ ] 确认 `BbsCategory` 枚举值/默认数据已替换为 AI 社区分类
- [ ] 确认 `AiReviewEvent` 触发位置（建议发帖成功后 `publishEvent`）
- [ ] 确认 `AiReviewEventListener` 异常处理：LLM 超时/异常应只记日志，不影响主流程
- [ ] 确认 `SensitiveWordService` 改造入口：发帖成功后 publish `LlmAuditEvent`
- [ ] 前端代码块复制/高亮优先放在帖子详情页
- [ ] 暂不对 Docker / ES 做破坏性调整
- [ ] 提交信息风格：`feat/refactor/vibe-*`
- [ ] 每个 Phase 结束后更新本文件变更记录区

## 七、风险与已知限制
- JSP 层会影响富前端体验；本次改造不做彻底替换，只做最小增强
- ES 当前实现待确认是否真正接入；若未接入，热点搜索先走 MySQL/ZSet
- `.env.example` 中敏感信息不应提交，确认 CV / Key 策略
