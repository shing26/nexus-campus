# P0 Optimization Tickets

Source: PM (Russell) + UX (Maxwell) meeting, 2026-08-03.
North star: users completing their first feedback loop within the first month.
Status: all P0 tickets implemented and verified on 2026-08-03.

## T1 - Homepage Mission Entrances + Empty-state Guidance

**Scope:** first screen must let a new visitor start a task without scrolling.

- Add four task entrances on the homepage: Debug, Prompt, Showcase, Fork.
  - Debug -> `/post/new?template=debug`
  - Prompt -> `/post/new?template=prompt`
  - Showcase -> `/post/new?template=showcase`
  - Fork -> `/channel/prompts`
- Each entrance links into the matching creation flow or channel and is
  clickable on mobile and desktop.
- Channel / search / feed empty states include a guided action instead of a
  bare "no posts" line (e.g. "Publish the first Prompt").

**Acceptance:**
- New user can click any of the four entrances on the first viewport.
- Empty channel shows a contextual call to action with a template link.

**Files:** `frontend/src/pages/HomePage.tsx`, `frontend/src/components/EmptyState.tsx`,
`frontend/src/pages/ChannelPage.tsx`.

## T2 - Creation Template Wizard + AI Review Status Visibility

**Scope:** a non-technical user should be able to publish a useful post in
under three minutes, and the AI review lifecycle must be visible.

- `CreatePostPage` supports `?template=debug|prompt|showcase|agents`: selecting
  a template prefills channel, post type, title placeholder, and a Markdown
  scaffold, then the user fills the gaps and publishes.
- Template switcher lives at the top of the studio as a segmented control.
- `PostDetailPage` polls the post while AI review is pending:
  - no code block -> no AI review shown
  - code block + `aiReviewed=0` -> "AI Agent reviewing..." status
  - `aiReviewed=1` -> score + full `AiReviewTerminal`
- Score display is normalized consistently across cards and detail page.

**Acceptance:**
- Opening any template and publishing takes three minutes or less.
- A code-block post shows queued/reviewing state before the AI comment lands.

**Files:** `frontend/src/pages/CreatePostPage.tsx`,
`frontend/src/pages/PostDetailPage.tsx`, `frontend/src/components/PostCard.tsx`.

## T3 - Search & Filter

**Scope:** search results can be narrowed by channel, language, AI review
score, and sort order, with a guided empty state.

- Backend `GET /api/v1/posts` accepts `channelSlug`, `language`, `aiScoreMin`,
  `type`, and `sort` (`latest` | `hot` | `ai`) and combines them with `keyword`.
- Search page renders a filter bar (channel, language, AI score, sort) that
  syncs with URL query params.
- Empty results show guidance to adjust filters or publish a Prompt.

**Acceptance:**
- Filtering by language / AI score / channel returns correct posts.
- Reloading a filtered search URL preserves the filters.
- Empty result state includes at least one actionable link.

**Files:** `src/main/java/com/nexus/campus/controller/PostController.java`,
`src/main/java/com/nexus/campus/service/VibePostService.java`,
`src/main/java/com/nexus/campus/service/impl/VibePostServiceImpl.java`,
`src/main/java/com/nexus/campus/mapper/VibePostMapper.java`,
`frontend/src/pages/SearchPage.tsx`.
