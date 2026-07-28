# 10 — LLM Safety Backend

**What to build:** DFA pass-through → async LLM semantic safety check. After a VibePost passes the synchronous DFA filter, publish AiSafetyCheckEvent. AiSafetyCheckListener (async) calls the LLM with a safety-focused system prompt to classify the post as one of four categories: Prompt injection, Harmful content, Spam, or Safe. Implement the per-class handling policy: Prompt injection → set post status to PENDING_REVIEW + insert into audit queue; Harmful content → set status=3 (Rejected) + send system notification to author; Spam → set status=3 + no notification; Safe → write log entry only. Reuses LlmClient from ticket 08 (or creates a parallel lightweight client if 08 is delayed). All failures degrade silently.

**Blocked by:** 01 — Entity Wide Refactor, 08 — AI Agent Backend (LlmClient reuse)

**Status:** ready-for-agent

- [ ] AiSafetyCheckEvent + AiSafetyCheckListener (@Async, non-blocking)
- [ ] Safety-focused system prompt for LLM call
- [ ] Four-class response parsing + per-class routing logic
- [ ] Per-class handling: PENDING_REVIEW / status=3+notify / status=3+silent / log-only
- [ ] Integration with existing DFA pass-through (safety check only runs after DFA passes)
- [ ] ai_review_log records all safety check results
- [ ] Graceful degradation: LLM failure logs warning, does not affect post visibility
