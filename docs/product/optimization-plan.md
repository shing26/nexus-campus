# Nexus-Vibe Optimization Plan: Feedback Loop v2

Source: PM (Alex) + product discussion, 2026-08-03.
Session: 1-2 engineers, one development session.
North star: users complete their first meaningful feedback loop: publish -> AI feedback -> community response -> return.

Execution order:
1. P1: AI Review Explainability.
2. P1: User Profile Activity Workspace.
3. P2: Real Event Notification Inbox (stretch; cut first if capacity tightens).

## P1 - AI Review Explainability

Owner: 1 backend + 1 frontend.
Metric: 100% of AI-reviewed code posts render structured findings instead of fake/default summary text.
Horizon: this session.

### Problem

PostDetail already polls AI review status and shows a score, but `AiReviewTerminal` only receives one markdown comment string and falls back to hard-coded summary text. The real structured review output (`score`, `severity`, `codeQuality`, `securityConcerns`, `optimizationSuggestions`) already exists in `ai_review_log.result_json`, but is not exposed. Users cannot understand why a post scored what it did, which weakens the core AI feedback loop.

### Proposed Solution

Backend:
- Add an `AiReviewDetail` DTO with `postId`, `reviewer`, `score`, `severity`, `isApproved`, `codeQuality`, `securityConcerns`, `optimizationSuggestions`, and `reviewedAt`.
- Add `GET /api/v1/agent-logs/post/{postId}/latest` to `AiLogController`.
- Add a mapper method to select the latest `code-review-agent` log for a post.
- Parse `result_json` with Jackson and tolerate legacy/seed values such as `{"score":9,"severity":"low"}` by defaulting missing sections to empty strings.

Frontend:
- Add `AiReviewDetail` to `frontend/src/types/post.ts`.
- In `PostDetailPage`, query the new endpoint when `post.aiReviewed === 1` and the post contains a code block.
- Redesign `AiReviewTerminal` to render the real score, severity badge, verdict, and labeled Code Quality / Security / Suggestions sections.
- Remove the fake default summary; if no structured review exists, show no terminal or a minimal "AI review data unavailable" state.
- Keep the existing pending "AI Agent reviewing..." state unchanged.

Affected files:
- Backend: `src/main/java/com/nexus/campus/dto/AiReviewDetail.java`, `src/main/java/com/nexus/campus/agent/AiReviewLogMapper.java`, `src/main/java/com/nexus/campus/controller/AiLogController.java`.
- Frontend: `frontend/src/types/post.ts`, `frontend/src/pages/PostDetailPage.tsx`, `frontend/src/components/AiReviewTerminal.tsx`.

Backend API needs:
- `GET /api/v1/agent-logs/post/{postId}/latest` returns `ApiResponse<AiReviewDetail>` or `null` when no code-review log exists.
- Do not expose raw `resultJson` in list responses unless already present; keep the new DTO as the parsed contract.

Acceptance criteria:
- A reviewed code post shows actual score, severity, verdict, quality, security, and suggestions from the latest code-review log.
- A post without a code-review log does not show fabricated AI text.
- Legacy review rows with partial JSON render without 500 errors.
- `npm run build` passes.
- Add or extend a backend integration test for the new endpoint.

Effort: M

## P1 - User Profile Activity Workspace

Owner: 1 backend + 1 frontend.
Metric: any user with content sees contribution stats and a clickable recent activity timeline on their profile.
Horizon: this session.

### Problem

`UserProfilePage` is a static header plus a post list. In a Vibe Coding community, the profile is the natural proof-of-work surface, but it hides comments, likes received, AI review quality, forks, and version activity. Users cannot quickly evaluate another member's contributions or return to their own work.

### Proposed Solution

Backend:
- Add `UserProfileSummary` DTO with public user fields, stats, and a merged recent activity list.
- Add `GET /api/v1/users/{id}/summary` to `UserController`.
- Stats: post count, comment count, total likes received, average AI review score on reviewed posts, fork count, and prompt version count.
- Recent activity: merge the latest 10 items from the user's posts, comments, and prompt versions in service code, each with `type`, `postId`, `title`, and `createdAt`.
- Add small mapper queries for comment count by user, user post stats, user fork count, and user version count.

Frontend:
- Rebuild `UserProfilePage` around the summary endpoint using TanStack Query.
- Keep the profile header, then add a dense stat strip and a recent activity timeline with lucide icons and links to posts.
- Keep the existing published posts list, but use compact rows with channel, age, AI score, and like/comment counts.
- Add clear empty states for users with no posts or no activity.

Affected files:
- Backend: `src/main/java/com/nexus/campus/dto/UserProfileSummary.java`, `src/main/java/com/nexus/campus/controller/UserController.java`, `src/main/java/com/nexus/campus/mapper/VibePostMapper.java`, `VibeCommentMapper.java`, `PromptVersionMapper.java`.
- Frontend: `frontend/src/pages/UserProfilePage.tsx`, `frontend/src/types/post.ts` or a new `frontend/src/types/profile.ts`.

Backend API needs:
- `GET /api/v1/users/{id}/summary` returns user info plus `stats` and `recentActivity`.
- Average AI score excludes unreviewed posts; returns `0` or `null` when no reviewed posts exist.
- All recent activity rows must be linkable to a post id.

Acceptance criteria:
- Profile for seeded user `shing` shows post/comment/like/version stats and recent activity.
- Activity rows link to the correct post detail pages.
- Empty profiles show useful empty states, not broken stats.
- Posting, commenting, or adding a prompt version makes the corresponding activity appear without manual seeding.
- Add or extend backend service tests for stats aggregation.

Effort: L

## P2 - Real Event Notification Inbox

Owner: 1 backend + 1 frontend.
Metric: comments, likes, and AI review completions generate unread inbox rows for the author; badge count matches the database.
Horizon: this session.

### Problem

The Messages page exists but is not a real notification surface: comments insert rows directly, likes and AI review completions do not publish events, system messages are mislabeled as comments, the navbar has no unread badge, and `MessageEvent.targetId` is not represented in the UI. Users get no reliable signal that someone responded or that AI finished reviewing their work.

### Proposed Solution

Backend:
- Standardize `sys_message.type` as: `1=like`, `2=comment`, `3=system`, `4=ai_review`.
- Route comment, like, fork, and AI review notifications through the existing `MessageEvent` -> `MessageEventListener` path instead of direct inserts where practical.
- Publish events from `VibeCommentServiceImpl`, `LikeCounterService` (only on a successful like add, never unlike or self-like), `VibePostServiceImpl.forkPrompt`, and `AiReviewEventListener` after review completes.
- Format notification content with a post link, e.g. `Alice replied to your post: [Title](/post/101)`, so the existing `content` column can carry the target without a schema migration.
- Fix `SysMessageServiceImpl.sendMessage` so system messages keep type `3`.
- Fix the divergent Redis unread-key handling in `MessageEventListener` or remove it; use the DB unread count as the source of truth.
- Extend `GET /api/v1/messages` response with `typeLabel` and, when parseable, `targetPath` derived from content.

Frontend:
- Redesign `MessagesPage` into an inbox with All / Comments / Likes / AI / System tabs, type icons, relative timestamps, mark-read-on-open, and a mark-all-read action.
- Render notification content with `ReactMarkdown` so post links are clickable.
- Add a small TanStack Query hook or inline query for `GET /messages/unread/count` in `Navbar`; poll every 60 seconds and refresh after opening the inbox.
- Show a count badge on the Mail icon for authenticated users.

Affected files:
- Backend: `src/main/java/com/nexus/campus/event/MessageEvent.java`, `MessageEventListener.java`, `service/MessageNotificationService.java`, `service/impl/SysMessageServiceImpl.java`, `service/impl/VibeCommentServiceImpl.java`, `service/LikeCounterService.java`, `service/impl/VibePostServiceImpl.java`, `agent/AiReviewEventListener.java`, `controller/MessageController.java`, `entity/SysMessage.java`.
- Frontend: `frontend/src/pages/MessagesPage.tsx`, `frontend/src/components/Navbar.tsx`, `frontend/src/api/useUnreadMessages.ts` (new), `frontend/src/types/post.ts` or a new notification type file.

Backend API needs:
- `GET /api/v1/messages` returns enriched rows without requiring a schema migration.
- `GET /api/v1/messages/unread/count` and existing read endpoints remain unchanged.
- No new notification transport; polling only.

Acceptance criteria:
- A new comment, first like, fork, and AI review completion creates an inbox row for the post author.
- Clicking a notification link opens the post and marks the row read.
- The navbar badge shows the correct DB unread count and clears after read-all.
- System rejection messages display under the System tab, not Comments.
- No new DB table or column is introduced.
- Add or extend message service tests for event mapping and type labels.

Effort: L

## Non-Goals

- No new DB tables, schema columns, Flyway/Liquibase migrations, or migration tooling.
- No auth/role overhaul, email push, websocket/SSE, or third-party notification provider.
- No full mobile responsiveness pass, landing page, marketing copy, or admin dashboard analytics.
- No prompt marketplace redesign, new ranking algorithm, or Elasticsearch changes.
- No attempt to fix the pre-existing MySQL fallback like-toggle semantics unless it blocks notification acceptance criteria.

## Verification

- Backend: `mvn test`
- Frontend: `cd frontend && npm run build`
- Manual QA:
  1. Log in as `shing/123456`.
  2. Post a code block, wait for AI review, and confirm the detail page shows structured quality/security/suggestions.
  3. Open a seeded user profile and confirm stats and activity links.
  4. Have another user comment and like a post; confirm inbox rows, link target, and navbar badge.
  5. Confirm old seed messages still render without errors.

