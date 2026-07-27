# 09 — AI Agent Frontend Integration

**What to build:** Display AI Agent review results on the post detail page. A small badge/pill near the post title shows the overall score (e.g., "AI Review: 8/10" with color coding: green ≥ 7, yellow 4–6, red < 4). AiAgent auto-replies in the comment section are visually distinguished from user comments (different background color, small "AI" tag, robot icon). The review badge reads from the post's i_review_score and i_reviewed fields returned by the post detail API.

**Blocked by:** 05 — Frontend Browsing & Content Pages, 08 — AI Agent Backend

**Status:** ready-for-agent

- [ ] AI review score badge on post detail page (color-coded, conditional display)
- [ ] AiAgent comments styled differently from user comments (AI tag, distinct background)
- [ ] Badge shows "Reviewing..." state while ai_reviewed=2
- [ ] Badge hidden entirely when ai_reviewed=0 (not triggered, e.g., no code blocks)
