# 11 — LLM Safety Admin UI

**What to build:** Extend the admin audit panel to display LLM safety check results alongside the existing DFA results. Each pending post shows a "Safety Check" column with the LLM classification tag (Prompt injection / Harmful / Spam / Safe) and processing status: "Pending review" for Prompt injection flags, "Auto-hidden" for harmful/spam, "Clean" for safe. Admin can override the LLM verdict from the audit page (approve/reject).

**Blocked by:** 07 — Frontend Admin Panel, 10 — LLM Safety Backend

**Status:** ready-for-agent

- [ ] Audit panel shows LLM classification tag per post
- [ ] Color-coded status indicators for each LLM verdict class
- [ ] Admin can override LLM verdict (approve/reject from audit page)
- [ ] Safety check results visible in post detail for admins
