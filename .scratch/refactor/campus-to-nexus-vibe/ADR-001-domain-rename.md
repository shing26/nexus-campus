# ADR-001 业务域重构：从 Nexus-Campus 到 Nexus-Vibe

## 状态
Accepted

## 背景
现有项目已具备论坛核心骨架（用户/帖子/评论/标签/分类、Redis、异步事件、热度、限流、敏感词）。但业务语义仍是校园场景。目标是将其转向 AI 开发者交流社区，同时强化高并发与 AI Agent 能力，用于提升项目含金量与简历叙事。

## 决策
基于现有项目继续演进，不新建。改造分支：`refactor/nexus-vibe`，基线：`baseline/campus`（`53bd8ba`）。

## 理由
- 技术栈较新，依赖可用性高。
- 关键能力已有可运行实现：消息事件、异步线程、DFA、限流、热度排序、点赞缓冲。
- 业务域处于轻量状态，更适合“置换语义，保留骨架”。

## 影响范围
- `BbsCategory`：替换校园板块为 AI 社区板块
- `BbsTag`：保留结构，复用语义
- 前端菜单/文案：按新业务语义同步替换
- 消息/通知文案：微调社区语境

## 新增能力
- AI Reviewer Agent：基于 `AiReviewEvent` + `AiReviewEventListener`
- LLM 语义审查：在 DFA 通过后增加异步 LLM 判定
- 渲染增强：Markdown 代码块 / Token 估算 / Diff 对比，延后接入

## 不改变的部分
- `SysUser`、JWT、评论/消息模型
- 容器化与 ES 基础结构

## 验证方式
- 改造前后发帖/评论主接口 RT 对比
- Redis ZSet 热榜分页正常返回
- 限流与敏感词双通道仍可拦截
- AI Reviewer 回帖在成功场景下 1 秒内出现
- LLM 语义审查异常不影响主流程

## 修订记录
- 2026-07-26：初稿 Accepted，绑定改造分支与 Phase 计划
