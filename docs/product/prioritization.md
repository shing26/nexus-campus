# Nexus-Vibe Prioritization Verdict

Date: 2026-08-03
Scope: one development session, 1-2 engineers.

## RICE

Lightweight RICE: Reach = affected users per month at current community scale, Impact = 0.25-3, Confidence = estimate confidence, Effort = engineer-days. Scores are relative, not absolute.

| Item | Reach | Impact | Confidence | Effort | RICE |
| --- | ---: | ---: | ---: | ---: | ---: |
| AI Review Explainability | 60 | 2.5 | 90% | 2.5 | 54.0 |
| User Profile Activity Workspace | 80 | 1.8 | 70% | 4 | 25.2 |
| Real Event Notification Inbox | 80 | 2.2 | 45% | 5 | 15.8 |

Confidence for notifications is low because like attribution is not persisted in the current schema.

## Feasibility Checks

- `ai_review_log.result_json` exists: confirmed in `AiReviewLog`, `schema.sql`, and seed data.
- Comments/likes/fork/event path: partial. Comments already insert a `sys_message` row directly, but there is no like/fork/AI-review notification path, and `MessageEvent.targetId` is not persisted.
- `UserProfilePage` already fetches posts: confirmed. It calls `/users/{id}` and `/posts?userId={id}` in `useEffect`, without TanStack Query or stats.

## Hidden Dependencies

- `AiReviewLogMapper` only has a latest safety-check query. Add a `code-review-agent` latest-log query and a shared tolerant Jackson parser for `result_json`; legacy values can be malformed or partial, not just missing fields.
- Seed prompt posts do not populate `vibe_post.ai_reviewed` or `ai_review_score`. Profile AI stats should be derived from the latest code-review logs for the user's posts, not from the post column alone.
- Profile metrics need explicit definitions before implementation: active posts only, comments with `status = 1`, likes as `SUM(vibe_post.like_count)`, forks received vs forks created, and versions by user vs versions on the user's posts.
- Like notifications cannot be made reliable without a schema change or a new attribution store. The Redis set can identify members only when Redis is available, `likePost` does not return add/remove status, and the MySQL fallback blindly increments the count. The "first like" acceptance criterion is not feasible under the no-migration constraint.
- `sys_message.type` semantics are inconsistent: comment creation writes type 1, seed rows use type 2, and the event listener maps anything non-like to comment. `MessageEvent.targetId` is not stored anywhere, so the plan's content-based link approach is pragmatic but must be implemented deliberately.
- The proposed type list has no fork type. Either map forks to system notifications or add type 5 and a corresponding UI tab; otherwise the inbox tabs and event mapping do not match the acceptance criteria.
- Redis unread handling is divergent: `MessageNotificationService` uses `msg:unread` keyed by user, while `MessageEventListener` uses `msg:unread:{userId}` keyed by message type. The DB count endpoint already exists and should be the source of truth.
- `markAsRead` has no recipient-ownership check. If the inbox is touched, pass `currentUserId` through and verify `toUserId` before marking read.

## Final Execution Order

1. **P1 - AI Review Explainability** (`M`): highest RICE, smallest scope, removes the fabricated terminal output, and creates the parser/mapper needed by profile stats.
2. **P1 - User Profile Activity Workspace** (`L`): proof-of-work surface with real stats and activity, but only after the AI review parser is stable so profile AI stats reuse it.
3. **P2 - Real Event Notification Inbox** (`L`): defer out of this session. It is broad, touches shared event/service code, and is blocked by the unresolved like-attribution constraint.

Do not start item 3 unless both P1 items are complete and verified. If profile work gets tight, cut recent likes/forks activity first and keep posts, comments, versions, and counts.

## Design Priorities

- **AiReviewTerminal**: render real score, severity, verdict, Code Quality, Security, and Suggestions from the new structured endpoint. Preserve the existing terminal motif and pending review state; never fall back to fabricated summary text.
- **UserProfilePage**: keep the profile header, add a dense stat strip and a clickable recent-activity timeline, then compact post rows. Use the existing vibe dark theme, lucide icons, and Tailwind utility classes; include useful empty states.
- **MessagesPage / Navbar badge (if P2 later)**: use tabbed inbox with type icons, relative timestamps, mark-read-on-open, and a Mail badge. Render links with the existing `ReactMarkdown` dependency; no new deps.

Constraints: existing vibe dark theme (`vibe-bg`, `vibe-card`, `vibe-surface`, `vibe-cyan`, `vibe-purple`, `vibe-emerald`), lucide-react, Tailwind, and no new dependencies unless necessary.

## Verification

- Backend: `mvn test`
- Frontend: `cd frontend && npm run build`
- Manual QA: reviewed code post, seeded profile, and old seed messages must render without errors.
