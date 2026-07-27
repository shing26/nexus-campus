# 08 — AI Agent Backend

**What to build:** The asynchronous AI Code Review pipeline. Create AiReviewEvent (extending ApplicationEvent) published after a VibePost is created. Create AiReviewEventListener with @Async that detects code blocks in the post content, invokes the LLM for review, and posts a structured comment as the AiAgent user. Create LlmClient using Spring Boot 3 RestClient wrapping an OpenAI-compatible chat completion endpoint. Create AiReviewService orchestrating the review logic (code extraction, LLM call, response parsing, comment creation). Add i_review_log table for audit trail. Pre-set AiAgent system account in seed data with role AI_AGENT and a non-login password. All failures degrade silently (log + skip) without affecting the main post-creation flow.

**Blocked by:** 01 — Entity Wide Refactor

**Status:** ready-for-agent

- [ ] AiReviewEvent + AiReviewEventListener (@Async, non-blocking)
- [ ] LlmClient: OpenAI-compatible HTTP client, configurable endpoint/model/key, 30s timeout
- [ ] AiReviewService: code block detection, LLM prompt construction, response parsing
- [ ] ai_review_log table + entity + mapper
- [ ] AiAgent system account in seed data (role=AI_AGENT, non-login password)
- [ ] Auto-comment: post review result as AiAgent user comment
- [ ] Graceful degradation: LLM timeout/failure logs warning, does not crash post flow
- [ ] Config: campus.ai.review.enabled toggle, model, endpoint, key
