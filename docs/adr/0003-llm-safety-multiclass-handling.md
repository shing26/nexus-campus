# 0003 — LLM semantic safety check: multi-class + per-class handling

We chose a multi-class LLM safety check (Prompt injection / Harmful content / Spam / Safe) over a simple binary safe/unsafe classification. Each class has its own handling policy: Prompt injection posts remain visible but enter the admin audit queue (PENDING_REVIEW); harmful content is auto-hidden (status=3) with a system notification to the author; spam is auto-hidden without notification; safe posts are logged in ai_review_log with no further action.  

This per-class granularity avoids the all-or-nothing problem of binary classification — Prompt injection is often ambiguous and deserves human review, while spam and harmful content can be acted on immediately. The no-notification policy for spam prevents abusers from getting feedback on what triggered the filter.
